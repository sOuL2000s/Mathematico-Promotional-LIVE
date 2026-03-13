import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-background px-4 py-12">
      <div className="text-center">
        <p className="text-9xl font-extrabold text-accent mb-4">404</p>
        <h1 className="text-5xl md:text-6xl font-bold text-light-text mb-6 leading-tight">Page Not Found</h1>
        <p className="text-xl text-secondary mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-light-text font-bold text-lg py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;