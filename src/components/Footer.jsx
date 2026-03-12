import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white p-8 mt-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-primary">Mathematico</h3>
          <p className="text-gray-400">
            Empowering students to excel in mathematics through comprehensive coaching and innovative app-based learning.
          </p>
          <div className="flex space-x-4 mt-4">
            {/* Social Media Icons - Placeholder */}
            <a href="/" className="text-gray-400 hover:text-primary"><i className="fab fa-facebook-f"></i>FB</a>
            <a href="/" className="text-gray-400 hover:text-primary"><i className="fab fa-twitter"></i>TW</a>
            <a href="/" className="text-gray-400 hover:text-primary"><i className="fab fa-instagram"></i>IG</a>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-primary">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/courses" className="text-gray-400 hover:text-primary transition-colors">Our Courses</Link></li>
            <li><Link to="/posts" className="text-gray-400 hover:text-primary transition-colors">Blog & Resources</Link></li>
            <li><Link to="/reviews" className="text-gray-400 hover:text-primary transition-colors">Student Reviews</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-primary">Contact Us</h3>
          <p className="text-gray-400">123 Math Street, Apt 4B, Logic City, State 12345</p>
          <p className="text-gray-400 mt-2">Email: <a href="mailto:info@mathematico.com" className="hover:text-primary">info@mathematico.com</a></p>
          <p className="text-gray-400">Phone: <a href="tel:+1234567890" className="hover:text-primary">+1 (234) 567-890</a></p>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
        &copy; {new Date().getFullYear()} Mathematico. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;