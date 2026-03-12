import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';

const categories = ['blog', 'problem', 'puzzle', 'riddle', 'article', 'quiz'];

const AdminPostForm = ({ post = null, onPostSaved, onPostDeleted }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [fileToUpload, setFileToUpload] = useState(null); // Stores the actual file object
  const [previewUrl, setPreviewUrl] = useState(''); // Stores URL for preview (local or existing Cloudinary URL)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // For showing upload progress

  // Cloudinary credentials from .env.local
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    // Log Cloudinary credentials to verify they are loaded correctly
    console.log('Cloudinary Cloud Name (from env):', CLOUDINARY_CLOUD_NAME);
    console.log('Cloudinary Upload Preset (from env):', CLOUDINARY_UPLOAD_PRESET);

    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setCategory(post.category || categories[0]);
      setPreviewUrl(post.imageUrl || ''); // Set preview if an image/video already exists
      setFileToUpload(null); // Clear any pending file upload when switching to edit mode
      setUploadProgress(0); // Reset upload progress
    } else {
      // Reset form for creating a new post
      setTitle('');
      setContent('');
      setCategory(categories[0]);
      setFileToUpload(null);
      setPreviewUrl('');
      setUploadProgress(0);
    }
  }, [post, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET]); // Added dependencies for CLOUDINARY variables

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file)); // Create a local URL for preview
      setError(null); // Clear any previous errors
      setUploadProgress(0); // Reset progress on new file selection
    } else {
      setFileToUpload(null);
      // If there was an existing image for an edit, keep its preview, otherwise clear
      if (!post || !post.imageUrl) {
         setPreviewUrl('');
      }
      setUploadProgress(0);
    }
  };

  const clearMedia = () => {
    setFileToUpload(null);
    setPreviewUrl('');
    // Reset the file input visually
    if (document.getElementById('fileUpload')) {
      document.getElementById('fileUpload').value = '';
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

      return response.secure_url; // This is the URL to store in Firestore
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

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      setLoading(false);
      return;
    }

    let finalImageUrl = ''; // This will be the URL saved to Firestore

    try {
      if (fileToUpload) {
        // If a new file is selected, upload it
        finalImageUrl = await uploadFileToCloudinary(fileToUpload);
      } else if (post && post.imageUrl && previewUrl === post.imageUrl) {
        // If editing and no new file selected, but there was an existing image, keep it
        finalImageUrl = post.imageUrl;
      } else {
        // New post with no file, or editing and existing file was cleared
        finalImageUrl = '';
      }

      const postData = {
        title: title.trim(),
        content: content.trim(),
        category: category,
        imageUrl: finalImageUrl,
      };

      if (post) {
        // Update existing post
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, postData);
        alert('Post updated successfully!');
      } else {
        // Create new post
        await addDoc(collection(db, 'posts'), {
          ...postData,
          author: 'Admin', // Placeholder, could be dynamic from AuthContext
          timestamp: Timestamp.now(),
          likes: 0,
        });
        alert('Post created successfully!');
      }
      onPostSaved(); // Notify parent to refresh list or clear form
    } catch (err) {
      console.error("Error saving post: ", err);
      setError(`Failed to ${post ? 'update' : 'create'} post: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0); // Reset progress
      setFileToUpload(null); // Clear file input state
      setPreviewUrl(''); // Clear preview
      if (document.getElementById('fileUpload')) {
        document.getElementById('fileUpload').value = ''; // Clear file input field
      }
    }
  };

  const handleDelete = async () => {
    if (!post || !window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      alert('Post deleted successfully!');
      onPostDeleted(post.id); // Notify parent to remove from list
    } catch (err) {
      console.error("Error deleting post: ", err);
      setError(`Failed to delete post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if a URL points to an image or video for dynamic preview rendering
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv'];
    // Check if the URL string contains any known video file extension
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-2xl font-bold mb-6 text-dark">{post ? 'Edit Post' : 'Create New Post'}</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 text-sm font-semibold mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows="8"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-semibold mb-2">
            Category
          </label>
          <select
            id="category"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Replaced imageUrl input with file input and preview */}
        <div className="mb-6">
          <label htmlFor="fileUpload" className="block text-gray-700 text-sm font-semibold mb-2">
            Upload Image/Video (Optional)
          </label>
          <input
            type="file"
            id="fileUpload"
            className="block w-full text-sm text-gray-500
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-white
                       hover:file:bg-green-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept="image/*,video/*" // Accept both image and video files
            disabled={loading}
          />
          {previewUrl && (
            <div className="mt-4 relative w-64 h-auto max-w-full overflow-hidden rounded-lg shadow-md border border-gray-200">
              {isVideo(previewUrl) ? (
                <video src={previewUrl} controls className="w-full h-auto object-cover max-h-48"></video>
              ) : (
                <img src={previewUrl} alt="Media Preview" className="w-full h-auto object-cover max-h-48" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none z-10 hover:bg-red-600 transition-colors"
                title="Remove image/video"
                disabled={loading}
              >
                &times;
              </button>
            </div>
          )}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-primary h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              <span className="text-xs text-gray-600 ml-2">{uploadProgress}% uploaded</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <button
            type="submit"
            className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <LoadingSpinner /> : (post ? 'Update Post' : 'Create Post')}
          </button>
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Delete Post'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminPostForm;