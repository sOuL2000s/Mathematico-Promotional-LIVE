import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AdminCourseForm from '../components/AdminCourseForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaEdit, FaTrash, FaPlusSquare } from 'react-icons/fa';

const AdminCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null); // null for create, course object for edit
  const [formKey, setFormKey] = useState(0); // Key to force remount of AdminCourseForm for reset

    const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc')); // Assuming 'createdAt' field
      const querySnapshot = await getDocs(q);
      const fetchedCourses = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(fetchedCourses);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCourseSaved = () => {
    setEditingCourse(null); // Exit edit mode
    fetchCourses(); // Refresh courses list
  };

  const handleCourseDeleted = async (deletedCourseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      setLoading(true); // Indicate loading for deletion
      await deleteDoc(doc(db, 'courses', deletedCourseId));
      setCourses(prevCourses => prevCourses.filter(c => c.id !== deletedCourseId));
      setEditingCourse(null); // Clear form if the deleted course was being edited
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
              // If already in create mode, increment key to force remount and reset the form
              setFormKey(prevKey => prevKey + 1);
            } else {
              // If in edit mode, switch to create mode, which will naturally reset via useEffect
              setEditingCourse(null);
              setFormKey(prevKey => prevKey + 1); // Also increment key to ensure a fresh form instance
            }
          }}
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-6 inline-flex items-center shadow-md hover:shadow-lg"
        >
          <FaPlusSquare className="mr-2" /> {editingCourse ? 'Cancel Edit / Create New' : 'Create New Course'}
        </button>

        <AdminCourseForm
          key={formKey} // Use key prop to force remount and reset when needed
          course={editingCourse}
          onCourseSaved={handleCourseSaved}
          onCourseDeleted={handleCourseDeleted}
        />
      </section>

      <section className="animate-fade-in-up animation-delay-200">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text mt-8 md:mt-12 mb-4 md:mb-6">Existing Courses</h3>
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
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Category</th> {/* New column */}
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Button Text</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Created At</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="text-secondary text-xs sm:text-sm font-light">
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-text">No courses found.</td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id} className="border-b border-secondary hover:bg-dark-background transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap">
                        <span className="font-medium text-light-text">{course.title}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <span className="bg-primary text-light-text py-1 px-2 rounded-full text-xs font-semibold">{course.level}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <span className="bg-secondary text-dark-background py-1 px-2 rounded-full text-xs font-semibold">{course.category || 'N/A'}</span>
                      </td> {/* Display category */}
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