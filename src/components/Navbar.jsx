import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to manage mobile menu visibility
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-dark p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <Link to="/" className="text-white text-2xl md:text-3xl font-bold tracking-wider hover:text-primary transition-colors duration-300" onClick={closeMenu}>
          Mathematico
        </Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none focus:ring-2 focus:ring-primary rounded p-1">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
            </svg>
          </button>
        </div>
        <div className={`w-full md:flex md:items-center md:w-auto ${isOpen ? 'flex flex-col h-auto overflow-visible' : 'hidden'} mt-4 md:mt-0`}>
          <div className="flex flex-col md:flex-row md:space-x-6 text-lg md:space-y-0 space-y-2">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About Us</NavLink>
            <NavLink to="/courses" onClick={closeMenu}>Courses</NavLink>
            <NavLink to="/posts" onClick={closeMenu}>Posts</NavLink>
            <NavLink to="/reviews" onClick={closeMenu}>Reviews</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
            {currentUser ? (
              <>
                <NavLink to="/admin/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                <button
                  onClick={() => { handleLogout(); closeMenu(); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 w-full md:w-auto text-left md:text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink to="/admin/login" onClick={closeMenu}>Admin Login</NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="text-white hover:text-primary transition-colors duration-300 relative group py-2 md:py-0 block"
    onClick={onClick}
  >
    {children}
    <span className="absolute left-0 bottom-0 md:bottom-[-4px] w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
  </Link>
);

export default Navbar;