import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CoursesPage from './pages/CoursesPage';
import ContactPage from './pages/ContactPage';
import PostsPage from './pages/PostsPage';
import SinglePostPage from './pages/SinglePostPage';
import ReviewsPage from './pages/ReviewsPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';
import AdminLayout from './components/AdminLayout'; // Import AdminLayout
import AdminPostsPage from './pages/AdminPostsPage'; // Import AdminPostsPage
import AdminReviewsPage from './pages/AdminReviewsPage'; // Import AdminReviewsPage
import AdminCommentsPage from './pages/AdminCommentsPage'; // Import AdminCommentsPage
import AdminCoursesPage from './pages/AdminCoursesPage'; // Import AdminCoursesPage
import AdminSettingsPage from './pages/AdminSettingsPage'; // Import AdminSettingsPage for global app settings
import InstructorsPage from './pages/InstructorsPage'; // Import the new InstructorsPage
import WhatsAppButton from './components/WhatsAppButton'; // Import the new WhatsAppButton

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/instructors" element={<InstructorsPage />} /> {/* New route for instructors page */}
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/posts" element={<PostsPage />} />
              <Route path="/posts/:id" element={<SinglePostPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}> {/* Use AdminLayout for nested admin routes */}
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="posts" element={<AdminPostsPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="comments" element={<AdminCommentsPage />} />
                  <Route path="courses" element={<AdminCoursesPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} /> {/* New route for app settings */}
                </Route>
              </Route>

              {/* 404 Not Found Page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <WhatsAppButton /> {/* Add the floating WhatsApp button */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;