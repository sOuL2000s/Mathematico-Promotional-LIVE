import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { FaTimes } from 'react-icons/fa';

// Helper to extract YouTube video ID
const getYouTubeVideoId = (url) => {
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/g;
  const match = regExp.exec(url);
  return (match && match[1]) ? match[1] : null;
};

// Helper to get YouTube thumbnail URL
const getYouTubeThumbnail = (videoId) => {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`; // High quality default thumbnail
};

const AdminVideoForm = ({ video = null, onVideoSaved, onVideoDeleted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null); // For custom thumbnail image
  const [previewUrl, setPreviewUrl] = useState(''); // Local/existing Cloudinary URL for image preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (video) {
      setTitle(video.title || '');
      setDescription(video.description || '');
      setYoutubeLink(video.youtubeLink || '');
      setPreviewUrl(video.thumbnailUrl || ''); // Use existing thumbnail URL
      setFileToUpload(null);
      setUploadProgress(0);
    } else {
      setTitle('');
      setDescription('');
      setYoutubeLink('');
      setFileToUpload(null);
      setPreviewUrl('');
      setUploadProgress(0);
      if (document.getElementById('videoFileUpload')) {
        document.getElementById('videoFileUpload').value = '';
      }
    }
  }, [video]);

  // Update preview URL when youtubeLink changes if no custom file is selected
  useEffect(() => {
    if (youtubeLink && !fileToUpload && !video) { // Only auto-generate for new videos if no custom file
      const videoId = getYouTubeVideoId(youtubeLink);
      if (videoId) {
        setPreviewUrl(getYouTubeThumbnail(videoId));
      } else {
        setPreviewUrl('');
      }
    } else if (youtubeLink && !fileToUpload && video && !video.thumbnailUrl) {
      // If editing an existing video that had no custom thumbnail, try to generate one
      const videoId = getYouTubeVideoId(youtubeLink);
      if (videoId) {
        setPreviewUrl(getYouTubeThumbnail(videoId));
      } else {
        setPreviewUrl('');
      }
    }
  }, [youtubeLink, fileToUpload, video]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file)); // Show local file preview
      setError(null);
      setUploadProgress(0);
    } else {
      setFileToUpload(null);
      // If no new file, revert preview to existing Cloudinary URL or auto-generated one
      if (video && video.thumbnailUrl) {
        setPreviewUrl(video.thumbnailUrl);
      } else if (youtubeLink) {
        const videoId = getYouTubeVideoId(youtubeLink);
        setPreviewUrl(getYouTubeThumbnail(videoId));
      } else {
        setPreviewUrl('');
      }
      setUploadProgress(0);
    }
  };

  const clearMedia = () => {
    setFileToUpload(null);
    setPreviewUrl('');
    if (document.getElementById('videoFileUpload')) {
      document.getElementById('videoFileUpload').value = '';
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
    formData.append('folder', 'mathematico_videos');

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

    const videoId = getYouTubeVideoId(youtubeLink.trim());
    if (!title.trim() || !description.trim() || !youtubeLink.trim() || !videoId) {
      setError("Title, description, and a valid YouTube Link are required.");
      setLoading(false);
      return;
    }

    let finalThumbnailUrl = '';

    try {
      if (fileToUpload) {
        finalThumbnailUrl = await uploadFileToCloudinary(fileToUpload);
      } else if (video && video.thumbnailUrl && previewUrl === video.thumbnailUrl) {
        finalThumbnailUrl = video.thumbnailUrl; // Keep existing Cloudinary URL
      } else if (videoId) {
        finalThumbnailUrl = getYouTubeThumbnail(videoId); // Auto-generate if no custom file and none existed
      } else {
        finalThumbnailUrl = '';
      }

      const videoData = {
        title: title.trim(),
        description: description.trim(),
        youtubeLink: youtubeLink.trim(),
        videoId: videoId, // Store video ID for easy embedding
        thumbnailUrl: finalThumbnailUrl,
        lastUpdated: Timestamp.now(),
      };

      if (video) {
        const videoRef = doc(db, 'videos', video.id);
        await updateDoc(videoRef, videoData);
        alert('Video updated successfully!');
      } else {
        await addDoc(collection(db, 'videos'), {
          ...videoData,
          createdAt: Timestamp.now(),
        });
        alert('Video created successfully!');
      }
      onVideoSaved();
      if (!video) { // Only reset form for new creations
        setTitle('');
        setDescription('');
        setYoutubeLink('');
        setFileToUpload(null);
        setPreviewUrl('');
        if (document.getElementById('videoFileUpload')) {
          document.getElementById('videoFileUpload').value = '';
        }
      }
    } catch (err) {
      console.error("Error saving video: ", err);
      setError(`Failed to ${video ? 'update' : 'create'} video: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!video || !window.confirm(`Are you sure you want to delete "${video.title}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'videos', video.id));
      alert('Video deleted successfully!');
      onVideoDeleted(video.id);
    } catch (err) {
      console.error("Error deleting video: ", err);
      setError(`Failed to delete video: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary">
      <h3 className="text-2xl font-bold mb-6 text-light-text">{video ? 'Edit Video' : 'Create New Video'}</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-secondary text-sm font-semibold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-secondary text-sm font-semibold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows="4"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="youtubeLink" className="block text-secondary text-sm font-semibold mb-2">
            YouTube Video Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            id="youtubeLink"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            required
            disabled={loading}
          />
        </div>

        {/* File upload and preview for custom thumbnail */}
        <div className="mb-6">
          <label htmlFor="videoFileUpload" className="block text-secondary text-sm font-semibold mb-2">
            Upload Custom Thumbnail Image (Optional, YouTube thumbnail will be auto-generated if not provided)
          </label>
          <input
            type="file"
            id="videoFileUpload"
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
              <img src={previewUrl} alt="Video Thumbnail Preview" className="w-full h-auto object-cover max-h-48" />
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
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            type="submit"
            className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : (video ? 'Update Video' : 'Create Video')}
          </button>
          {video && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-light-text font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="small" /> : 'Delete Video'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminVideoForm;