import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';

const categories = ['all', 'blog', 'problem', 'puzzle', 'riddle', 'article', 'quiz'];

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        let q = collection(db, 'posts');
        if (selectedCategory !== 'all') {
          q = query(q, where('category', '==', selectedCategory));
        }
        q = query(q, orderBy('timestamp', 'desc'));

        const querySnapshot = await getDocs(q);
        const fetchedPosts = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(fetchedPosts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-5xl font-bold text-dark mb-10 text-center">Our Latest Posts & Resources</h1>
      <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
        Explore a wide range of mathematical topics, challenging problems, intriguing puzzles, and insightful articles from our experts.
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300
              ${selectedCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-gray-200 text-dark hover:bg-gray-300'
              }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && posts.length === 0 && !error && (
        <p className="text-center text-gray-600 text-xl mt-8">No posts found for this category.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostsPage;