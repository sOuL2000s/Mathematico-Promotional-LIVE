import React, { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa'; // Import WhatsApp and close icons
import LoadingSpinner from './LoadingSpinner'; // Assuming you have a LoadingSpinner component

const WhatsAppButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSubject, setUserSubject] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const phoneNumber = '919051089673'; // Replace with your actual WhatsApp number, including country code

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Reset form fields when opening the modal
    setUserName('');
    setUserEmail('');
    setUserSubject('');
    setUserMessage('');
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userName.trim() || !userEmail.trim() || !userSubject.trim() || !userMessage.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Construct the WhatsApp message with all details
    const formattedMessage = `
*Mathematico Inquiry*
---
*Name:* ${userName.trim()}
*Email:* ${userEmail.trim()}
*Subject:* ${userSubject.trim()}
*Message:* ${userMessage.trim()}
---
`;

    const encodedMessage = encodeURIComponent(formattedMessage);
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    try {
      window.open(whatsappLink, '_blank');
      handleCloseModal(); // Close modal after opening WhatsApp
    } catch (err) {
      console.error("Failed to open WhatsApp:", err);
      setError("Could not open WhatsApp. Please check your device settings or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-6 right-6 bg-accent text-dark-background p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ease-in-out z-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark-background group"
        aria-label="Contact us via WhatsApp"
      >
        <FaWhatsapp className="w-8 h-8 group-hover:animate-pulse" />
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-medium-dark p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-secondary relative animate-fade-in-up">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-secondary hover:text-light-text transition-colors duration-200"
              aria-label="Close WhatsApp chat form"
            >
              <FaTimes className="w-6 h-6" />
            </button>

            <h2 className="text-3xl font-bold text-primary mb-2 text-center">Mathematico</h2>
            <p className="text-light-text text-xl font-semibold mb-6 text-center">Send us a WhatsApp message</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="whatsappName" className="block text-secondary text-sm font-semibold mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="whatsappName"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Your Full Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappEmail" className="block text-secondary text-sm font-semibold mb-1">
                  Your Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="whatsappEmail"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="your.email@example.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappSubject" className="block text-secondary text-sm font-semibold mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="whatsappSubject"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="Inquiry about courses/app"
                  value={userSubject}
                  onChange={(e) => setUserSubject(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappMessage" className="block text-secondary text-sm font-semibold mb-1">
                  Your Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="whatsappMessage"
                  rows="4"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-y transition-all duration-200 text-sm"
                  placeholder="I'm interested in..."
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  required
                  disabled={loading}
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-primary text-light-text font-bold py-2.5 px-6 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md text-base w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : (
                  <>
                    <FaWhatsapp className="w-5 h-5" />
                    <span>Send on WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;