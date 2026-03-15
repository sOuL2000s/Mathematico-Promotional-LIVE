import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import ReviewForm from '../components/ReviewForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaStar, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Import star icon and sorting icons

const ReviewsPage = () => {
  const [allReviews, setAllReviews] = useState([]); // Store all fetched reviews
  const [displayedReviews, setDisplayedReviews] = useState([]); // Reviews after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all'); // Filter by rating (e.g., 'all', '5', '4')
  const [sortKey, setSortKey] = useState('timestamp'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

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
      setError("Failed to load reviews. Please try again later.");
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
          className={`w-4 h-4 sm:w-5 sm:h-5 ${i <= rating ? 'text-accent' : 'text-gray-text'}`}
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Student Reviews & Feedback</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Read what our students and parents have to say about their experience with Mathematico. Your feedback helps us grow!
      </p>

      {/* Review Submission Form */}
      <div className="mb-8 md:mb-12 animate-fade-in-up animation-delay-200">
        <ReviewForm onReviewAdded={fetchReviews} />
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-light-text mb-6 md:mb-8 text-center animate-fade-in-up animation-delay-300">What People Are Saying</h2>

      {/* Controls: Search, Filter by Rating, Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-10 animate-fade-in-up animation-delay-200">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search reviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
        />

        {/* Filter by Rating */}
        <div className="relative w-full sm:w-auto">
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="w-full sm:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars & Up</option>
            <option value="4">4 Stars & Up</option>
            <option value="3">3 Stars & Up</option>
            <option value="2">2 Stars & Up</option>
            <option value="1">1 Star & Up</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
            <FaStar /> {/* Generic icon for filter dropdown */}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={`${sortKey}-${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('-');
              setSortKey(key);
              setSortOrder(order);
            }}
            className="w-full sm:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
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

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && displayedReviews.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No reviews found matching your criteria.</p>
      )}

      {/* Display Existing Reviews */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedReviews.map((review, index) => (
          <div key={review.id} className="bg-medium-dark p-4 sm:p-6 rounded-xl shadow-md border border-secondary flex flex-col hover:shadow-lg transition-shadow duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="font-bold text-base sm:text-lg text-light-text">{review.reviewerName || 'Anonymous'}</p>
              <span className="text-gray-text text-xs sm:text-sm">{formatDate(review.timestamp)}</span>
            </div>
            {review.rating > 0 && (
              <div className="mb-2 sm:mb-3">
                {renderStars(review.rating)}
              </div>
            )}
            <p className="text-secondary leading-relaxed flex-grow text-sm sm:text-base">{review.feedbackText}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;