import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaTrash, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Added sort icons

const AdminCommentsPage = () => {
  const [allComments, setAllComments] = useState([]); // Store all fetched comments
  const [displayedComments, setDisplayedComments] = useState([]); // Comments after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('timestamp'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchAllComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allCommentsData = [];
      const postsQ = query(collection(db, 'posts'));
      const postsSnap = await getDocs(postsQ);

      for (const postDoc of postsSnap.docs) {
        const commentsQ = query(collection(db, 'posts', postDoc.id, 'comments'), orderBy('timestamp', 'desc'));
        const commentsSnap = await getDocs(commentsQ);
        commentsSnap.forEach(commentDoc => {
          allCommentsData.push({
            id: commentDoc.id,
            postId: postDoc.id,
            postTitle: postDoc.data().title || 'Untitled Post', // Include post title for context
            ...commentDoc.data(),
          });
        });
      }
      setAllComments(allCommentsData);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllComments();
  }, [fetchAllComments]);

  // Effect to filter and sort comments based on user input
  useEffect(() => {
    let tempComments = [...allComments];

    // 1. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempComments = tempComments.filter(comment => {
        const nameMatch = (comment.commenterName || '').toLowerCase().includes(lowerCaseSearchTerm);
        const textMatch = (comment.commentText || '').toLowerCase().includes(lowerCaseSearchTerm);
        const postTitleMatch = (comment.postTitle || '').toLowerCase().includes(lowerCaseSearchTerm);
        return nameMatch || textMatch || postTitleMatch;
      });
    }

    // 2. Sort
    tempComments.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'timestamp') {
        valA = a.timestamp ? a.timestamp.toDate() : new Date(0);
        valB = b.timestamp ? b.timestamp.toDate() : new Date(0);
      } else if (sortKey === 'commenterName') {
        valA = (a.commenterName || '').toLowerCase();
        valB = (b.commenterName || '').toLowerCase();
      } else if (sortKey === 'postTitle') {
        valA = (a.postTitle || '').toLowerCase();
        valB = (b.postTitle || '').toLowerCase();
      } else { // Fallback, though not strictly needed with current sortKeys
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedComments(tempComments);
  }, [allComments, searchTerm, sortKey, sortOrder]);


  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      setAllComments(prevComments => prevComments.filter(c => c.id !== commentId));
      alert('Comment deleted successfully!');
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Moderate Comments</h1>

      <section className="animate-fade-in-up animation-delay-100">

        {/* Controls: Search, Sort */}
        <div className="flex flex-col md:flex-row items-center justify-start gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
          />

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
              <option value="commenterName-asc">Commenter (A-Z)</option>
              <option value="commenterName-desc">Commenter (Z-A)</option>
              <option value="postTitle-asc">Post Title (A-Z)</option>
              <option value="postTitle-desc">Post Title (Z-A)</option>
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
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Commenter</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Comment</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">On Post</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="text-secondary text-xs sm:text-sm font-light">
                {displayedComments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-text">No comments found matching your criteria.</td>
                  </tr>
                ) : (
                  displayedComments.map((comment) => (
                    <tr key={comment.id} className="border-b border-secondary hover:bg-dark-background transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap text-light-text">{comment.commenterName || 'Anonymous'}</td>
                      <td className="py-3 px-4 sm:px-6 text-left max-w-[150px] sm:max-w-xs truncate text-light-text">{comment.commentText}</td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <a href={`/posts/${comment.postId}`} className="text-accent hover:underline text-xs sm:text-sm" target="_blank" rel="noopener noreferrer">
                          {comment.postTitle || 'View Post'}
                        </a>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-text">{formatDate(comment.timestamp)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <button
                          onClick={() => handleDeleteComment(comment.postId, comment.id)}
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

export default AdminCommentsPage;