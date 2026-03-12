import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';

const CommentForm = ({ postId, onCommentAdded }) => {
  const [commenterName, setCommenterName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        commenterName: commenterName.trim() || 'Anonymous',
        commentText: commentText.trim(),
        timestamp: Timestamp.now(),
      });
      setCommenterName('');
      setCommentText('');
      if (onCommentAdded) {
        onCommentAdded(); // Notify parent to refresh comments
      }
    } catch (err) {
      console.error("Error adding comment: ", err);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-dark">Leave a Comment</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="commenterName" className="block text-gray-700 text-sm font-semibold mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            id="commenterName"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
            placeholder="Anonymous"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="commentText" className="block text-gray-700 text-sm font-semibold mb-2">
            Your Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="commentText"
            rows="4"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            required
            disabled={loading}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;