import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
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

  return (
    <nav className="bg-dark p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <Link to="/" className="text-white text-3xl font-bold tracking-wider hover:text-primary transition-colors duration-300">
          Mathematico
        </Link>
        <div className="md:hidden">
          {/* Mobile menu button (Hamburger icon) */}
          <button className="text-white focus:outline-none">
            {/* You might want to implement a real mobile menu toggle here */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-lg">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/posts">Posts</NavLink>
          <NavLink to="/reviews">Reviews</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          {currentUser ? (
            <>
              <NavLink to="/admin/dashboard">Dashboard</NavLink>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/admin/login">Admin Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-white hover:text-primary transition-colors duration-300 relative group"
  >
    {children}
    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
  </Link>
);

export default Navbar;