import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner'; // Ensure you have a LoadingSpinner component

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
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary">
      <h3 className="text-xl font-bold mb-4 text-light-text">Leave a Comment</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="commenterName" className="block text-secondary text-sm font-semibold mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            id="commenterName"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={commenterName}
            onChange={(e) => setCommenterName(e.target.value)}
            placeholder="Anonymous"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="commentText" className="block text-secondary text-sm font-semibold mb-2">
            Your Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="commentText"
            rows="4"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Share your thoughts..."
            required
            disabled={loading}
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="small" /> : 'Submit Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentForm;