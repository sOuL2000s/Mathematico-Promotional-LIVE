import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { MdDashboard, MdPostAdd, MdRateReview, MdComment, MdOutlineLibraryBooks, MdLogout, MdClose, MdSettings } from 'react-icons/md'; // Added MdSettings
import { GiHamburgerMenu } from "react-icons/gi";
// Removed unused icons: FaAngleDoubleLeft, FaAngleDoubleRight

const AdminLayout = () => {
  // `isMobileSidebarOpen` state now specifically controls mobile sidebar visibility
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error("Failed to log out:", error.message);
      alert("Failed to log out.");
    }
  };

  // NavItem component now takes closeSidebar function for mobile
  const NavItem = ({ to, icon: Icon, label, closeSidebar }) => (
    <Link
      to={to}
      className="flex items-center space-x-3 p-3 rounded-lg text-light-text hover:bg-primary hover:text-light-text transition-colors duration-200"
      onClick={closeSidebar} // Call closeSidebar on navigation click
    >
      <Icon className="w-6 h-6 flex-shrink-0 text-accent group-hover:text-light-text transition-colors" />
      <span className="font-medium text-lg transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis
        group-hover:opacity-100 group-hover:max-w-full group-hover:flex-grow
        md:opacity-0 md:max-w-0 md:flex-shrink
        lg:group-hover:opacity-100 lg:group-hover:max-w-full lg:group-hover:flex-grow
        md:group-hover:translate-x-0
        "
        // Conditional styling for desktop hover effect
        // On mobile, the label is controlled by isMobileSidebarOpen (via `aside` width)
        // On desktop, labels appear on hover only
      >
        {label}
      </span>
    </Link>
  );

  if (!currentUser) {
    return <p className="text-center text-light-text py-10">Redirecting to login...</p>;
  }
 
  return (
    <div className="flex flex-grow bg-dark-background">
      {/* Mobile-only toggle button for when sidebar is closed */}
      {!isMobileSidebarOpen && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="fixed top-[72px] left-0 p-3 bg-primary text-light-text rounded-br-lg shadow-lg z-50 md:hidden transition-transform duration-300 ease-in-out"
          aria-label="Open admin sidebar"
        >
          <GiHamburgerMenu className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar - becomes a Tailwind group for desktop hover effects */}
      <aside
        className={`group fixed top-[72px] bottom-0 left-0 bg-medium-dark p-6 shadow-xl border-r border-secondary transition-all duration-300 ease-in-out z-40 flex flex-col overflow-y-auto
          ${isMobileSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'} /* Mobile explicit control */
          md:w-24 md:hover:w-80 md:translate-x-0 /* Desktop hover control */
        `}
      >
        {/* Sidebar Header (Admin title and mobile close button) */}
        <div className="flex items-center justify-between mb-8">
          {/* Admin Title - visibility for mobile and desktop hover */}
          <h2 className={`
            text-3xl font-bold text-primary whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out flex-grow
            ${isMobileSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0'} /* Mobile explicit control */
            md:opacity-0 md:max-w-0 /* Hidden by default on desktop, appears on hover */
            md:group-hover:opacity-100 md:group-hover:max-w-full
          `}>Admin</h2>

          {/* Mobile Close Button (visible only on mobile when sidebar is open) */}
          <div className="md:hidden">
            {isMobileSidebarOpen && (
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-md text-light-text hover:bg-primary transition-colors"
                aria-label="Close sidebar"
              >
                <MdClose className="w-7 h-7" />
              </button>
            )}
          </div>
          {/* Removed desktop toggle button as per request */}
        </div>

        <nav className="flex-grow space-y-2">
          <NavItem to="/admin/dashboard" icon={MdDashboard} label="Dashboard" closeSidebar={() => setIsMobileSidebarOpen(false)} />
          <NavItem to="/admin/posts" icon={MdPostAdd} label="Manage Posts" closeSidebar={() => setIsMobileSidebarOpen(false)} />
          <NavItem to="/admin/courses" icon={MdOutlineLibraryBooks} label="Manage Courses" closeSidebar={() => setIsMobileSidebarOpen(false)} />
          <NavItem to="/admin/reviews" icon={MdRateReview} label="Moderate Reviews" closeSidebar={() => setIsMobileSidebarOpen(false)} />
          <NavItem to="/admin/comments" icon={MdComment} label="Moderate Comments" closeSidebar={() => setIsMobileSidebarOpen(false)} />
          <NavItem to="/admin/settings" icon={MdSettings} label="App Settings" closeSidebar={() => setIsMobileSidebarOpen(false)} /> {/* New Nav Item */}
        </nav>

        <div className="mt-8 pt-4 border-t border-secondary">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 rounded-lg text-light-text bg-red-600 hover:bg-red-700 transition-colors duration-200 w-full"
          >
            <MdLogout className="w-6 h-6 flex-shrink-0" />
            <span className={`
              font-medium text-lg transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden text-ellipsis
              ${isMobileSidebarOpen ? 'opacity-100 max-w-full flex-grow' : 'opacity-0 max-w-0 flex-shrink'} /* Mobile explicit control */
              md:opacity-0 md:max-w-0 /* Hidden by default on desktop, appears on hover */
              md:group-hover:opacity-100 md:group-hover:max-w-full
            `}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
          <main className={`flex-grow p-6 md:p-10 transition-all duration-300 ease-in-out z-10 pt-[72px]
        ${isMobileSidebarOpen ? 'ml-64' : 'ml-0'} /* Mobile margin explicit control */
        md:ml-24 md:group-hover:ml-80 /* Desktop margin responsive to sidebar hover */
        overflow-x-hidden /* Ensures content within main doesn't create horizontal scroll outside its bounds */
      `}>
            <div className="w-full max-w-full"> {/* Ensures the content rendered by Outlet respects the parent's width */}
              <Outlet /> {/* Renders the specific admin page component */}
            </div>
          </main>

      {/* Overlay for sidebar (visible on mobile only when open) */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;