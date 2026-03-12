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
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-5xl font-bold text-dark mb-10 text-center">Our Comprehensive Courses</h1>
      <p className="text-xl text-gray-700 text-center mb-12 max-w-3xl mx-auto">
        Mathematico offers a diverse range of courses designed to cater to students at every stage of their mathematical journey. From foundational concepts to advanced competitive training, we have a program for you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col">
            <img src={course.image} alt={course.title} className="w-full h-56 object-cover object-center" />
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-3xl font-bold text-dark mb-3 text-primary">{course.title}</h2>
              <p className="text-gray-700 mb-4 flex-grow">{course.description}</p>
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{course.level}</span>
              </div>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-auto pt-4 border-t border-gray-100">
                {course.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="mt-6 bg-secondary text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 shadow-md self-start">
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-primary text-white p-8 rounded-lg shadow-xl mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Not sure which course is right for you?</h2>
        <p className="text-lg mb-6">
          Contact us for a free consultation and let our experts guide you to the perfect program.
        </p>
        <button className="bg-white text-dark font-bold py-3 px-8 rounded-full hover:bg-gray-100 transition-colors duration-300 transform hover:scale-105 shadow-md">
          Schedule a Consultation
        </button>
      </section>
    </div>
  );
};

export default CoursesPage;