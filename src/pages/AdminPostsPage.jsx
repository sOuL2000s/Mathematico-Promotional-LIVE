import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AdminPostForm from '../components/AdminPostForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';

const AdminPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null); // null for create, post object for edit
  const [formKey, setFormKey] = useState(0); // Key to force remount of AdminPostForm for reset

    const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setError("Failed to load posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostSaved = () => {
    setEditingPost(null); // Exit edit mode
    fetchPosts(); // Refresh posts list
  };

  const handlePostDeleted = async (deletedPostId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      setLoading(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'posts', deletedPostId));
      setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      setEditingPost(null); // Clear form if the deleted post was being edited
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
              // If already in create mode, increment key to force remount and reset the form
              setFormKey(prevKey => prevKey + 1);
            } else {
              // If in edit mode, switch to create mode, which will naturally reset via useEffect
              setEditingPost(null);
              setFormKey(prevKey => prevKey + 1); // Also increment key to ensure a fresh form instance
            }
          }}
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-6 inline-flex items-center shadow-md hover:shadow-lg"
        >
          <FaPlusSquare className="mr-2" /> {editingPost ? 'Cancel Edit / Create New' : 'Create New Post'}
        </button>

        <AdminPostForm
          key={formKey} // Use key prop to force remount and reset when needed
          post={editingPost}
          onPostSaved={handlePostSaved}
          onPostDeleted={handlePostDeleted}
        />
      </section>

      <section className="animate-fade-in-up animation-delay-200">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text mt-8 md:mt-12 mb-4 md:mb-6">Existing Posts</h3>
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
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-4 text-center text-gray-text">No posts found.</td>
                  </tr>
                ) : (
                  posts.map((post) => (
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