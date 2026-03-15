import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AdminCourseForm from '../components/AdminCourseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaEdit, FaTrash, FaPlusSquare, FaSortAlphaDown, FaSortAlphaUp, FaCalendarAlt } from 'react-icons/fa';

const courseLevels = ['all', 'Beginner', 'Intermediate', 'Advanced', 'All Levels']; // Levels used for filtering
const courseCategories = ['all', 'Algebra', 'Geometry', 'Calculus', 'Competitive', 'Foundational', 'Advanced Topics'];

const AdminCoursesPage = () => {
  const [allCourses, setAllCourses] = useState([]); // Store all fetched courses
  const [displayedCourses, setDisplayedCourses] = useState([]); // Courses after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // For filtering by category in the table
  const [filterLevel, setFilterLevel] = useState('all'); // For filtering by level in the table
  const [sortKey, setSortKey] = useState('createdAt'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchAllCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCourses(fetchedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses.");
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
    if (filterCategory !== 'all') {
      tempCourses = tempCourses.filter(course => course.category === filterCategory);
    }

    // 2. Level Filter
    if (filterLevel !== 'all') {
      tempCourses = tempCourses.filter(course => course.level === filterLevel);
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
      } else { // 'title', 'level', 'category', 'buttonText'
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedCourses(tempCourses);
  }, [allCourses, searchTerm, filterCategory, filterLevel, sortKey, sortOrder]);


  const handleCourseSaved = () => {
    setEditingCourse(null);
    fetchAllCourses();
  };

  const handleCourseDeleted = async (deletedCourseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'courses', deletedCourseId));
      setAllCourses(prevCourses => prevCourses.filter(c => c.id !== deletedCourseId));
      setEditingCourse(null);
      alert('Course deleted successfully!');
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Failed to delete course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Manage Courses</h1>

      <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary mb-8 md:mb-12 animate-fade-in-up animation-delay-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 md:mb-8">{editingCourse ? 'Edit Course' : 'Create New Course'}</h2>
        <button
          onClick={() => {
            if (editingCourse === null) {
              setFormKey(prevKey => prevKey + 1);
            } else {
              setEditingCourse(null);
              setFormKey(prevKey => prevKey + 1);
            }
          }}
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-6 inline-flex items-center shadow-md hover:shadow-lg"
        >
          <FaPlusSquare className="mr-2" /> {editingCourse ? 'Cancel Edit / Create New' : 'Create New Course'}
        </button>

        <AdminCourseForm
          key={formKey}
          course={editingCourse}
          onCourseSaved={handleCourseSaved}
          onCourseDeleted={handleCourseDeleted}
        />
      </section>

      <section className="animate-fade-in-up animation-delay-200">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text mt-8 md:mt-12 mb-4 md:mb-6">Existing Courses</h3>

        {/* Controls: Search, Category Filter, Level Filter, Sort */}
        <div className="flex flex-col md:flex-row items-center justify-start gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
          />

          {/* Category Filter */}
          <div className="relative w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            >
              {courseCategories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
              <FaCalendarAlt /> {/* Generic filter icon */}
            </div>
          </div>

          {/* Level Filter */}
          <div className="relative w-full md:w-auto">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full md:w-auto appearance-none p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary pr-10"
            >
              {courseLevels.map(level => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All Levels' : level}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary">
              <FaCalendarAlt /> {/* Generic filter icon */}
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

        {error && <ErrorDisplay message={error} />}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto bg-medium-dark rounded-lg shadow-sm border border-secondary">
            <table className="min-w-full bg-medium-dark table-auto border-collapse">
              <thead className="bg-dark-background">
                <tr className="text-light-text uppercase text-xs sm:text-sm leading-normal">
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Title</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Level</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Category</th>
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Button Text</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Created At</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="text-secondary text-xs sm:text-sm font-light">
                {displayedCourses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-text">No courses found matching your criteria.</td>
                  </tr>
                ) : (
                  displayedCourses.map((course) => (
                    <tr key={course.id} className="border-b border-secondary hover:bg-dark-background transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap">
                        <span className="font-medium text-light-text">{course.title}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <span className="bg-primary text-light-text py-1 px-2 rounded-full text-xs font-semibold">{course.level}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <span className="bg-secondary text-dark-background py-1 px-2 rounded-full text-xs font-semibold">{course.category || 'N/A'}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left text-light-text">{course.buttonText || 'N/A'}</td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-text">{formatDate(course.createdAt)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => setEditingCourse(course)}
                            className="bg-primary text-light-text px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-xs inline-flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleCourseDeleted(course.id)}
                            className="bg-red-500 text-light-text px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors text-xs inline-flex items-center"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminCoursesPage;