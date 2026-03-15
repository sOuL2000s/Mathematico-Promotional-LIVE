import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaBookOpen, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Icons for books and sorting
import { Link } from 'react-router-dom'; // Import Link

const BooksPage = () => {
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [displayedBooks, setDisplayedBooks] = useState([]); // Books after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const fetchAllBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedBooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllBooks(fetchedBooks); // Store all books
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBooks();
  }, [fetchAllBooks]);

  // Effect to filter and sort books based on user input
  useEffect(() => {
    let tempBooks = [...allBooks];

    // 1. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempBooks = tempBooks.filter(book => {
        const titleMatch = (book.title || '').toLowerCase().includes(lowerCaseSearchTerm);
        const descriptionMatch = (book.description || '').toLowerCase().includes(lowerCaseSearchTerm);
        return titleMatch || descriptionMatch;
      });
    }

    // 2. Sort
    tempBooks.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'createdAt') {
        valA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        valB = b.createdAt ? b.createdAt.toDate() : new Date(0);
      } else { // 'title'
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedBooks(tempBooks);
  }, [allBooks, searchTerm, sortKey, sortOrder]);

  // Helper to add Cloudinary transformations
  const getOptimizedImageUrl = (url, width) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Example: insert 'f_auto,q_auto,w_WIDTH' after '/upload/'
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Our Mathematical Resources</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Explore a curated collection of mathematical books and PDFs to enhance your learning. Click "Read Book" to open them directly from Google Drive.
      </p>

      {/* Controls: Search, Sort */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-10 animate-fade-in-up animation-delay-200">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
        />

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
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
            {sortOrder === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && displayedBooks.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No books available at the moment.</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedBooks.map((book, index) => (
          <div key={book.id} className="group bg-medium-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-secondary flex flex-col animate-fade-in-up transform hover:-translate-y-2 hover:border-accent" style={{ animationDelay: `${index * 0.1}s` }}>
            {book.imageUrl && (
              <img
                src={getOptimizedImageUrl(book.imageUrl, 500)} // Optimize image for display width
                alt={book.title}
                loading="lazy" // Lazy load image
                className="w-full h-56 object-cover object-center group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.onerror = null; e.target.src = "/logo512.png" }} // Fallback image
              />
            )}
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <h2 className="text-xl sm:text-2xl font-bold text-primary leading-tight mb-2 sm:mb-3">{book.title}</h2>
              <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-4 flex-grow text-balance line-clamp-3">{book.description}</p>
              <a
                href={book.googleDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-3 sm:pt-4 border-t border-secondary inline-flex items-center justify-center bg-accent text-dark-background font-bold py-2.5 px-5 sm:px-6 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg self-start"
              >
                <FaBookOpen className="mr-2" /> Read Book
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="bg-primary text-light-text p-6 md:p-8 rounded-xl shadow-xl mt-8 md:mt-16 text-center animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Looking for more in-depth learning?</h2>
        <p className="text-base sm:text-lg mb-4 md:mb-6 opacity-90">
          Explore our structured courses and personalized coaching programs.
        </p>
        <Link to="/courses" className="inline-block bg-accent text-dark-background font-bold py-2.5 px-6 sm:px-8 rounded-full hover:bg-cyan-400 transition-colors duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg">
          Explore Courses
        </Link>
      </section>
    </div>
  );
};

export default BooksPage;