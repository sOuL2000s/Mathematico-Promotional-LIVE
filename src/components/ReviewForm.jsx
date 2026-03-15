import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { FaStar } from 'react-icons/fa'; // Import star icon

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
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary">
      <h3 className="text-xl font-bold mb-4 text-light-text">Share Your Feedback</h3>
      {error && <ErrorDisplay message={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="reviewerName" className="block text-secondary text-sm font-semibold mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            id="reviewerName"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            placeholder="Anonymous"
            disabled={loading}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="feedbackText" className="block text-secondary text-sm font-semibold mb-2">
            Your Feedback <span className="text-red-500">*</span>
          </label>
          <textarea
            id="feedbackText"
            rows="5"
            className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y transition-all duration-200"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Tell us what you think..."
            required
            disabled={loading}
          ></textarea>
        </div>
        <div className="mb-6">
          <label className="block text-secondary text-sm font-semibold mb-2">
            Rating (1-5 Stars)
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`w-6 h-6 cursor-pointer transition-colors duration-200 ${star <= rating ? 'text-accent' : 'text-gray-text'}`}
                onClick={() => !loading && setRating(star)}
              />
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="small" /> : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;