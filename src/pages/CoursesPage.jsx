import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore'; // Removed 'where'
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaCheckCircle, FaBookOpen, FaAward, FaPuzzlePiece, FaWhatsapp, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Importing icons
import { useWhatsApp } from '../context/WhatsAppContext'; // Import useWhatsApp context

const courseLevels = ['all', 'Beginner', 'Intermediate', 'Advanced', 'All Levels']; // Levels used for filtering
const courseCategories = ['all', 'Algebra', 'Geometry', 'Calculus', 'Competitive', 'Foundational', 'Advanced Topics'];

const CoursesPage = () => {
  const [allCourses, setAllCourses] = useState([]); // Store all fetched courses
  const [displayedCourses, setDisplayedCourses] = useState([]); // Courses after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt'); // Default sort key
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const { openModal } = useWhatsApp();

  const iconsMap = {
    'Beginner': FaBookOpen,
    'Intermediate': FaAward,
    'Advanced': FaAward,
    'All Levels': FaPuzzlePiece,
  };

  const fetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCourses(fetchedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  // Effect to filter and sort courses based on user input
  useEffect(() => {
    let tempCourses = [...allCourses];

    // 1. Category Filter
    if (selectedCategory !== 'all') {
      tempCourses = tempCourses.filter(course => course.category === selectedCategory);
    }

    // 2. Level Filter
    if (selectedLevel !== 'all') {
      tempCourses = tempCourses.filter(course => course.level === selectedLevel);
    }

    // 3. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempCourses = tempCourses.filter(course => {
        const titleMatch = (course.title || '').toLowerCase().includes(lowerCaseSearchTerm);
        const descriptionMatch = (course.description || '').toLowerCase().includes(lowerCaseSearchTerm);
        const levelMatch = (course.level || '').toLowerCase().includes(lowerCaseSearchTerm);
        const categoryMatch = (course.category || '').toLowerCase().includes(lowerCaseSearchTerm);
        const featuresMatch = (course.features && Array.isArray(course.features)) ? course.features.some(feature => (feature || '').toLowerCase().includes(lowerCaseSearchTerm)) : false;
        const buttonTextMatch = (course.buttonText || '').toLowerCase().includes(lowerCaseSearchTerm);
        return titleMatch || descriptionMatch || levelMatch || categoryMatch || featuresMatch || buttonTextMatch;
      });
    }

    // 4. Sort
    tempCourses.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'createdAt') {
        valA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        valB = b.createdAt ? b.createdAt.toDate() : new Date(0);
      } else { // 'title', 'level', 'category'
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedCourses(tempCourses);
  }, [allCourses, selectedCategory, selectedLevel, searchTerm, sortKey, sortOrder]);

  // Helper to add Cloudinary transformations
  const getOptimizedImageUrl = (url, width) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Example: insert 'f_auto,q_auto,w_WIDTH' after '/upload/'
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  };

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Our Comprehensive Courses</h1>
        <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
          Mathematico offers a diverse range of courses designed to cater to students at every stage of their mathematical journey. From foundational concepts to advanced competitive training, we have a program for you.
        </p>

      {/* Controls: Search, Category Filter, Level Filter, Sort */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8 md:mb-10 animate-fade-in-up animation-delay-200">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
        />

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2 w-full md:w-auto">
          {courseCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 whitespace-nowrap
                ${selectedCategory === cat
                  ? 'bg-accent text-dark-background shadow-md hover:bg-cyan-400'
                  : 'bg-secondary text-dark-background hover:bg-light-text'
                }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Level Filter */}
        <div className="relative w-full md:w-auto">
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          >
            {courseLevels.map(level => (
              <option key={level} value={level}>
                {level === 'all' ? 'All Levels' : level}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
            <FaSortAlphaDown /> {/* Generic icon for filter dropdown */}
          </div>
        </div>

        {/* Sort Dropdown */}
        <div className="relative w-full md:w-auto">
          <select
            value={`${sortKey}-${sortOrder}`}
            onChange={(e) => {
              const [key, order] = e.target.value.split('-');
              setSortKey(key);
              setSortOrder(order);
            }}
            className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="level-asc">Level (Asc)</option>
            <option value="level-desc">Level (Desc)</option>
            <option value="category-asc">Category (A-Z)</option>
            <option value="category-desc">Category (Z-A)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
            {sortOrder === 'asc' ? <FaSortAlphaUp /> : <FaSortAlphaDown />}
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <ErrorDisplay message={error} />}

      {!loading && displayedCourses.length === 0 && !error && (
        <p className="text-center text-secondary text-base sm:text-xl mt-8 animate-fade-in">No courses found matching your criteria.</p>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {displayedCourses.map((course, index) => {
          const CourseIcon = iconsMap[course.level] || FaBookOpen;
          return (
            <div key={course.id} className="group bg-medium-dark rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-secondary flex flex-col animate-fade-in-up transform hover:-translate-y-2 hover:border-accent" style={{ animationDelay: `${index * 0.1}s` }}>
              {course.imageUrl && <img src={getOptimizedImageUrl(course.imageUrl, 500)} alt={course.title} loading="lazy" className="w-full h-48 sm:h-56 object-cover object-center group-hover:scale-105 transition-transform duration-300" />}
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
                {course.useCustomEnrollButton && course.buttonText && course.buttonLink ? (
                  <a href={course.buttonLink} target="_blank" rel="noopener noreferrer" className="mt-4 sm:mt-6 bg-accent text-dark-background font-bold py-2.5 px-5 sm:px-6 rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 shadow-md self-start text-sm sm:text-base">
                    {course.buttonText}
                  </a>
                ) : (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openModal({
                        subject: `Inquiry about ${course.title} Course`,
                        userInterest: course.title
                      });
                    }}
                    className="mt-4 sm:mt-6 bg-primary text-light-text font-bold py-2.5 px-5 sm:px-6 rounded-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-md self-start text-sm sm:text-base flex items-center justify-center"
                  >
                    <FaWhatsapp className="mr-2" /> Inquire on WhatsApp
                  </button>
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