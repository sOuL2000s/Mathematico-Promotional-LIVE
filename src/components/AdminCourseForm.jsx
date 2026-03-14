import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { FaTimes } from 'react-icons/fa'; // Import the close icon

const AdminCourseForm = ({ course = null, onCourseSaved, onCourseDeleted }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState([]); // Array of strings
  const [newFeature, setNewFeature] = useState(''); // For adding new features
  const [level, setLevel] = useState('Beginner');
  const [fileToUpload, setFileToUpload] = useState(null); // Stores the actual file object
  const [previewUrl, setPreviewUrl] = useState(''); // Stores URL for preview (local or existing Cloudinary URL)
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    if (course) {
      setTitle(course.title || '');
      setDescription(course.description || '');
      setFeatures(course.features || []);
      setLevel(course.level || 'Beginner');
      setPreviewUrl(course.imageUrl || '');
      setButtonText(course.buttonText || '');
      setButtonLink(course.buttonLink || '');
      setFileToUpload(null);
      setUploadProgress(0);
    } else {
      // Reset form for creating a new course
      setTitle('');
      setDescription('');
      setFeatures([]);
      setNewFeature('');
      setLevel('Beginner');
      setFileToUpload(null);
      setPreviewUrl('');
      setButtonText('');
      setButtonLink('');
      setUploadProgress(0);
      // Explicitly clear file input element when switching to create mode
      if (document.getElementById('courseFileUpload')) {
        document.getElementById('courseFileUpload').value = '';
      }
    }
  }, [course]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setUploadProgress(0);
    } else {
      setFileToUpload(null);
      if (!course || !course.imageUrl) {
         setPreviewUrl('');
      }
      setUploadProgress(0);
    }
  };

  const clearMedia = () => {
    setFileToUpload(null);
    setPreviewUrl('');
    if (document.getElementById('courseFileUpload')) {
      document.getElementById('courseFileUpload').value = '';
    }
    setUploadProgress(0);
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFeatures(features.filter(feature => feature !== featureToRemove));
  };

  const uploadFileToCloudinary = async (file) => {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error("Cloudinary credentials are not set in environment variables. Please check .env.local");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'mathematico_courses');

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

    if (!title.trim() || !description.trim() || features.length === 0) {
      setError("Title, description, and at least one feature cannot be empty.");
      setLoading(false);
      return;
    }

    let finalImageUrl = '';

    try {
      if (fileToUpload) {
        finalImageUrl = await uploadFileToCloudinary(fileToUpload);
      } else if (course && course.imageUrl && previewUrl === course.imageUrl) {
        finalImageUrl = course.imageUrl;
      } else {
        finalImageUrl = '';
      }

      const courseData = {
        title: title.trim(),
        description: description.trim(),
        features: features,
        level: level,
        imageUrl: finalImageUrl,
        buttonText: buttonText.trim(),
        buttonLink: buttonLink.trim(),
        lastUpdated: Timestamp.now(),
      };

      if (course) {
        const courseRef = doc(db, 'courses', course.id);
        await updateDoc(courseRef, courseData);
        alert('Course updated successfully!');
      } else {
        await addDoc(collection(db, 'courses'), {
          ...courseData,
          createdAt: Timestamp.now(),
        });
        alert('Course created successfully!');
      }
      onCourseSaved();
      // Clear form fields after successful submission if creating a new course
      // or if the parent component's `editingCourse` state is explicitly set to null (create mode).
      // If `course` is null, it means we were in "create new course" mode.
      if (!course) {
        setTitle('');
        setDescription('');
        setFeatures([]);
        setNewFeature('');
        setLevel('Beginner');
        setButtonText('');
        setButtonLink('');
        setFileToUpload(null);
        setPreviewUrl('');
        if (document.getElementById('courseFileUpload')) {
          document.getElementById('courseFileUpload').value = '';
        }
      }
    } catch (err) {
      console.error("Error saving course: ", err);
      setError(`Failed to ${course ? 'update' : 'create'} course: ${err.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      // Rely on the useEffect to reset the form state when 'course' prop changes (e.g., to null for new creation)
      // or to re-render with updated 'course' data after successful edit.
    }
  };

  const handleDelete = async () => {
    if (!course || !window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, 'courses', course.id));
      alert('Course deleted successfully!');
      onCourseDeleted(course.id);
    } catch (err) {
      console.error("Error deleting course: ", err);
      setError(`Failed to delete course: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary">
      <h3 className="text-2xl font-bold mb-6 text-light-text">{course ? 'Edit Course' : 'Create New Course'}</h3>
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
          <label className="block text-secondary text-sm font-semibold mb-2">
            Features <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {features.map((feature, index) => (
              <span key={index} className="inline-flex items-center bg-primary text-light-text text-sm px-3 py-1 rounded-full">
                {feature}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(feature)}
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
              className="shadow-sm appearance-none border border-secondary rounded-lg flex-grow py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              placeholder="Add a new feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="bg-accent text-dark-background font-semibold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors duration-300 disabled:opacity-50 w-full sm:w-auto"
              disabled={loading}
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="level" className="block text-secondary text-sm font-semibold mb-2">
            Level
          </label>
          <select
            id="level"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={loading}
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="buttonText" className="block text-secondary text-sm font-semibold mb-2">
            Enroll Button Text (Optional)
          </label>
          <input
            type="text"
            id="buttonText"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={buttonText}
            onChange={(e) => setButtonText(e.target.value)}
            placeholder="e.g., Enroll Now"
            disabled={loading}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="buttonLink" className="block text-secondary text-sm font-semibold mb-2">
            Enroll Button Link (Optional)
          </label>
          <input
            type="url"
            id="buttonLink"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={buttonLink}
            onChange={(e) => setButtonLink(e.target.value)}
            placeholder="e.g., https://example.com/enroll"
            disabled={loading}
          />
        </div>
        {/* File upload and preview */}
        <div className="mb-6">
          <label htmlFor="courseFileUpload" className="block text-secondary text-sm font-semibold mb-2">
            Upload Image (Optional)
          </label>
          <input
            type="file"
            id="courseFileUpload"
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
              <img src={previewUrl} alt="Course Media Preview" className="w-full h-auto object-cover max-h-48" />
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
            {loading ? <LoadingSpinner /> : (course ? 'Update Course' : 'Create Course')}
          </button>
          {course && (
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-600 text-light-text font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? <LoadingSpinner /> : 'Delete Course'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AdminCourseForm;