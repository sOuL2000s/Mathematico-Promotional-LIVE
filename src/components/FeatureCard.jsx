import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center border border-gray-100 transform hover:-translate-y-2">
      <div className="text-primary text-5xl mb-4">{icon}</div> {/* Placeholder for icon */}
      <h3 className="text-2xl font-semibold mb-3 text-dark">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;