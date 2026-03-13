import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaNewspaper, FaStar, FaCommentDots, FaBookOpen } from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalReviews: 0,
    totalComments: 0,
    latestPost: null,
    latestReview: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch posts
      const postsQ = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const postsSnap = await getDocs(postsQ);
      const totalPosts = postsSnap.size;
      const latestPost = postsSnap.docs.length > 0 ? { id: postsSnap.docs[0].id, ...postsSnap.docs[0].data() } : null;

      // Fetch reviews
      const reviewsQ = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'));
      const reviewsSnap = await getDocs(reviewsQ);
      const totalReviews = reviewsSnap.size;
      const latestReview = reviewsSnap.docs.length > 0 ? { id: reviewsSnap.docs[0].id, ...reviewsSnap.docs[0].data() } : null;

      // Fetch comments (by iterating through posts)
      let totalComments = 0;
      for (const postDoc of postsSnap.docs) {
        const commentsQ = collection(db, 'posts', postDoc.id, 'comments');
        const commentsSnap = await getDocs(commentsQ);
        totalComments += commentsSnap.size;
      }

      setStats({
        totalPosts,
        totalReviews,
        totalComments,
        latestPost,
        latestReview,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Admin Dashboard Overview</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <StatCard icon={FaNewspaper} title="Total Posts" value={stats.totalPosts} />
        <StatCard icon={FaStar} title="Total Reviews" value={stats.totalReviews} />
        <StatCard icon={FaCommentDots} title="Total Comments" value={stats.totalComments} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary animate-fade-in-up animation-delay-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 flex items-center">
            <FaNewspaper className="mr-3 text-accent" /> Latest Post
          </h2>
          {stats.latestPost ? (
            <div>
              <h3 className="text-xl font-semibold text-light-text mb-2">{stats.latestPost.title}</h3>
              <p className="text-gray-text text-sm mb-3">By {stats.latestPost.author || 'Admin'} on {formatDate(stats.latestPost.timestamp)}</p>
              <p className="text-secondary line-clamp-3">{stats.latestPost.content}</p>
              <a href={`/posts/${stats.latestPost.id}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-primary hover:text-accent transition-colors duration-200 text-sm">
                View Post &rarr;
              </a>
            </div>
          ) : (
            <p className="text-secondary">No posts found.</p>
          )}
        </div>

        <div className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary animate-fade-in-up animation-delay-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 flex items-center">
            <FaStar className="mr-3 text-accent" /> Latest Review
          </h2>
          {stats.latestReview ? (
            <div>
              <h3 className="text-xl font-semibold text-light-text mb-2">{stats.latestReview.reviewerName || 'Anonymous'}</h3>
              <div className="flex items-center text-accent mb-2">
                {Array.from({ length: stats.latestReview.rating }).map((_, i) => (
                  <FaStar key={i} className="w-5 h-5 mr-1" />
                ))}
              </div>
              <p className="text-secondary line-clamp-3">{stats.latestReview.feedbackText}</p>
              <p className="text-gray-text text-sm mt-3">On {formatDate(stats.latestReview.timestamp)}</p>
            </div>
          ) : (
            <p className="text-secondary">No reviews found.</p>
          )}
        </div>
      </section>

      <section className="mt-12 text-center animate-fade-in-up animation-delay-300">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text mb-6">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/admin/posts" className="bg-primary text-light-text py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-lg font-semibold shadow-md">
            <FaNewspaper className="mr-2" /> Manage Posts
          </Link>
          <Link to="/admin/reviews" className="bg-primary text-light-text py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-lg font-semibold shadow-md">
            <FaStar className="mr-2" /> Moderate Reviews
          </Link>
          <Link to="/admin/comments" className="bg-primary text-light-text py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-lg font-semibold shadow-md">
            <FaCommentDots className="mr-2" /> Moderate Comments
          </Link>
          <Link to="/admin/courses" className="bg-primary text-light-text py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center text-lg font-semibold shadow-md">
            <FaBookOpen className="mr-2" /> Manage Courses
          </Link>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value }) => (
  <div className="bg-medium-dark p-6 rounded-xl shadow-lg border border-secondary text-center flex flex-col items-center justify-center animate-fade-in">
    <Icon className="text-accent text-5xl mb-3" />
    <h3 className="text-xl font-semibold text-primary mb-2">{title}</h3>
    <p className="text-4xl font-bold text-light-text">{value}</p>
  </div>
);

export default AdminDashboardPage;