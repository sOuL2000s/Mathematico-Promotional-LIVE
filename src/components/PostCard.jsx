import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa'; // Import heart icon

const PostCard = ({ post }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No Date';
    // Firebase Timestamps have a toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv', '.flv'];
    // Check if the URL string contains any known video file extension
    // Also, Cloudinary URLs might have a type indicator like /video/upload/
    return videoExtensions.some(ext => url.toLowerCase().includes(ext)) || url.toLowerCase().includes('/video/upload/');
  };

  // Helper to add Cloudinary transformations
  const getOptimizedImageUrl = (url, width) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Example: insert 'f_auto,q_auto,w_WIDTH' after '/upload/'
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  };

  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div className="bg-medium-dark rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-secondary h-full flex flex-col group">
        {post.imageUrl && (
          <div className="relative w-full h-48 overflow-hidden">
            {isVideo(post.imageUrl) ? (
              <video
                src={post.imageUrl}
                preload="metadata" // Load metadata to show first frame
                loading="lazy" // Lazy load video
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={getOptimizedImageUrl(post.imageUrl, 500)} // Optimize image for display width
                alt={post.title}
                loading="lazy" // Lazy load image
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { e.target.onerror = null; e.target.src = "/logo512.png" }} // Fallback image
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-light-text text-lg font-bold">View Post</span>
            </div>
          </div>
        )}
        <div className="p-5 flex flex-col flex-grow">
          <span className="text-sm text-primary font-semibold mb-2 uppercase tracking-wide">{post.category}</span>
          <h3 className="text-2xl font-bold text-light-text mb-3 leading-tight group-hover:text-accent transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-gray-text text-base mb-4 flex-grow line-clamp-3">
            {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
          </p>
          <div className="flex justify-between items-center text-secondary text-sm mt-auto pt-4 border-t border-secondary">
            <span className="text-gray-text">By {post.author || 'Admin'}</span>
            <span className="text-gray-text">{formatDate(post.timestamp)}</span>
            <span className="flex items-center text-red-500">
              <FaHeart className="w-4 h-4 mr-1" />
              {post.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;