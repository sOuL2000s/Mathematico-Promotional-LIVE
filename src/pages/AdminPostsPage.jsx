import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AdminPostForm from '../components/AdminPostForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaEdit, FaTrash, FaPlusSquare, FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt } from 'react-icons/fa'; // Added sort icons

const postCategories = ['all', 'blog', 'problem', 'puzzle', 'riddle', 'article', 'quiz'];

const AdminPostsPage = () => {
  const [allPosts, setAllPosts] = useState([]); // Store all fetched posts
  const [displayedPosts, setDisplayedPosts] = useState([]); // Posts after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // For filtering by category in the table
  const [sortKey, setSortKey] = useState('timestamp'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

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
      setAllPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts.");
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
    if (filterCategory !== 'all') {
      tempPosts = tempPosts.filter(post => post.category === filterCategory);
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
        valA = a.timestamp ? a.timestamp.toDate() : new Date(0);
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
  }, [allPosts, searchTerm, filterCategory, sortKey, sortOrder]);


  const handlePostSaved = () => {
    setEditingPost(null); // Exit edit mode
    fetchAllPosts(); // Refresh posts list (fetches all again)
  };

  const handlePostDeleted = async (deletedPostId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'posts', deletedPostId));
      // Optimistically update 'allPosts' to prevent a full re-fetch delay in UI
      setAllPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      setEditingPost(null);
      alert('Post deleted successfully!');
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Manage Posts</h1>

      <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary mb-8 md:mb-12 animate-fade-in-up animation-delay-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 md:mb-8">{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
        <button
          onClick={() => {
            if (editingPost === null) {
              setFormKey(prevKey => prevKey + 1);
            } else {
              setEditingPost(null);
              setFormKey(prevKey => prevKey + 1);
            }
          }}
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-6 inline-flex items-center shadow-md hover:shadow-lg"
        >
          <FaPlusSquare className="mr-2" /> {editingPost ? 'Cancel Edit / Create New' : 'Create New Post'}
        </button>

        <AdminPostForm
          key={formKey}
          post={editingPost}
          onPostSaved={handlePostSaved}
          onPostDeleted={handlePostDeleted}
        />
      </section>

      <section className="animate-fade-in-up animation-delay-200">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text mt-8 md:mt-12 mb-4 md:mb-6">Existing Posts</h3>

        {/* Controls: Search, Category Filter, Sort */}
        <div className="flex flex-col md:flex-row items-center justify-start gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
          />

          {/* Category Filter */}
          <div className="relative w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            >
              {postCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
              <FaCalendarAlt /> {/* Generic filter icon */}
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
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="likes-desc">Likes (High to Low)</option>
              <option value="likes-asc">Likes (Low to High)</option>
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
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Title</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Category</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Likes</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="text-secondary text-xs sm:text-sm font-light">
                {displayedPosts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-text">No posts found matching your criteria.</td>
                  </tr>
                ) : (
                  displayedPosts.map((post) => (
                    <tr key={post.id} className="border-b border-secondary hover:bg-dark-background transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap">
                        <span className="font-medium text-light-text">{post.title}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <span className="bg-primary text-light-text py-1 px-2 rounded-full text-xs font-semibold">{post.category}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center">{post.likes || 0}</td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-text">{formatDate(post.timestamp)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => setEditingPost(post)}
                            className="bg-primary text-light-text px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-xs inline-flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handlePostDeleted(post.id)}
                            className="bg-red-500 text-light-text px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs inline-flex items-center"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
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

export default AdminPostsPage;