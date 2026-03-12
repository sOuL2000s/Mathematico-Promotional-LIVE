import React from 'react';

const ContactPage = () => {
  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-8 md:mb-10 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Contact Information */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-4 md:mb-6">Get in Touch</h2>
          <div className="space-y-4 md:space-y-6 text-sm sm:text-base">
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-dark mb-1 md:mb-2">Our Address</h3>
              <p className="text-gray-700 leading-relaxed">
                Mathematico Coaching Center<br />
                Flat no-A (Ground Floor), Sunity Apartment,<br />
                Noapara Arabindapally, Vidyasagar Road,<br />
                PO and PS-Barasat, District 24PGS(N), Kol-700124
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-dark mb-1 md:mb-2">Phone</h3>
              <p className="text-gray-700">
                <a href="tel:+919051089673" className="hover:text-primary transition-colors">+91 9051089673</a>
              </p>
              <p className="text-gray-700 mt-1">
                <a href="https://wa.me/919748559613" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp: +91 9748559613</a>
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-dark mb-1 md:mb-2">Email</h3>
              <p className="text-gray-700">
                <a href="mailto:dipanjanchatterjee23@gmail.com" className="hover:text-primary transition-colors">dipanjanchatterjee23@gmail.com</a>
              </p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-medium text-dark mb-1 md:mb-2">Business Hours</h3>
              <p className="text-gray-700">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 2:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form (Non-functional) */}
        <section className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary mb-4 md:mb-6">Send Us a Message</h2>
          <form className="space-y-4 md:space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="john.doe@example.com"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-gray-700 text-sm font-semibold mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                placeholder="Inquiry about courses"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700 text-sm font-semibold mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                rows="5"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y text-sm"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-300 transform hover:scale-105 shadow-md text-base"
              onClick={(e) => { e.preventDefault(); alert('Form submission is not functional in this demo.'); }}
            >
              Send Message
            </button>
          </form>
        </section>
      </div>

      {/* Map Embed (Placeholder) */}
      <section className="mt-8 md:mt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold text-dark mb-4 md:mb-6 text-center">Find Us on the Map</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
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