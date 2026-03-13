import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AdminPostForm from '../components/AdminPostForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa'; // Import icons

const AdminDashboardPage = () => {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]); // This will store comments grouped by post
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);
  const [errorReviews, setErrorReviews] = useState(null);
  const [errorComments, setErrorComments] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // null for create, post object for edit

  const formatDate = (timestamp) => {
    if (!timestamp) return 'No Date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    setErrorPosts(null);
    try {
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPosts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setErrorPosts("Failed to load posts.");
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    setErrorReviews(null);
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
      setErrorReviews("Failed to load reviews.");
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const fetchAllComments = useCallback(async () => {
    setLoadingComments(true);
    setErrorComments(null);
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
      setErrorComments("Failed to load comments.");
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchReviews();
    fetchAllComments();
  }, [fetchPosts, fetchReviews, fetchAllComments]);

  const handlePostSaved = () => {
    setEditingPost(null); // Exit edit mode
    fetchPosts(); // Refresh posts list
  };

  const handlePostDeleted = async (deletedPostId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setLoadingPosts(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'posts', deletedPostId));
      setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      setEditingPost(null); // Clear form if the deleted post was being edited
      alert('Post deleted successfully!');
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post.");
    } finally {
      setLoadingPosts(false);
    }
  };


  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setLoadingReviews(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'reviews', reviewId));
      setReviews(prevReviews => prevReviews.filter(r => r.id !== reviewId));
      alert('Review deleted successfully!');
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      setLoadingComments(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      alert('Comment deleted successfully!');
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert("Failed to delete comment.");
    } finally {
      setLoadingComments(false);
    }
  };


  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-8 md:mb-10 text-center animate-fade-in-up">Admin Dashboard</h1>

      {/* Post Management */}
      <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 mb-8 md:mb-12 animate-fade-in-up animation-delay-100">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6 md:mb-8">Manage Posts</h2>
        <button
          onClick={() => setEditingPost(null)}
          className="bg-secondary text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-6 inline-flex items-center shadow-md hover:shadow-lg"
        >
          <FaPlusSquare className="mr-2" /> Create New Post
        </button>

        <AdminPostForm
          post={editingPost}
          onPostSaved={handlePostSaved}
          onPostDeleted={handlePostDeleted}
        />

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark mt-8 md:mt-12 mb-4 md:mb-6">Existing Posts</h3>
        {errorPosts && <ErrorDisplay message={errorPosts} />}
        {loadingPosts ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="min-w-full bg-white table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-dark uppercase text-xs sm:text-sm leading-normal">
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Title</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Category</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Likes</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-xs sm:text-sm font-light">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-base">No posts found.</td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap">
                        <span className="font-medium text-gray-800">{post.title}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-semibold">{post.category}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center">{post.likes || 0}</td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-600">{formatDate(post.timestamp)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => setEditingPost(post)}
                            className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-xs inline-flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handlePostDeleted(post.id)}
                            className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs inline-flex items-center"
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

      {/* Reviews Moderation */}
      <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 mb-8 md:mb-12 animate-fade-in-up animation-delay-200">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6 md:mb-8">Moderate Reviews</h2>
        {errorReviews && <ErrorDisplay message={errorReviews} />}
        {loadingReviews ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="min-w-full bg-white table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-dark uppercase text-xs sm:text-sm leading-normal">
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Reviewer</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Rating</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Feedback</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-xs sm:text-sm font-light">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-base">No reviews found.</td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap text-gray-800">{review.reviewerName || 'Anonymous'}</td>
                      <td className="py-3 px-4 sm:px-6 text-left text-gray-600">{review.rating}/5</td>
                      <td className="py-3 px-4 sm:px-6 text-left max-w-[150px] sm:max-w-xs truncate text-gray-800">{review.feedbackText}</td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-600">{formatDate(review.timestamp)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs inline-flex items-center"
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

      {/* Comments Moderation */}
      <section className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 animate-fade-in-up animation-delay-300">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6 md:mb-8">Moderate Comments</h2>
        {errorComments && <ErrorDisplay message={errorComments} />}
        {loadingComments ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="min-w-full bg-white table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr className="text-dark uppercase text-xs sm:text-sm leading-normal">
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Commenter</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">Comment</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-gray-200">On Post</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Date</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-gray-200">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-xs sm:text-sm font-light">
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-base">No comments found.</td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <tr key={comment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap text-gray-800">{comment.commenterName || 'Anonymous'}</td>
                      <td className="py-3 px-4 sm:px-6 text-left max-w-[150px] sm:max-w-xs truncate text-gray-800">{comment.commentText}</td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <a href={`/posts/${comment.postId}`} className="text-secondary hover:underline text-xs sm:text-sm" target="_blank" rel="noopener noreferrer">
                          {comment.postTitle || 'View Post'}
                        </a>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-600">{formatDate(comment.timestamp)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <button
                          onClick={() => handleDeleteComment(comment.postId, comment.id)}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs inline-flex items-center"
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

export default AdminDashboardPage;