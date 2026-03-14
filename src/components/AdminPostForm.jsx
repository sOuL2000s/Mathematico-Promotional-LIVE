import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { FaTimes } from 'react-icons/fa'; // Import the close icon

const categories = ['blog', 'problem', 'puzzle', 'riddle', 'article', 'quiz'];

const AdminPostForm = ({ post = null, onPostSaved, onPostDeleted }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(''); // Stores URL for preview (local or existing Cloudinary URL)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // For showing upload progress

  // New states for quiz options
  const [quizOptions, setQuizOptions] = useState([]);
  const [newQuizOption, setNewQuizOption] = useState('');

  // Cloudinary credentials from .env.local
  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    // console.log('Cloudinary Cloud Name (from env):', CLOUDINARY_CLOUD_NAME);
    // console.log('Cloudinary Upload Preset (from env):', CLOUDINARY_UPLOAD_PRESET);

    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setCategory(post.category || categories[0]);
      setPreviewUrl(post.imageUrl || ''); // Set preview if an image/video already exists
      setFileToUpload(null); // Clear any pending file upload when switching to edit mode
      setUploadProgress(0); // Reset upload progress
      // Initialize quiz options if it's a quiz post
      if (post.category === 'quiz' && post.options) {
        setQuizOptions(post.options);
      } else {
        setQuizOptions([]);
      }
    } else {
      // Reset form for creating a new post
      setTitle('');
      setContent('');
      setCategory(categories[0]);
      setFileToUpload(null);
      setPreviewUrl('');
      setUploadProgress(0);
      setQuizOptions([]); // Reset quiz options
      setNewQuizOption('');
      // Explicitly clear file input element when switching to create mode
      if (document.getElementById('fileUpload')) {
        document.getElementById('fileUpload').value = '';
      }
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

  const handleAddQuizOption = () => {
      if (newQuizOption.trim() && !quizOptions.includes(newQuizOption.trim())) {
          setQuizOptions([...quizOptions, newQuizOption.trim()]);
          setNewQuizOption('');
      }
  };

  const handleRemoveQuizOption = (optionToRemove) => {
      setQuizOptions(quizOptions.filter(option => option !== optionToRemove));
  };


  const uploadFileToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary credentials are not set in environment variables. Please check .env.local");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'mathematico_posts'); // Optional: organize uploads in a specific folder

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

    if (category === 'quiz' && quizOptions.length < 2) {
      setError("Quiz posts must have at least two options.");
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

      if (category === 'quiz') {
          postData.options = quizOptions;
          if (!post || !post.optionCounts) { // Initialize optionCounts for new quiz or existing quiz without counts
              postData.optionCounts = quizOptions.reduce((acc, option) => ({ ...acc, [option]: 0 }), {});
          } else {
              // When updating an existing quiz, ensure new options are initialized to 0,
              // and removed options are no longer in counts.
              const updatedOptionCounts = {};
              for (const option of quizOptions) {
                  updatedOptionCounts[option] = post.optionCounts[option] || 0;
              }
              postData.optionCounts = updatedOptionCounts;
          }
      } else {
          // Ensure quiz-specific fields are not saved if category is not quiz
          // This ensures options and optionCounts are removed if a post changes from quiz to another category.
          if (post && post.options) delete postData.options;
          if (post && post.optionCounts) delete postData.optionCounts;
      }

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
      // Clear form fields after successful submission if creating a new post
      // or if the parent component's `editingPost` state is explicitly set to null (create mode).
      if (!post) {
        setTitle('');
        setContent('');
        setCategory(categories[0]);
        setFileToUpload(null);
        setPreviewUrl('');
        setQuizOptions([]);
        setNewQuizOption('');
        if (document.getElementById('fileUpload')) {
          document.getElementById('fileUpload').value = '';
        }
      }
    } catch (err) {
      console.error("Error saving post: ", err);
      setError(`Failed to ${post ? 'update' : 'create'} post: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0); // Reset progress
      // Rely on the useEffect to reset the form state when 'post' prop changes (e.g., to null for new creation)
      // or to re-render with updated 'post' data after successful edit.
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
      console.error("Error deleting post:", err);
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
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary">
      <h3 className="text-2xl font-bold mb-6 text-light-text">{post ? 'Edit Post' : 'Create New Post'}</h3>
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
          <label htmlFor="content" className="block text-secondary text-sm font-semibold mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            rows="8"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-secondary text-sm font-semibold mb-2">
            Category
          </label>
          <select
            id="category"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
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

        {category === 'quiz' && (
            <div className="mb-4 bg-dark-background p-4 rounded-lg border border-secondary">
                <label className="block text-primary text-sm font-semibold mb-2">
                    Quiz Options <span className="text-red-500">*</span> (Min 2 options)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {quizOptions.map((option, index) => (
                        <span key={index} className="inline-flex items-center bg-primary text-light-text text-sm px-3 py-1 rounded-full">
                            {option}
                            <button
                                type="button"
                                onClick={() => handleRemoveQuizOption(option)}
                                className="ml-2 text-red-300 hover:text-red-100 transition-colors"
                                disabled={loading}
                            >
                                <FaTimes className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="text"
                        className="shadow-sm appearance-none border border-secondary rounded-lg flex-grow py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                        placeholder="Add a new quiz option"
                        value={newQuizOption}
                        onChange={(e) => setNewQuizOption(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddQuizOption();
                            }
                        }}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        onClick={handleAddQuizOption}
                        className="bg-accent text-dark-background font-semibold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors duration-300 disabled:opacity-50 w-full sm:w-auto"
                        disabled={loading || newQuizOption.trim() === ''}
                    >
                        Add Option
                    </button>
                </div>
            </div>
        )}
        {/* Replaced imageUrl input with file input and preview */}
        <div className="mb-6">
          <label htmlFor="fileUpload" className="block text-secondary text-sm font-semibold mb-2">
            Upload Image/Video (Optional)
          </label>
          <input
            type="file"
            id="fileUpload"
            className="block w-full text-sm text-secondary
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-primary file:text-light-text
                       hover:file:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            onChange={handleFileChange}
            accept="image/*,video/*" // Accept both image and video files
            disabled={loading}
          />
          {previewUrl && (
            <div className="mt-4 relative w-64 h-auto max-w-full overflow-hidden rounded-lg shadow-md border border-secondary">
              {isVideo(previewUrl) ? (
                <video src={previewUrl} controls className="w-full h-auto object-cover max-h-48"></video>
              ) : (
                <img src={previewUrl} alt="Media Preview" className="w-full h-auto object-cover max-h-48" />
              )}
              <button
                type="button"
                onClick={clearMedia}
                className="absolute top-1 right-1 bg-red-500 text-light-text rounded-full p-1 text-xs leading-none z-10 hover:bg-red-600 transition-colors flex items-center justify-center w-5 h-5"
                title="Remove image/video"
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
            {loading ? <LoadingSpinner /> : (post ? 'Update Post' : 'Create Post')}
          </button>
          {post && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-light-text font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
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