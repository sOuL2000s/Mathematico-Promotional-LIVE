import React from 'react';

const courses = [
  {
    title: "Foundation Mathematics (Grades 6-8)",
    description: "Build a strong base with core concepts in arithmetic, algebra fundamentals, and geometry. Perfect for bridging gaps and preparing for higher grades.",
    features: ["Concept Clarity", "Problem Solving", "Regular Assessments"],
    level: "Beginner",
    image: "https://via.placeholder.com/300x200?text=Foundation+Math"
  },
  {
    title: "Advanced Algebra & Calculus (Grades 9-12)",
    description: "Master advanced algebraic techniques, functions, trigonometry, and an introduction to differential and integral calculus. Essential for STEM aspirants.",
    features: ["In-depth Curriculum", "JEE/NEET Prep", "Advanced Problem Sets"],
    level: "Intermediate/Advanced",
    image: "https://via.placeholder.com/300x200?text=Algebra+Calculus"
  },
  {
    title: "Competitive Math Training",
    description: "Prepare for Olympiads, national math competitions, and entrance exams with specialized training in number theory, combinatorics, and geometry.",
    features: ["Strategy Building", "Mock Tests", "Expert Mentorship"],
    level: "Advanced",
    image: "https://via.placeholder.com/300x200?text=Competitive+Math"
  },
  {
    title: "Logical Reasoning & Aptitude",
    description: "Enhance your logical thinking and quantitative aptitude skills crucial for various competitive exams and everyday problem-solving.",
    features: ["Puzzles & Games", "Critical Thinking", "Timed Practice"],
    level: "All Levels",
    image: "https://via.placeholder.com/300x200?text=Logical+Reasoning"
  }
];

const CoursesPage = () => {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-8 md:mb-10 text-center">Our Comprehensive Courses</h1>
      <p className="text-base sm:text-xl text-gray-700 text-center mb-8 md:mb-12 max-w-3xl mx-auto">
        Mathematico offers a diverse range of courses designed to cater to students at every stage of their mathematical journey. From foundational concepts to advanced competitive training, we have a program for you.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {courses.map((course, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
            <img src={course.image} alt={course.title} className="w-full h-48 sm:h-56 object-cover object-center" />
            <div className="p-4 sm:p-6 flex flex-col flex-grow">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark mb-2 sm:mb-3 text-primary">{course.title}</h2>
              <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 flex-grow">{course.description}</p>
              <div className="mb-3 sm:mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 sm:px-3 py-1 rounded-full">{course.level}</span>
              </div>
              <ul className="list-disc list-inside text-gray-600 text-sm sm:text-base space-y-1 mt-auto pt-3 sm:pt-4 border-t border-gray-100">
                {course.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-4 sm:mt-6 bg-secondary text-white font-bold py-2 sm:py-3 px-5 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-md self-start text-sm sm:text-base">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-primary text-white p-6 md:p-8 rounded-lg shadow-xl mt-8 md:mt-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Not sure which course is right for you?</h2>
        <p className="text-base sm:text-lg mb-4 md:mb-6">
          Contact us for a free consultation and let our experts guide you to the perfect program.
        </p>
        <button className="bg-white text-dark font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg">
          Schedule a Consultation
        </button>
      </section>
    </div>
  );
};

export default CoursesPage;