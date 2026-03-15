import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs, doc, deleteDoc } from 'firebase/firestore';
import AdminBookForm from '../components/AdminBookForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorDisplay from '../components/ErrorDisplay';
import { FaEdit, FaTrash, FaPlusSquare, FaSortAlphaDown, FaSortAlphaUp } from 'react-icons/fa'; // Added sort icons
import { MdInsertDriveFile } from 'react-icons/md';

const AdminBooksPage = () => {
  const [allBooks, setAllBooks] = useState([]); // Store all fetched books
  const [displayedBooks, setDisplayedBooks] = useState([]); // Books after search/filter/sort
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('createdAt'); // Default sort key
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchAllBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'books'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedBooks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllBooks(fetchedBooks);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBooks();
  }, [fetchAllBooks]);

  // Effect to filter and sort books based on user input
  useEffect(() => {
    let tempBooks = [...allBooks];

    // 1. Search Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      tempBooks = tempBooks.filter(book => {
        const titleMatch = (book.title || '').toLowerCase().includes(lowerCaseSearchTerm);
        const descriptionMatch = (book.description || '').toLowerCase().includes(lowerCaseSearchTerm);
        return titleMatch || descriptionMatch;
      });
    }

    // 2. Sort
    tempBooks.sort((a, b) => {
      let valA, valB;

      if (sortKey === 'createdAt') {
        valA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        valB = b.createdAt ? b.createdAt.toDate() : new Date(0);
      } else { // 'title'
        valA = (a[sortKey] || '').toLowerCase();
        valB = (b[sortKey] || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayedBooks(tempBooks);
  }, [allBooks, searchTerm, sortKey, sortOrder]);


  const handleBookSaved = () => {
    setEditingBook(null);
    fetchAllBooks();
  };

  const handleBookDeleted = async (deletedBookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'books', deletedBookId));
      setAllBooks(prevBooks => prevBooks.filter(b => b.id !== deletedBookId));
      setEditingBook(null);
      alert('Book deleted successfully!');
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Failed to delete book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 md:py-12 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-light-text mb-8 md:mb-10 animate-fade-in-up">Manage Books</h1>

      <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary mb-8 md:mb-12 animate-fade-in-up animation-delay-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 md:mb-8">{editingBook ? 'Edit Book' : 'Create New Book'}</h2>
        <button
          onClick={() => {
            if (editingBook === null) {
              setFormKey(prevKey => prevKey + 1);
            } else {
              setEditingBook(null);
              setFormKey(prevKey => prevKey + 1);
            }
          }}
          className="bg-primary text-light-text font-bold py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 mb-6 inline-flex items-center shadow-md hover:shadow-lg"
        >
          <FaPlusSquare className="mr-2" /> {editingBook ? 'Cancel Edit / Create New' : 'Create New Book'}
        </button>

        <AdminBookForm
          key={formKey}
          book={editingBook}
          onBookSaved={handleBookSaved}
          onBookDeleted={handleBookDeleted}
        />
      </section>

      <section className="animate-fade-in-up animation-delay-200">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-light-text mt-8 md:mt-12 mb-4 md:mb-6">Existing Books</h3>

        {/* Controls: Search, Sort */}
        <div className="flex flex-col md:flex-row items-center justify-start gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-auto flex-grow p-2.5 rounded-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-text"
          />

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
                  <th className="py-3 px-4 sm:px-6 text-left border-b border-secondary">Link</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Created At</th>
                  <th className="py-3 px-4 sm:px-6 text-center border-b border-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="text-secondary text-xs sm:text-sm font-light">
                {displayedBooks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-text">No books found matching your criteria.</td>
                  </tr>
                ) : (
                  displayedBooks.map((book) => (
                    <tr key={book.id} className="border-b border-secondary hover:bg-dark-background transition-colors duration-150">
                      <td className="py-3 px-4 sm:px-6 text-left whitespace-nowrap">
                        <span className="font-medium text-light-text">{book.title}</span>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-left">
                        <a href={book.googleDriveLink} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center text-xs sm:text-sm">
                          <MdInsertDriveFile className="mr-1" /> View PDF
                        </a>
                      </td>
                      <td className="py-3 px-4 sm:px-6 text-center whitespace-nowrap text-gray-text">{formatDate(book.createdAt)}</td>
                      <td className="py-3 px-4 sm:px-6 text-center">
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <button
                            onClick={() => setEditingBook(book)}
                            className="bg-primary text-light-text px-3 py-1.5 rounded-md hover:bg-blue-600 transition-colors text-xs inline-flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleBookDeleted(book.id)}
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

export default AdminBooksPage;