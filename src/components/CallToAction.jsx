import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = ({ title, description, buttonText, buttonLink, bgColor = 'bg-primary', textColor = 'text-light-text' }) => {
  return (
    <section className={`${bgColor} ${textColor} py-16 px-4 text-center rounded-lg shadow-xl my-12`}>
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">{title}</h2>
        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
          {description}
        </p>
        <Link
          to={buttonLink}
          className="inline-block bg-accent text-dark-background font-bold text-xl py-4 px-10 rounded-full hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
};

export default CallToAction;