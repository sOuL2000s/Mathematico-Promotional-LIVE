import React from 'react';

const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-medium-dark p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center border border-secondary transform hover:-translate-y-2 hover:border-accent">
      <div className="text-accent text-5xl mb-4 mx-auto w-fit">
        <Icon />
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-light-text">{title}</h3>
      <p className="text-gray-text leading-relaxed text-balance">{description}</p>
    </div>
  );
};

export default FeatureCard;