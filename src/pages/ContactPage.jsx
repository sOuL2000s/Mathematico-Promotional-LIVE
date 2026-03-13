import React from 'react';
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from 'react-icons/md'; // Importing icons
import { FaWhatsapp } from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-8 md:mb-10 text-center animate-fade-in-up">Contact Us</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        We're here to help! Reach out to us through any of the channels below or fill out the inquiry form.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Contact Information */}
        <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary animate-fade-in-up animation-delay-200">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-4 md:mb-6">Get in Touch</h2>
          <div className="space-y-5 text-sm sm:text-base">
            <div className="flex items-start">
              <MdLocationOn className="text-accent text-2xl mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-light-text mb-1">Our Address</h3>
                <p className="text-secondary leading-relaxed">
                  Mathematico Coaching Center<br />
                  Flat no-A (Ground Floor), Sunity Apartment,<br />
                  Noapara Arabindapally, Vidyasagar Road,<br />
                  PO and PS-Barasat, District 24PGS(N), Kol-700124
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <MdPhone className="text-accent text-2xl mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-light-text mb-1">Phone</h3>
                <p className="text-secondary">
                  <a href="tel:+919051089673" className="hover:text-primary transition-colors">+91 9051089673</a>
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <FaWhatsapp className="text-accent text-2xl mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-light-text mb-1">WhatsApp</h3>
                <p className="text-secondary">
                  <a href="https://wa.me/919748559613" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">+91 9748559613</a>
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <MdEmail className="text-accent text-2xl mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-light-text mb-1">Email</h3>
                <p className="text-secondary break-all">
                  <a href="mailto:dipanjanchatterjee23@gmail.com" className="hover:text-primary transition-colors">dipanjanchatterjee23@gmail.com</a>
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <MdAccessTime className="text-accent text-2xl mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-medium text-light-text mb-1">Business Hours</h3>
                <p className="text-secondary">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 2:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form (Non-functional) */}
        <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg border border-secondary animate-fade-in-up animation-delay-300">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-4 md:mb-6">Send Us a Message</h2>
          <form className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-secondary text-sm font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all duration-200"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-secondary text-sm font-semibold mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all duration-200"
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-secondary text-sm font-semibold mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all duration-200"
                placeholder="Inquiry about courses"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-secondary text-sm font-semibold mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                rows="5"
                className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y text-sm transition-all duration-200"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-primary text-light-text font-bold py-2.5 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 transform hover:scale-105 shadow-md text-base w-full md:w-auto"
              onClick={(e) => { e.preventDefault(); alert('Form submission is not functional in this demo.'); }}
            >
              Send Message
            </button>
          </form>
        </section>
      </div>

      {/* Map Embed */}
      <section className="mt-8 md:mt-12 animate-fade-in-up animation-delay-400">
        <h2 className="text-2xl sm:text-3xl font-bold text-light-text mb-4 md:mb-6 text-center">Find Us on the Map</h2>
        <div className="bg-medium-dark rounded-xl shadow-lg overflow-hidden border border-secondary">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.0911289875216!2d88.4819565!3d22.724854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f8a30058617907%3A0x6fb9d10ae1c6b946!2sMATHEMATICO(Maths%20Coaching)%20By%20DipanjanSir!5e0!3m2!1sen!2sin!4v1773344530612!5m2!1sen!2sin"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mathematico Location Map"
            className="w-full h-64 sm:h-80 md:h-96"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;