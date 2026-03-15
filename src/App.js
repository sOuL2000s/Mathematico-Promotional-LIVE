import React, { lazy, Suspense } from 'react'; // Import lazy and Suspense
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { WhatsAppProvider } from './context/WhatsAppContext';
import WhatsAppButton from './components/WhatsAppButton';
import LoadingSpinner from './components/LoadingSpinner';
import ScrollToTop from './components/ScrollToTop'; // Import the new ScrollToTop component

// Lazy load all pages except HomePage for faster initial load
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PostsPage = lazy(() => import('./pages/PostsPage'));
const SinglePostPage = lazy(() => import('./pages/SinglePostPage'));
const ReviewsPage = lazy(() => import('./pages/ReviewsPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminPostsPage = lazy(() => import('./pages/AdminPostsPage'));
const AdminReviewsPage = lazy(() => import('./pages/AdminReviewsPage'));
const AdminCommentsPage = lazy(() => import('./pages/AdminCommentsPage'));
const AdminCoursesPage = lazy(() => import('./pages/AdminCoursesPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminBooksPage = lazy(() => import('./pages/AdminBooksPage'));
const AdminVideosPage = lazy(() => import('./pages/AdminVideosPage'));
const InstructorsPage = lazy(() => import('./pages/InstructorsPage'));
const BooksPage = lazy(() => import('./pages/BooksPage'));
const VideosPage = lazy(() => import('./pages/VideosPage'));

function App() {
  return (
    <Router>
      <ScrollToTop /> {/* Place ScrollToTop directly inside Router */}
      <AuthProvider>
        <WhatsAppProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Suspense fallback={<LoadingSpinner size="large" className="min-h-screen-main" />}> {/* Add Suspense for lazy loading */}
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/instructors" element={<InstructorsPage />} />
                  <Route path="/courses" element={<CoursesPage />} />
                  <Route path="/books" element={<BooksPage />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/posts" element={<PostsPage />} />
                  <Route path="/posts/:id" element={<SinglePostPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />

                  {/* Protected Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute />}>
                    <Route element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="posts" element={<AdminPostsPage />} />
                      <Route path="reviews" element={<AdminReviewsPage />} />
                      <Route path="comments" element={<AdminCommentsPage />} />
                      <Route path="courses" element={<AdminCoursesPage />} />
                      <Route path="books" element={<AdminBooksPage />} />
                      <Route path="videos" element={<AdminVideosPage />} />
                      <Route path="settings" element={<AdminSettingsPage />} />
                    </Route>
                  </Route>

                  {/* 404 Not Found Page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense> {/* Close Suspense */}
            </main>
            <Footer />
            <WhatsAppButton />
          </div>
        </WhatsAppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;