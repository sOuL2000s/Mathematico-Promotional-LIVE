import React from 'react';

const ContactPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-5xl font-bold text-dark mb-10 text-center">Contact Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <section className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-3xl font-semibold text-primary mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-dark mb-2">Our Address</h3>
              <p className="text-gray-700 text-lg">
                Mathematico Coaching Center<br />
                123 Math Street, Apt 4B<br />
                Logic City, State 12345<br />
                Country
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-dark mb-2">Phone</h3>
              <p className="text-gray-700 text-lg">
                <a href="tel:+1234567890" className="hover:text-primary transition-colors">+1 (234) 567-890</a>
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-dark mb-2">Email</h3>
              <p className="text-gray-700 text-lg">
                <a href="mailto:info@mathematico.com" className="hover:text-primary transition-colors">info@mathematico.com</a>
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium text-dark mb-2">Business Hours</h3>
              <p className="text-gray-700 text-lg">
                Monday - Friday: 9:00 AM - 6:00 PM<br />
                Saturday: 10:00 AM - 2:00 PM<br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form (Non-functional) */}
        <section className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-3xl font-semibold text-primary mb-6">Send Us a Message</h2>
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Inquiry about courses"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-gray-700 text-sm font-semibold mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                rows="6"
                className="shadow-sm appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                placeholder="Type your message here..."
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
              onClick={(e) => { e.preventDefault(); alert('Form submission is not functional in this demo.'); }}
            >
              Send Message
            </button>
          </form>
        </section>
      </div>

      {/* Map Embed (Placeholder) */}
      <section className="mt-12">
        <h2 className="text-3xl font-semibold text-dark mb-6 text-center">Find Us on the Map</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2014494921966!2d144.96277971531634!3d-37.81729397975199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642b58866164b%3A0x67392e272a27863!2sFederation%20Square!5e0!3m2!1sen!2sau!4v1678912345678!5m2!1sen!2sau"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Mathematico Location Map"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;