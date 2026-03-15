import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaTrash, FaStar, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Added sort icons

const AdminReviewsPage = () => {
  const [allReviews, setAllReviews] = useState([]); // Store all fetched reviews
  const [displayedReviews, setDisplayedReviews] = useState([]); // Reviews after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all'); // Filter by rating (e.g., 'all', '5', '4')
  const [sortKey, setSortKey] = useState('timestamp'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

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
      setAllReviews(fetchedReviews);
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

  // Effect to filter and sort reviews based on user input
  useEffect(() => {
    let tempReviews = [...allReviews];

    // 1. Rating Filter
    if (filterRating !== 'all') {
      tempReviews = tempReviews.filter(review => review.rating >= parseInt(filterRating));
    }

    // 2. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempReviews = tempReviews.filter(review => {
        const nameMatch = (review.reviewerName || '').toLowerCase().includes(lowerCaseSearchTerm);
        const feedbackMatch = (review.feedbackText || '').toLowerCase().includes(lowerCaseSearchTerm);
        return nameMatch || feedbackMatch;
      });
    }

    // 3. Sort
    tempReviews.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'timestamp') {
        valA = a.timestamp ? a.timestamp.toDate() : new Date(0);
        valB = b.timestamp ? b.timestamp.toDate() : new Date(0);
      } else if (sortKey === 'rating') {
        valA = a.rating || 0;
        valB = b.rating || 0;
      } else { // Fallback, though not strictly needed with current sortKeys
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedReviews(tempReviews);
  }, [allReviews, searchTerm, filterRating, sortKey, sortOrder]);


  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'reviews', reviewId));
      setAllReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId)); // Update allReviews
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

        {/* Controls: Search, Filter by Rating, Sort */}
        <div className="flex flex-col md:flex-row items-center justify-start gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
          />

          {/* Filter by Rating */}
          <div className="relative w-full md:w-auto">
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars & Up</option>
              <option value="4">4 Stars & Up</option>
              <option value="3">3 Stars & Up</option>
              <option value="2">2 Stars & Up</option>
              <option value="1">1 Star & Up</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
              <FaStar /> {/* Generic filter icon */}
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full md:w-auto">
            <select
              value={`${sortKey}-${sortOrder}`}
              onChange={(e) => {
                const [key, order] = e.target.value.split('-');
                setSortKey(key);
                setSortOrder(order);
              }}
              className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            >
              <option value="timestamp-desc">Newest First</option>
              <option value="timestamp-asc">Oldest First</option>
              <option value="rating-desc">Rating (High to Low)</option>
              <option value="rating-asc">Rating (Low to High)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
              {sortOrder === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
            </div>
          </div>
        </div>

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
                {displayedReviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-text">No reviews found matching your criteria.</td>
                  </tr>
                ) : (
                  displayedReviews.map((review) => (
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