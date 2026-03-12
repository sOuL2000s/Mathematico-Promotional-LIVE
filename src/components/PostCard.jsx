import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No Date';
    // Firebase Timestamps have a toDate() method
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Link to={`/posts/${post.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-48 object-cover object-center"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x200?text=Mathematico+Post" }} // Fallback image
          />
        )}
        <div className="p-6 flex flex-col flex-grow">
          <span className="text-sm text-primary font-semibold mb-2 uppercase">{post.category}</span>
          <h3 className="text-2xl font-bold text-dark mb-3 leading-tight hover:text-secondary transition-colors duration-200">
            {post.title}
          </h3>
          <p className="text-gray-600 text-base mb-4 flex-grow line-clamp-3">
            {post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}
          </p>
          <div className="flex justify-between items-center text-gray-500 text-sm mt-auto pt-4 border-t border-gray-100">
            <span>By {post.author || 'Admin'}</span>
            <span>{formatDate(post.timestamp)}</span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
              {post.likes || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;