import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaStar } from 'react-icons/fa'; // Import star icon

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
        <FaStar
          key={i}
          className={`w-4 h-4 sm:w-5 sm:h-5 ${i <= rating ? 'text-accent' : 'text-gray-300'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-8 md:mb-10 text-center animate-fade-in-up">Student Reviews & Feedback</h1>
      <p className="text-base sm:text-xl text-gray-base text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Read what our students and parents have to say about their experience with Mathematico. Your feedback helps us grow!
      </p>

      {/* Review Submission Form */}
      <div className="mb-8 md:mb-12 animate-fade-in-up animation-delay-200">
        <ReviewForm onReviewAdded={fetchReviews} />
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6 md:mb-8 text-center animate-fade-in-up animation-delay-300">What People Are Saying</h2>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && reviews.length === 0 && !error && (
        <p className="text-center text-gray-base text-base sm:text-xl mt-8 animate-fade-in">No reviews yet. Be the first to leave one!</p>
      )}

      {/* Display Existing Reviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {reviews.map((review, index) => (
          <div key={review.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="font-bold text-base sm:text-lg text-dark">{review.reviewerName || 'Anonymous'}</p>
              <span className="text-gray-500 text-xs sm:text-sm">{formatDate(review.timestamp)}</span>
            </div>
            {review.rating > 0 && (
              <div className="mb-2 sm:mb-3">
                {renderStars(review.rating)}
              </div>
            )}
            <p className="text-gray-base leading-relaxed flex-grow text-sm sm:text-base">{review.feedbackText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;