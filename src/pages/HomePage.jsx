import React from 'react';
import { Link } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import FeatureCard from '../components/FeatureCard';
import { FaBrain, FaMobileAlt, FaLightbulb, FaChartLine } from 'react-icons/fa'; // Importing icons

const HomePage = () => {
  const features = [
    {
      icon: FaBrain, // Using the imported icon component
      title: 'Expert Coaching',
      description: 'Learn from experienced educators who make complex concepts simple and engaging.'
    },
    {
      icon: FaMobileAlt, // Using the imported icon component
      title: 'Interactive Android App',
      description: 'Practice anytime, anywhere with our cutting-edge app featuring quizzes, problems, and progress tracking.'
    },
    {
      icon: FaLightbulb, // Using the imported icon component
      title: 'Personalized Learning',
      description: 'Tailored study plans and one-on-one support to address your unique learning needs.'
    },
    {
      icon: FaChartLine, // Using the imported icon component
      title: 'Proven Results',
      description: 'Join a community of successful students who have achieved their academic goals with Mathematico.'
    }
  ];

  return (
    <div className="min-h-screen bg-light">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-emerald-600 text-white py-16 md:py-24 px-4 text-center overflow-hidden">
        <div className="container mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight animate-fade-in-up">
            Master Mathematics with <span className="text-accent">Mathematico</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 max-w-4xl mx-auto opacity-90 animate-fade-in-up animation-delay-200">
            Unlocking your potential in numbers, one problem at a time. Join our coaching center and supercharge your learning with our innovative Android app!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/courses"
              className="bg-secondary text-white font-bold text-lg sm:text-xl py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up animation-delay-400"
            >
              Explore Our Courses
            </Link>
            <a
              href="/" /* Placeholder for app download link */
              className="bg-white text-dark font-bold text-lg sm:text-xl py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up animation-delay-600"
            >
              Download Our App
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-12 md:py-20 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-dark mb-8 md:mb-14">Why Choose Mathematico?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </section>

      {/* Call to Action for Blog/Posts */}
      <section className="container mx-auto px-4 my-8 md:my-12">
        <CallToAction
          title="Dive Deeper into Mathematics"
          description="Explore insightful articles, challenging problems, and fun puzzles on our blog."
          buttonText="Visit Our Blog"
          buttonLink="/posts"
          bgColor="bg-dark"
          textColor="text-white"
        />
      </section>

      {/* App Promotion Section (Example) */}
      <section className="bg-light py-12 md:py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="md:w-1/2 text-center md:text-left animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4 md:mb-6">Learn Smarter with Our Android App</h2>
            <p className="text-base sm:text-lg text-gray-base mb-6 md:mb-8">
              Our companion Android app offers a personalized learning experience with interactive lessons, practice problems, real-time feedback, and progress tracking. Perfect for students on the go!
            </p>
            <a
              href="/" /* Placeholder for app download link */
              className="inline-block bg-primary text-white font-bold text-base sm:text-lg py-3 px-6 sm:px-8 rounded-full hover:bg-emerald-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
            >
              Get the App Now!
            </a>
          </div>
          <div className="md:w-1/2 flex justify-center animate-fade-in-up animation-delay-200">
            {/* Placeholder for app screenshot/mockup */}
            <img
              src="https://via.placeholder.com/400x600?text=Mathematico+App+Screenshot"
              alt="Mathematico Android App"
              className="rounded-xl shadow-2xl max-w-full h-auto w-64 sm:w-80 md:w-[400px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;