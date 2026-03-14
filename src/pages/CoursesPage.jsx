import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaCheckCircle, FaBookOpen, FaAward, FaPuzzlePiece } from 'react-icons/fa'; // Importing icons

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const iconsMap = {
    'Beginner': FaBookOpen,
    'Intermediate': FaAward,
    'Advanced': FaAward,
    'All Levels': FaPuzzlePiece,
    // Add more mappings if needed, or create a default
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'asc')); // Assuming 'createdAt' field
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Our Comprehensive Courses</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        Mathematico offers a diverse range of courses designed to cater to students at every stage of their mathematical journey. From foundational concepts to advanced competitive training, we have a program for you.
      </p>

      {!loading && courses.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No courses available at the moment.</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {courses.map((course, index) => {
          const CourseIcon = iconsMap[course.level] || FaBookOpen; // Default icon if level not mapped
          return (
            <div key={course.id} className="group bg-medium-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-secondary flex flex-col animate-fade-in-up transform hover:-translate-y-2 hover:border-accent" style={{ animationDelay: `${index * 0.1}s` }}>
              {course.imageUrl && <img src={course.imageUrl} alt={course.title} className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-300" />}
              <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-2 sm:mb-3">
                  <CourseIcon className="text-accent text-2xl mr-2" />
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary leading-tight">{course.title}</h2>
                </div>
                <p className="text-sm sm:text-base text-secondary mb-3 sm:mb-4 flex-grow text-balance">{course.description}</p>
                <div className="mb-3 sm:mb-4">
                  <span className="inline-block bg-primary text-light-text text-xs font-semibold px-2.5 py-1 rounded-full">{course.level}</span>
                </div>
                <ul className="list-disc list-inside text-secondary text-sm sm:text-base space-y-2 mt-auto pt-3 sm:pt-4 border-t border-secondary">
                  {course.features && course.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <FaCheckCircle className="w-4 h-4 mr-2 text-accent flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {course.buttonText && course.buttonLink && (
                  <a href={course.buttonLink} target="_blank" rel="noopener noreferrer" className="mt-4 sm:mt-6 bg-accent text-dark-background font-bold py-2.5 px-5 sm:px-6 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-md self-start text-sm sm:text-base">
                    {course.buttonText}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </section>

      <section className="bg-primary text-light-text p-6 md:p-8 rounded-xl shadow-xl mt-8 md:mt-16 text-center animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Not sure which course is right for you?</h2>
        <p className="text-base sm:text-lg mb-4 md:mb-6 opacity-90">
          Contact us for a free consultation and let our experts guide you to the perfect program.
        </p>
        <Link to="/contact" className="inline-block bg-accent text-dark-background font-bold py-2.5 px-6 sm:px-8 rounded-full hover:bg-cyan-400 transition-colors duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg">
          Schedule a Consultation
        </Link>
      </section>
    </div>
  );
};

export default CoursesPage;