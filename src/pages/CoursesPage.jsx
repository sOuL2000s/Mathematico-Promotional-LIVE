import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { FaCheckCircle, FaBookOpen, FaAward, FaPuzzlePiece } from 'react-icons/fa'; // Importing icons

const courses = [
  {
    title: "Foundation Mathematics (Grades 6-8)",
    description: "Build a strong base with core concepts in arithmetic, algebra fundamentals, and geometry. Perfect for bridging gaps and preparing for higher grades.",
    features: ["Concept Clarity", "Problem Solving", "Regular Assessments"],
    level: "Beginner",
    image: "https://via.placeholder.com/300x200?text=Foundation+Math",
    icon: FaBookOpen,
  },
  {
    title: "Advanced Algebra & Calculus (Grades 9-12)",
    description: "Master advanced algebraic techniques, functions, trigonometry, and an introduction to differential and integral calculus. Essential for STEM aspirants.",
    features: ["In-depth Curriculum", "JEE/NEET Prep", "Advanced Problem Sets"],
    level: "Intermediate/Advanced",
    image: "https://via.placeholder.com/300x200?text=Algebra+Calculus",
    icon: FaAward,
  },
  {
    title: "Competitive Math Training",
    description: "Prepare for Olympiads, national math competitions, and entrance exams with specialized training in number theory, combinatorics, and geometry.",
    features: ["Strategy Building", "Mock Tests", "Expert Mentorship"],
    level: "Advanced",
    image: "https://via.placeholder.com/300x200?text=Competitive+Math",
    icon: FaAward,
  },
  {
    title: "Logical Reasoning & Aptitude",
    description: "Enhance your logical thinking and quantitative aptitude skills crucial for various competitive exams and everyday problem-solving.",
    features: ["Puzzles & Games", "Critical Thinking", "Timed Practice"],
    level: "All Levels",
    image: "https://via.placeholder.com/300x200?text=Logical+Reasoning",
    icon: FaPuzzlePiece,
  }
];

const CoursesPage = () => {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-8 md:mb-10 text-center animate-fade-in-up">Our Comprehensive Courses</h1>
      <p className="text-base sm:text-xl text-gray-base text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Mathematico offers a diverse range of courses designed to cater to students at every stage of their mathematical journey. From foundational concepts to advanced competitive training, we have a program for you.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {courses.map((course, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <img src={course.image} alt={course.title} className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-300" />
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <div className="flex items-center mb-2 sm:mb-3">
                {course.icon && <course.icon className="text-primary text-2xl mr-2" />}
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark text-primary leading-tight">{course.title}</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-base mb-3 sm:mb-4 flex-grow text-balance">{course.description}</p>
              <div className="mb-3 sm:mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{course.level}</span>
              </div>
              <ul className="list-disc list-inside text-gray-base text-sm sm:text-base space-y-2 mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                {course.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <FaCheckCircle className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-4 sm:mt-6 bg-secondary text-white font-bold py-2.5 px-5 sm:px-6 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md self-start text-sm sm:text-base">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-primary text-white p-6 md:p-8 rounded-xl shadow-xl mt-8 md:mt-16 text-center animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Not sure which course is right for you?</h2>
        <p className="text-base sm:text-lg mb-4 md:mb-6 opacity-90">
          Contact us for a free consultation and let our experts guide you to the perfect program.
        </p>
        <Link to="/contact" className="inline-block bg-white text-dark font-bold py-2.5 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg">
          Schedule a Consultation
        </Link>
      </section>
    </div>
  );
};

export default CoursesPage;