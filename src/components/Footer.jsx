import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaWhatsapp, FaTelegramPlane } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

const Footer = () => {
  return (
    <footer className="bg-dark-background text-secondary p-6 md:p-10 lg:p-12 mt-12 shadow-inner">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-bold mb-4 text-primary">Mathematico</h3>
          <p className="text-secondary text-sm leading-relaxed mb-4">
            Empowering students to excel in mathematics through comprehensive coaching and innovative app-based learning.
          </p>
          <div className="flex justify-center sm:justify-start space-x-5 text-gray-text">
            <a href="https://www.facebook.com/share/15gcnh3AeR/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Page" className="hover:text-accent transition-colors text-2xl">
              <FaFacebookF />
            </a>
            <a href="https://wa.link/80qjr2" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="hover:text-accent transition-colors text-2xl">
              <FaWhatsapp />
            </a>
            <a href="https://t.me/dipanjan9271" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="hover:text-accent transition-colors text-2xl">
              <FaTelegramPlane />
            </a>
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-4 text-primary">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/about" className="text-secondary hover:text-accent transition-colors block">About Us</Link></li>
            <li><Link to="/courses" className="text-secondary hover:text-accent transition-colors block">Our Courses</Link></li>
            <li><Link to="/posts" className="text-secondary hover:text-accent transition-colors block">Blog & Resources</Link></li>
            <li><Link to="/reviews" className="text-secondary hover:text-accent transition-colors block">Student Reviews</Link></li>
            <li><Link to="/admin/login" className="text-secondary hover:text-accent transition-colors block">Admin Login</Link></li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-4 text-primary">Contact Info</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start justify-center sm:justify-start">
              <MdLocationOn className="text-accent text-xl mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-secondary text-left">
                Flat no-A (Ground Floor), Sunity Apartment,<br/>
                Noapara Arabindapally, Vidyasagar Road,<br/>
                PO and PS-Barasat, District 24PGS(N), Kol-700124
              </p>
            </li>
            <li className="flex items-center justify-center sm:justify-start">
              <MdEmail className="text-accent text-xl mr-2 flex-shrink-0" />
              <a href="mailto:dipanjanchatterjee23@gmail.com" className="text-secondary hover:text-accent transition-colors">dipanjanchatterjee23@gmail.com</a>
            </li>
            <li className="flex items-center justify-center sm:justify-start">
              <MdPhone className="text-accent text-xl mr-2 flex-shrink-0" />
              <a href="tel:+919051089673" className="text-secondary hover:text-accent transition-colors">+91 9051089673</a>
            </li>
          </ul>
        </div>

        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold mb-4 text-primary">Connect with us!</h3>
          <p className="text-secondary text-sm leading-relaxed mb-4">
            Join our vibrant community on social media for updates, tips, and more!
          </p>
          {/* Re-iterate or suggest other social groups if necessary, or move FB group to main social icons */}
          <a href="https://www.facebook.com/share/g/1F6pJ4QCqJ/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center bg-primary text-light-text font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300 text-sm">
            <FaFacebookF className="mr-2" /> Join FB Group
          </a>
        </div>
      </div>
      <div className="border-t border-secondary mt-10 pt-6 text-center text-gray-text text-sm">
        &copy; {new Date().getFullYear()} Mathematico. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;