import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white p-8 mt-12">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-4 text-primary">Mathematico</h3>
          <p className="text-gray-400 text-sm md:text-base">
            Empowering students to excel in mathematics through comprehensive coaching and innovative app-based learning.
          </p>
          <div className="flex justify-center sm:justify-start space-x-4 mt-4 text-sm md:text-base">
            {/* Social Media Icons */}
            <a href="https://www.facebook.com/share/15gcnh3AeR/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary whitespace-nowrap">Facebook Page</a>
            <a href="https://www.facebook.com/share/g/1F6pJ4QCqJ/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary whitespace-nowrap">Facebook Group</a>
            <a href="https://wa.link/80qjr2" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary whitespace-nowrap">WhatsApp</a>
            <a href="https://t.me/dipanjan9271" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary whitespace-nowrap">Telegram</a>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-4 text-primary">Quick Links</h3>
          <ul className="space-y-2 text-sm md:text-base">
            <li><Link to="/about" className="text-gray-400 hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/courses" className="text-gray-400 hover:text-primary transition-colors">Our Courses</Link></li>
            <li><Link to="/posts" className="text-gray-400 hover:text-primary transition-colors">Blog & Resources</Link></li>
            <li><Link to="/reviews" className="text-gray-400 hover:text-primary transition-colors">Student Reviews</Link></li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-4 text-primary">Contact Us</h3>
          <p className="text-gray-400 text-sm md:text-base">
            Flat no-A (Ground Floor), Sunity Apartment,<br/>
            Noapara Arabindapally, Vidyasagar Road,<br/>
            PO and PS-Barasat, District 24PGS(N), Kol-700124
          </p>
          <p className="text-gray-400 mt-2 text-sm md:text-base">Email: <a href="mailto:dipanjanchatterjee23@gmail.com" className="hover:text-primary transition-colors">dipanjanchatterjee23@gmail.com</a></p>
          <p className="text-gray-400 text-sm md:text-base">Phone: <a href="tel:+919051089673" className="hover:text-primary">+91 9051089673</a></p>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Mathematico. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;