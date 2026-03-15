import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore'; // Removed 'where' from here, doing client-side filtering
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Icons for sorting

const categories = ['all', 'blog', 'problem', 'puzzle', 'riddle', 'article', 'quiz'];

const PostsPage = () => {
  const [allPosts, setAllPosts] = useState([]); // Store all fetched posts
  const [displayedPosts, setDisplayedPosts] = useState([]); // Posts after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('timestamp'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const fetchAllPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllPosts(fetchedPosts); // Store all posts
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPosts();
  }, [fetchAllPosts]);

  // Effect to filter and sort posts based on user input
  useEffect(() => {
    let tempPosts = [...allPosts];

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      tempPosts = tempPosts.filter(post => post.category === selectedCategory);
    }

    // 2. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempPosts = tempPosts.filter(post => {
        const titleMatch = (post.title || '').toLowerCase().includes(lowerCaseSearchTerm);
        const contentMatch = (post.content || '').toLowerCase().includes(lowerCaseSearchTerm);
        const authorMatch = (post.author || '').toLowerCase().includes(lowerCaseSearchTerm);
        const categoryMatch = (post.category || '').toLowerCase().includes(lowerCaseSearchTerm);
        const optionsMatch = (post.options && Array.isArray(post.options)) ? post.options.some(option => (option || '').toLowerCase().includes(lowerCaseSearchTerm)) : false;
        return titleMatch || contentMatch || authorMatch || categoryMatch || optionsMatch;
      });
    }

    // 3. Sort
    tempPosts.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'timestamp') {
        valA = a.timestamp ? a.timestamp.toDate() : new Date(0); // Handle missing timestamp
        valB = b.timestamp ? b.timestamp.toDate() : new Date(0);
      } else if (sortKey === 'likes') {
        valA = a.likes || 0;
        valB = b.likes || 0;
      } else { // 'title', 'category'
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedPosts(tempPosts);
  }, [allPosts, selectedCategory, searchTerm, sortKey, sortOrder]);


  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Our Latest Posts & Resources</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Explore a wide range of mathematical topics, challenging problems, intriguing puzzles, and insightful articles from our experts.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 md:mb-10 animate-fade-in-up animation-delay-200">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search posts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
        />

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2 w-full sm:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 whitespace-nowrap
                ${selectedCategory === cat
                  ? 'bg-accent text-dark-background shadow-md hover:bg-cyan-400'
                  : 'bg-secondary text-dark-background hover:bg-light-text'
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
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
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="likes-desc">Likes (High to Low)</option>
            <option value="likes-asc">Likes (Low to High)</option>
            <option value="category-asc">Category (A-Z)</option>
            <option value="category-desc">Category (Z-A)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
            {sortOrder === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && displayedPosts.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No posts found for this category or search term.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedPosts.map((post, index) => (
          <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsPage;