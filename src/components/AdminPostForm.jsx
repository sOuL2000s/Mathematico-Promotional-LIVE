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
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setCategory(post.category || categories[0]);
      setImageUrl(post.imageUrl || '');
    } else {
      // Reset form if no post is passed (for creating new)
      setTitle('');
      setContent('');
      setCategory(categories[0]);
      setImageUrl('');
    }
  }, [post]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      if (post) {
        // Update existing post
        const postRef = doc(db, 'posts', post.id);
        await updateDoc(postRef, {
          title: title.trim(),
          content: content.trim(),
          category: category,
          imageUrl: imageUrl.trim(),
          // Likes and timestamp are not updated on edit typically
        });
        alert('Post updated successfully!');
      } else {
        // Create new post
        await addDoc(collection(db, 'posts'), {
          title: title.trim(),
          content: content.trim(),
          category: category,
          imageUrl: imageUrl.trim(),
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
        <div className="mb-6">
          <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-semibold mb-2">
            Image URL (Optional)
          </label>
          <input
            type="text"
            id="imageUrl"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={loading}
          />
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