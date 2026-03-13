import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaTrash, FaStar } from 'react-icons/fa';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
      setError("Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setLoading(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
      alert('Review deleted successfully!');
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-accent' : 'text-gray-text'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Moderate Reviews</h1>

      <section className="animate-fade-in-up animation-delay-100">
        {error && <ErrorDisplay message={error} />}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto bg-medium-dark rounded-lg shadow-sm border border-secondary">
            <table className="min-w-full bg-medium-dark table-auto border-collapse">
              <thead className="bg-dark-background">
                <tr className="text-light-text uppercase text-xs sm:text-sm leading-normal">
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Reviewer</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Rating</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Feedback</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="text-secondary text-xs sm:text-sm font-light">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-text">No reviews found.</td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="border-b border-secondary hover:bg-dark-background transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap text-light-text">{review.reviewerName || 'Anonymous'}</td>
                      <td className="py-3 px-4 sm:px-6 text-left text-gray-text">{renderStars(review.rating)}</td>
                      <td className="py-3 px-4 sm:px-6 text-left max-w-[150px] sm:max-w-xs truncate text-light-text">{review.feedbackText}</td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-text">{formatDate(review.timestamp)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="bg-red-500 text-light-text px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs inline-flex items-center"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminReviewsPage;