import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';

const ReviewForm = ({ onReviewAdded }) => {
  const [reviewerName, setReviewerName] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState(0); // 0-5 stars
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!feedbackText.trim()) {
      setError("Feedback cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        reviewerName: reviewerName.trim() || 'Anonymous',
        feedbackText: feedbackText.trim(),
        rating: rating,
        timestamp: Timestamp.now(),
      });
      setReviewerName('');
      setFeedbackText('');
      setRating(0);
      if (onReviewAdded) {
        onReviewAdded(); // Notify parent to refresh reviews
      }
    } catch (err) {
      console.error("Error adding review: ", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-dark">Share Your Feedback</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="reviewerName" className="block text-gray-700 text-sm font-semibold mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            id="reviewerName"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Anonymous"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="feedbackText" className="block text-gray-700 text-sm font-semibold mb-2">
            Your Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            id="feedbackText"
            rows="5"
            className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think..."
            required
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Rating (1-5 Stars)
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-accent' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                onClick={() => !loading && setRating(star)}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;