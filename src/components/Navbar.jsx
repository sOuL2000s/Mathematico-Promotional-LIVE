import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";
import logo from '../logo.svg'; // Import the SVG logo

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    <nav className="bg-dark-background p-4 shadow-xl sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-light-text text-2xl md:text-3xl 
                     font-bold tracking-wider hover:text-primary transition-colors duration-300" 
          onClick={closeMenu}
        >
          <img src={logo} alt="Mathematico Logo" className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16" />
          <span>Mathematico</span>
        </Link>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="text-light-text focus:outline-none p-2 rounded-md hover:bg-medium-dark transition-colors">
            {isOpen ? <AiOutlineClose className="w-7 h-7" /> : <GiHamburgerMenu className="w-7 h-7" />}
          </button>
        </div>
        <div className={`fixed inset-y-0 right-0 w-64 bg-dark-background transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out md:static md:flex md:w-auto md:bg-transparent md:transform-none md:transition-none z-40`}>
          <div className="flex justify-end p-4 md:hidden">
            <button onClick={closeMenu} className="text-light-text focus:outline-none p-2 rounded-md hover:bg-medium-dark transition-colors">
              <AiOutlineClose className="w-7 h-7" />
            </button>
          </div>
          <div className="flex flex-col p-4 md:p-0 md:flex-row md:space-x-6 text-xl md:space-y-0 space-y-4 md:text-lg">
            <NavLink to="/" onClick={closeMenu}>Home</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About Us</NavLink>            
            <NavLink to="/instructors" onClick={closeMenu}>Instructors</NavLink> {/* New NavLink */}
            <NavLink to="/courses" onClick={closeMenu}>Courses</NavLink>
            <NavLink to="/books" onClick={closeMenu}>Books</NavLink> {/* New NavLink */}
            <NavLink to="/videos" onClick={closeMenu}>Videos</NavLink> {/* New NavLink */}
            <NavLink to="/posts" onClick={closeMenu}>Posts</NavLink>
            <NavLink to="/reviews" onClick={closeMenu}>Reviews</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
            {currentUser ? (
              <>
                <NavLink to="/admin/dashboard" onClick={closeMenu}>Dashboard</NavLink>
                <button
                  onClick={() => { handleLogout(); closeMenu(); }}
                  className="bg-red-600 text-light-text px-5 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 w-full md:w-auto text-left md:text-center font-semibold mt-4 md:mt-0"
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
      {/* Overlay for mobile menu */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={closeMenu}></div>}
    </nav>
  );
};

const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    className="text-light-text hover:text-primary transition-colors duration-300 relative group py-2 block font-medium"
    onClick={onClick}
  >
    {children}
    <span className="absolute left-0 bottom-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
  </Link>
);

export default Navbar;