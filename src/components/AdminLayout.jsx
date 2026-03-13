import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { MdDashboard, MdPostAdd, MdRateReview, MdComment, MdOutlineLibraryBooks, MdLogout, MdClose } from 'react-icons/md';
import { GiHamburgerMenu } from "react-icons/gi";
import { FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

const AdminLayout = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  // sidebarOpen controls both mobile (open/closed) and desktop (expanded/collapsed) states
  // false means collapsed (icons only on desktop), or hidden (mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Failed to log out:", error.message);
      alert("Failed to log out.");
    }
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className="flex items-center space-x-3 p-3 rounded-lg text-light-text hover:bg-primary hover:text-light-text transition-colors duration-200"
      // Close sidebar on mobile navigation
      onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
    >
      <Icon className="w-6 h-6 flex-shrink-0 text-accent group-hover:text-light-text transition-colors" />
      <span className={`font-medium text-lg transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis
        ${sidebarOpen ? 'opacity-100 max-w-full flex-grow' : 'opacity-0 max-w-0 flex-shrink'}
      `}>
        {label}
      </span>
    </Link>
  );

  if (!currentUser) {
    // Optionally add a loading spinner or more user-friendly message
    return <p className="text-center text-light-text py-10">Redirecting to login...</p>;
  }

  // Define sidebar and main content widths based on sidebarOpen state
  // On mobile: w-0/-translate-x-full (closed) or w-64/translate-x-0 (open)
  // On desktop: w-20 (collapsed) or w-72 (expanded)
  const sidebarWidthClass = sidebarOpen ? 'w-64 md:w-72 translate-x-0' : 'w-0 -translate-x-full md:w-24 md:translate-x-0';
  const mainMarginClass = sidebarOpen ? 'ml-64 md:ml-72' : 'ml-0 md:ml-24';
 
  return (
    <div className="flex flex-grow bg-dark-background">
      {/* Mobile-only toggle button for when sidebar is closed */}
      {/* This button is fixed and appears over the main content when sidebar is closed on mobile */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-[72px] left-0 p-3 bg-primary text-light-text rounded-br-lg shadow-lg z-50 md:hidden transition-transform duration-300 ease-in-out"
          aria-label="Open admin sidebar"
        >
          <GiHamburgerMenu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-[72px] bottom-0 left-0 bg-medium-dark p-6 shadow-xl border-r border-secondary transition-all duration-300 ease-in-out z-40 flex flex-col overflow-y-auto
          ${sidebarWidthClass}
        `}
      >
        {/* Sidebar Header (Admin title and toggle buttons) */}
        {/* This container ensures the title and toggles flow correctly within the sidebar */}
        <div className="flex items-center justify-between mb-8">
          {/* Admin Title - visibility tied to sidebarOpen state */}
          <h2 className={`
            text-3xl font-bold text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out flex-grow
            ${sidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'}
          `}>Admin</h2>

          {/* Mobile Close Button (visible only on mobile when sidebar is open) */}
          <div className="md:hidden">
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-light-text hover:bg-primary transition-colors"
                aria-label="Close sidebar"
              >
                <MdClose className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Desktop Toggle Button (visible only on desktop) */}
          <div className="hidden md:block ml-auto">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-light-text bg-primary hover:bg-blue-600 transition-colors"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <FaAngleDoubleLeft className="w-5 h-5" /> : <FaAngleDoubleRight className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          <NavItem to="/admin/dashboard" icon={MdDashboard} label="Dashboard" />
          <NavItem to="/admin/posts" icon={MdPostAdd} label="Manage Posts" />
          <NavItem to="/admin/courses" icon={MdOutlineLibraryBooks} label="Manage Courses" />
          <NavItem to="/admin/reviews" icon={MdRateReview} label="Moderate Reviews" />
          <NavItem to="/admin/comments" icon={MdComment} label="Moderate Comments" />
        </nav>

        <div className="mt-8 pt-4 border-t border-secondary">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg text-light-text bg-red-600 hover:bg-red-700 transition-colors duration-200 w-full"
          >
            <MdLogout className="w-6 h-6 flex-shrink-0" />
            <span className={`
              font-medium text-lg transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis
              ${sidebarOpen ? 'opacity-100 max-w-full flex-grow' : 'opacity-0 max-w-0 flex-shrink'}
            `}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow p-6 md:p-10 transition-all duration-300 ease-in-out z-10 pt-[72px] ${mainMarginClass}`}>
        <div>
          <Outlet /> {/* Renders the specific admin page component */}
        </div>
      </main>

      {/* Overlay for sidebar (visible on mobile only when open) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;