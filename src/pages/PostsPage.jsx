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
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Our Latest Posts & Resources</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Explore a wide range of mathematical topics, challenging problems, intriguing puzzles, and insightful articles from our experts.
      </p>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 md:mb-10 animate-fade-in-up animation-delay-200">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-sm sm:text-lg font-semibold transition-all duration-300 whitespace-nowrap
              ${selectedCategory === cat
                ? 'bg-accent text-dark-background shadow-md hover:bg-cyan-400'
                : 'bg-secondary text-dark-background hover:bg-light-text'
              }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && posts.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No posts found for this category.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((post, index) => (
          <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostsPage;