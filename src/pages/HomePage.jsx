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
    <div className="min-h-screen bg-dark-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-background via-[#1f232e] to-primary text-light-text py-16 md:py-24 px-4 text-center overflow-hidden">
        {/* Mathematical background pattern */}
        <div className="absolute inset-0 z-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234CC9F0' fill-opacity='0.2'%3E%3Cpath d='M100 0L0 100V0h100zM0 100L100 0v100H0z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '200px',
          animation: 'rotateAndZoom 60s infinite linear',
          backgroundRepeat: 'repeat',
          transform: 'scale(1.2)'
        }}></div>
         <div className="absolute inset-0 z-0 opacity-0.5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233D5A9E' fill-opacity='0.3'%3E%3Cpath d='M30 30L0 0H60z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '150px',
          animation: 'panX 100s infinite linear alternate',
          backgroundRepeat: 'repeat',
          transform: 'scale(1.1)'
        }}></div>

        <style jsx="true">{`
          @keyframes rotateAndZoom {
            0% { background-position: 0% 0%; transform: scale(1.1) rotate(0deg); }
            50% { background-position: 50% 50%; transform: scale(1.3) rotate(180deg); }
            100% { background-position: 100% 100%; transform: scale(1.1) rotate(360deg); }
          }
          @keyframes panX {
            from { background-position: 0% 0%; }
            to { background-position: 100% 0%; }
          }
        `}</style>

        <div className="container mx-auto relative z-10"> {/* Ensure content is above patterns */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 md:mb-6 leading-tight animate-fade-in-up">
            Unlocking Mathematical Brilliance: Master Mathematics with <span className="text-accent">Mathematico</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-10 max-w-4xl mx-auto opacity-90 animate-fade-in-up animation-delay-200">
            Your journey to truly understand and excel in mathematics starts now. We offer comprehensive coaching for all academic boards and competitive exams, empowering your potential in numbers. Enhance your learning experience with our innovative Android app!
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/courses"
              className="bg-accent text-dark-background font-bold text-lg sm:text-xl py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up animation-delay-400"
            >
              Explore Our Courses
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.anupam1505.mathematicoapp" target="_blank" rel="noopener noreferrer"
              className="bg-light-text text-dark-background font-bold text-lg sm:text-xl py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-secondary transition-all duration-300 transform hover:scale-105 shadow-xl animate-fade-in-up animation-delay-600"
            >
              Download Our App
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto py-12 md:py-20 px-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-light-text mb-8 md:mb-14">Why Choose Mathematico?</h2>
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
          bgColor="bg-dark-background"
          textColor="text-light-text"
        />
      </section>

      {/* App Promotion Section (Example) */}
      <section className="bg-dark-background py-12 md:py-20 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="md:w-1/2 text-center md:text-left animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-light-text mb-4 md:mb-6">Learn Smarter with Our Android App</h2>
            <p className="text-base sm:text-lg text-secondary mb-6 md:mb-8">
              Our companion Android app offers a personalized learning experience with interactive lessons, practice problems, real-time feedback, and progress tracking. Perfect for students on the go!
            </p>
            <a
              href="https://play.google.com/store/apps/details?id=com.anupam1505.mathematicoapp" target="_blank" rel="noopener noreferrer"
              className="inline-block bg-primary text-light-text font-bold text-base sm:text-lg py-3 px-6 sm:px-8 rounded-full hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
            >
              Get the App Now!
            </a>
          </div>
          <div className="md:w-1/2 flex justify-center animate-fade-in-up animation-delay-200">
            {/* Placeholder for app screenshot/mockup */}
            <img
              src="/mathematico-app-qr.png"
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