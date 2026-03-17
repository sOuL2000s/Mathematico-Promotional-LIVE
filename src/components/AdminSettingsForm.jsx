import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { FaTimes, FaPlus, FaTrashAlt, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa'; // Import the close, plus, trash, and password-related icons
import { auth } from '../firebase'; // Import auth
import { sendPasswordResetEmail } from 'firebase/auth'; // Import sendPasswordResetEmail
import { useAuth } from '../context/AuthContext'; // Import useAuth

const AdminSettingsForm = ({ onSettingsSaved }) => {
  const { currentUser } = useAuth(); // Get current user
  const [founderImageUrl, setFounderImageUrl] = useState('');
  const [geminiApiKeys, setGeminiApiKeys] = useState([]); // Array to store multiple API keys
  const [newApiKeyInput, setNewApiKeyInput] = useState(''); // Input for adding a new key
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(''); // Stores URL for preview (local or existing Cloudinary URL)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showApiKeyVisibility, setShowApiKeyVisibility] = useState({}); // State to manage visibility of each API key
  const [showNewApiKey, setShowNewApiKey] = useState(false); // State to manage visibility of new API key input

  // States for password change functionality
  const [resetEmailInput, setResetEmailInput] = useState(currentUser?.email || '');
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(null); // 'true', 'false', or null

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
          setGeminiApiKeys(data.geminiApiKeys || []); // Fetch array of Gemini API keys
          // Initialize visibility state for each fetched key
          const initialVisibilityState = (data.geminiApiKeys || []).reduce((acc, _, index) => ({ ...acc, [index]: false }), {});
          setShowApiKeyVisibility(initialVisibilityState);
        } else {
          // If no settings document exists, initialize empty states
          setFounderImageUrl('');
          setPreviewUrl('');
          setGeminiApiKeys([]); // Initialize empty
          setShowApiKeyVisibility({}); // Clear visibility state
        }
      } catch (err) {
        console.error("Error fetching settings: ", err);
        setError("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [currentUser]); // Added currentUser to dependencies

  useEffect(() => {
      // Update resetEmailInput if currentUser email changes
      if (currentUser?.email) {
          setResetEmailInput(currentUser.email);
      }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setUploadProgress(0);
      setPasswordResetSuccess(null); // Clear password reset messages on other form changes
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

  const handleAddApiKey = () => {
    if (newApiKeyInput.trim() && !geminiApiKeys.includes(newApiKeyInput.trim())) {
      setGeminiApiKeys([...geminiApiKeys, newApiKeyInput.trim()]);
      setNewApiKeyInput('');
      setError(null); // Clear any previous API key related errors
    } else if (geminiApiKeys.includes(newApiKeyInput.trim())) {
      setError("This API Key already exists.");
    } else {
      setError("API Key input cannot be empty.");
    }
  };

  const handleRemoveApiKey = (keyToRemove) => {
    setGeminiApiKeys(geminiApiKeys.filter(key => key !== keyToRemove));
    setError(null); // Clear any previous API key related errors
    setPasswordResetSuccess(null); // Clear password reset messages on other form changes
  };

  const handleSendPasswordResetLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPasswordResetSuccess(null); // Reset any previous success/failure messages for password reset

    if (!resetEmailInput.trim()) {
      setError("Email address for password reset cannot be empty.");
      setLoading(false);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, resetEmailInput);
      setPasswordResetSuccess(true);
      alert(`Password reset link sent to ${resetEmailInput}. Please check your inbox (and spam folder).`);
    } catch (err) {
      console.error("Error sending password reset email:", err);
      let errorMessage = "Failed to send password reset email.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No user found with that email address. Please ensure it's your registered admin email.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      }
      setError(errorMessage);
      setPasswordResetSuccess(false);
    } finally {
      setLoading(false);
    }
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
        geminiApiKeys: geminiApiKeys, // Save array of Gemini API keys
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

        {/* Gemini API Keys Management */}
        <div className="mb-6 bg-dark-background p-4 rounded-lg border border-secondary">
          <label className="block text-primary text-sm font-semibold mb-2">
            Google Gemini API Keys (for Chatbot)
          </label>
          {geminiApiKeys.length === 0 && (
            <p className="text-sm text-gray-text mb-3">No API keys added yet. Add at least one for the chatbot to function.</p>
          )}
          <ul className="space-y-2 mb-4">
            {geminiApiKeys.map((key, index) => (
              <li key={index} className="flex items-center justify-between bg-medium-dark p-2 rounded-md border border-secondary">
                <span className="font-mono text-light-text text-sm truncate pr-2 flex-grow">
                  {showApiKeyVisibility[index] ? key : `${key.substring(0, 5)}...${key.substring(key.length - 5)}`}
                </span>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyVisibility(prev => ({ ...prev, [index]: !prev[index] }))}
                    className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                    aria-label={showApiKeyVisibility[index] ? "Hide API key" : "Show API key"}
                    disabled={loading}
                  >
                    {showApiKeyVisibility[index] ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveApiKey(key)}
                    className="text-red-400 hover:text-red-500 transition-colors duration-200"
                    aria-label={`Remove API Key ${index + 1}`}
                    disabled={loading}
                  >
                    <FaTrashAlt className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <input
                type={showNewApiKey ? "text" : "password"}
                className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 pr-10 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                placeholder="Enter new Gemini API Key"
                value={newApiKeyInput}
                onChange={(e) => setNewApiKeyInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddApiKey();
                  }
                }}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewApiKey(prev => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-text hover:text-light-text focus:outline-none"
                aria-label={showNewApiKey ? "Hide new API key" : "Show new API key"}
                disabled={loading}
              >
                {showNewApiKey ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleAddApiKey}
              className="bg-accent text-dark-background font-semibold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors duration-300 disabled:opacity-50 w-full sm:w-auto flex items-center justify-center space-x-2"
              disabled={loading || newApiKeyInput.trim() === ''}
            >
              <FaPlus /> <span>Add Key</span>
            </button>
          </div>
          <p className="text-xs text-gray-text mt-3">These keys are used by the chatbot. Add multiple keys for redundancy. Keep them secure.</p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={loading}
          >
            {loading && uploadProgress > 0 && uploadProgress < 100 ? <LoadingSpinner size="small" /> : 'Save Settings'}
          </button>
        </div>
      </form>

      {/* Password Change Section */}
      <section className="mt-12 bg-dark-background p-6 rounded-lg shadow-inner border border-secondary">
        <h3 className="text-2xl font-bold mb-6 text-primary flex items-center">
          <FaKey className="mr-3 text-accent" /> Change Admin Password
        </h3>
        <p className="text-secondary text-sm mb-4">
          To change your password, a reset link will be sent to your registered admin email address. You can set your new password by clicking that link.
        </p>
        {error && passwordResetSuccess === false && <ErrorDisplay message={error} />}
        {passwordResetSuccess === true && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative my-4" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline ml-2">A password reset link has been sent to {resetEmailInput}. Please check your email.</span>
          </div>
        )}
        <form onSubmit={handleSendPasswordResetLink} className="space-y-4">
          <div>
            <label htmlFor="resetEmail" className="block text-secondary text-sm font-semibold mb-2">
              Registered Admin Email (Read-only)
            </label>
            <input
              type="email"
              id="resetEmail"
              className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight cursor-not-allowed"
              value={resetEmailInput}
              readOnly
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto mt-6"
            disabled={loading}
          >
            {loading && passwordResetSuccess === null ? <LoadingSpinner size="small" /> : 'Send Password Reset Link'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default AdminSettingsForm;