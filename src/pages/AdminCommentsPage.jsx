import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaTrash } from 'react-icons/fa';

const AdminCommentsPage = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchAllComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allComments = [];
      const postsQ = query(collection(db, 'posts'));
      const postsSnap = await getDocs(postsQ);

      for (const postDoc of postsSnap.docs) {
        const commentsQ = query(collection(db, 'posts', postDoc.id, 'comments'), orderBy('timestamp', 'desc'));
        const commentsSnap = await getDocs(commentsQ);
        commentsSnap.forEach(commentDoc => {
          allComments.push({
            id: commentDoc.id,
            postId: postDoc.id,
            postTitle: postDoc.data().title, // Include post title for context
            ...commentDoc.data(),
          });
        });
      }
      setComments(allComments);
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

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setLoading(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
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
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-text">No comments found.</td>
                  </tr>
                ) : (
                  comments.map((comment) => (
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