import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedReviews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReviews(fetchedReviews);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-accent' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-5xl font-bold text-dark mb-10 text-center">Student Reviews & Feedback</h1>
      <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
        Read what our students and parents have to say about their experience with Mathematico. Your feedback helps us grow!
      </p>

      {/* Review Submission Form */}
      <div className="mb-12">
        <ReviewForm onReviewAdded={fetchReviews} />
      </div>

      <h2 className="text-4xl font-bold text-dark mb-8 text-center">What People Are Saying</h2>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && reviews.length === 0 && !error && (
        <p className="text-center text-gray-600 text-xl mt-8">No reviews yet. Be the first to leave one!</p>
      )}

      {/* Display Existing Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-lg text-dark">{review.reviewerName || 'Anonymous'}</p>
              <span className="text-gray-500 text-sm">{formatDate(review.timestamp)}</span>
            </div>
            {review.rating > 0 && (
              <div className="mb-3">
                {renderStars(review.rating)}
              </div>
            )}
            <p className="text-gray-700 leading-relaxed flex-grow">{review.feedbackText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;