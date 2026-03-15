import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { FaTimes } from 'react-icons/fa'; // Import the close icon

const AdminSettingsForm = ({ onSettingsSaved }) => {
  const [founderImageUrl, setFounderImageUrl] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(''); // Stores URL for preview (local or existing Cloudinary URL)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  // Fetch existing settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setFounderImageUrl(data.founderImageUrl || '');
          setPreviewUrl(data.founderImageUrl || '');
        } else {
          // If no settings document exists, initialize empty states
          setFounderImageUrl('');
          setPreviewUrl('');
        }
      } catch (err) {
        console.error("Error fetching settings: ", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setUploadProgress(0);
    } else {
      setFileToUpload(null);
      setPreviewUrl(founderImageUrl); // Revert to existing if no new file selected
      setUploadProgress(0);
    }
  };

  const clearMedia = () => {
    setFileToUpload(null);
    setPreviewUrl('');
    setFounderImageUrl(''); // Clear the stored URL as well
    if (document.getElementById('founderFileUpload')) {
      document.getElementById('founderFileUpload').value = '';
    }
    setUploadProgress(0);
  };

  const uploadFileToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary credentials are not set in environment variables. Please check .env.local");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'mathematico_app_settings');

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, true);

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(percentCompleted);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error ? errorData.error.message : 'Cloudinary upload failed.'));
          }
        };
        xhr.onerror = () => reject(new Error('Network error during Cloudinary upload.'));
        xhr.send(formData);
      });

      return response.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error: ", uploadError);
      throw new Error(`Media upload failed: ${uploadError.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setUploadProgress(0);

    let newFounderImageUrl = founderImageUrl; // Start with current or fetched URL

    try {
      if (fileToUpload) {
        // If a new file is selected, upload it
        newFounderImageUrl = await uploadFileToCloudinary(fileToUpload);
      } else if (!previewUrl) {
        // If preview was cleared and no new file, set URL to empty
        newFounderImageUrl = '';
      }
      // If no new file and preview matches original founderImageUrl, keep founderImageUrl as is.

      const settingsData = {
        founderImageUrl: newFounderImageUrl,
        // Add other global settings here if needed later
      };

      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, settingsData, { merge: true }); // Use setDoc with merge to create or update
      setFounderImageUrl(newFounderImageUrl); // Update state to reflect saved URL
      alert('Settings updated successfully!');
      if (onSettingsSaved) {
        onSettingsSaved();
      }
    } catch (err) {
      console.error("Error saving settings: ", err);
      setError(`Failed to update settings: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setFileToUpload(null); // Clear file after successful upload/save
      if (document.getElementById('founderFileUpload')) {
        document.getElementById('founderFileUpload').value = '';
      }
    }
  };

  return (
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary">
      <h3 className="text-2xl font-bold mb-6 text-light-text">Global App Settings</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        {/* Founder/Instructor Image Upload */}
        <div className="mb-6">
          <label htmlFor="founderFileUpload" className="block text-secondary text-sm font-semibold mb-2">
            Founder/Instructor Image (Used on About & Instructor pages)
          </label>
          <input
            type="file"
            id="founderFileUpload"
            className="block w-full text-sm text-secondary
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-light-text
                       hover:file:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept="image/*"
            disabled={loading}
          />
          {previewUrl && (
            <div className="mt-4 relative w-64 h-auto max-w-full overflow-hidden rounded-lg shadow-md border border-secondary">
              <img src={previewUrl} alt="Founder profile preview" className="w-full h-auto object-cover max-h-48" />
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-1 right-1 bg-red-500 text-light-text rounded-full p-1 text-xs leading-none z-10 hover:bg-red-600 transition-colors flex items-center justify-center w-5 h-5"
                title="Remove image"
                disabled={loading}
              >
                <FaTimes />
              </button>
            </div>
          )}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-dark-background rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              <span className="text-xs text-secondary ml-2">{uploadProgress}% uploaded</span>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsForm;