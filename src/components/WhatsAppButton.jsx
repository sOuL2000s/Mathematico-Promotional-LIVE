import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa'; // Import WhatsApp and close icons
import LoadingSpinner from './LoadingSpinner'; // Assuming you have a LoadingSpinner component
import { useWhatsApp } from '../context/WhatsAppContext'; // Import useWhatsApp context

const WhatsAppButton = () => {
  const { isModalOpen, closeModal, initialFormData, openModal } = useWhatsApp(); // Use context for modal state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userSubject, setUserSubject] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const phoneNumber = '919748559613'; // Mathematico's WhatsApp number

  const [userContactNumber, setUserContactNumber] = useState('');
  const [userGrade, setUserGrade] = useState('');
  const [userBoard, setUserBoard] = useState('');
  const [userInterest, setUserInterest] = useState('');
  const [userPreference, setUserPreference] = useState(''); // e.g., Online, Offline, Hybrid

  // Effect to populate form fields if initialFormData is provided from context
  useEffect(() => {
    if (isModalOpen && initialFormData) {
      setUserName(initialFormData.userName || '');
      setUserEmail(initialFormData.userEmail || '');
      setUserContactNumber(initialFormData.userContactNumber || '');
      setUserGrade(initialFormData.userGrade || '');
      setUserBoard(initialFormData.userBoard || '');
      setUserInterest(initialFormData.userInterest || '');
      setUserPreference(initialFormData.userPreference || '');
      setUserSubject(initialFormData.subject || ''); // Pre-fill subject
      setUserMessage(initialFormData.message || '');
      setError(null);
    } else if (!isModalOpen) {
      // Reset form fields when modal closes or when it's just opening without initial data
      setUserName('');
      setUserEmail('');
      setUserContactNumber('');
      setUserGrade('');
      setUserBoard('');
      setUserInterest('');
      setUserPreference('');
      setUserSubject('');
      setUserMessage('');
      setError(null);
    }
  }, [isModalOpen, initialFormData]);

  const handleCloseModal = () => {
    closeModal(); // Use context's closeModal
    setError(null); // Clear errors
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation: Name, Email, Subject, Message, and Contact Number are required
    if (!userName.trim() || !userEmail.trim() || !userSubject.trim() || !userMessage.trim() || !userContactNumber.trim()) {
      setError("Please fill in all *required fields.");
      setLoading(false);
      return;
    }

    // Construct the WhatsApp message with all details
    const formattedMessage = `
🌟 *New Inquiry from Mathematico Website!* 🌟
---
*🧑‍🎓 Student Details:*
*Name:* ${userName.trim()}
*Email:* ${userEmail.trim()}
*Contact No.:* ${userContactNumber.trim()}
*Grade/Class:* ${userGrade.trim() || 'Not specified'}
*Academic Board:* ${userBoard.trim() || 'Not specified'}
*Area of Interest:* ${userInterest.trim() || 'Not specified'}
*Coaching Preference:* ${userPreference.trim() || 'Not specified'}

*📝 Message Details:*
*Subject:* ${userSubject.trim()}
*Message:*
${userMessage.trim()}
---
_Looking forward to assisting them!_
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
      {/* The floating button to open the WhatsApp modal */}
      {!isModalOpen && (
        <button
          onClick={() => {
            // Only open if the modal isn't already open
            if (!isModalOpen) openModal({
              subject: '',
              message: '',
              userName: '',
              userEmail: '',
              userContactNumber: '',
              userGrade: '',
              userBoard: '',
              userInterest: '',
              userPreference: ''
            });
          }} // Pass empty data to effectively open with blank form
          className="fixed bottom-6 right-6 bg-accent text-dark-background p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ease-in-out z-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark-background group"
          aria-label="Contact us via WhatsApp"
        >
          <FaWhatsapp className="w-8 h-8 group-hover:animate-pulse" />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999] animate-fade-in">
          {/* Modal content container with max-height and scrollability */}
          <div className="bg-medium-dark p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-secondary relative animate-fade-in-up max-h-[90vh] overflow-y-auto">
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
                <label htmlFor="whatsappContactNumber" className="block text-secondary text-sm font-semibold mb-1">
                  Your Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" // Use type="tel" for phone numbers
                  id="whatsappContactNumber"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="e.g., +919876543210"
                  value={userContactNumber}
                  onChange={(e) => setUserContactNumber(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappGrade" className="block text-secondary text-sm font-semibold mb-1">
                  Student's Grade/Class (Optional)
                </label>
                <input
                  type="text"
                  id="whatsappGrade"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="e.g., Class 10, JEE Aspirant"
                  value={userGrade}
                  onChange={(e) => setUserGrade(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappBoard" className="block text-secondary text-sm font-semibold mb-1">
                  Academic Board/Curriculum (Optional)
                </label>
                <input
                  type="text"
                  id="whatsappBoard"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="e.g., CBSE, ICSE, State Board"
                  value={userBoard}
                  onChange={(e) => setUserBoard(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappInterest" className="block text-secondary text-sm font-semibold mb-1">
                  Specific Course/Topic of Interest (Optional)
                </label>
                <input
                  type="text"
                  id="whatsappInterest"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="e.g., Calculus, Algebra, Competitive Math"
                  value={userInterest}
                  onChange={(e) => setUserInterest(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappPreference" className="block text-secondary text-sm font-semibold mb-1">
                  Preferred Coaching Mode (Optional)
                </label>
                <select
                  id="whatsappPreference"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  value={userPreference}
                  onChange={(e) => setUserPreference(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select a preference</option>
                  <option value="Online">Online Coaching</option>
                  <option value="Offline">Offline Coaching (Center Visit)</option>
                  <option value="Hybrid">Hybrid (Both Online & Offline)</option>
                </select>
              </div>
              <div>
                <label htmlFor="whatsappSubject" className="block text-secondary text-sm font-semibold mb-1">
                  Subject of Inquiry <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="whatsappSubject"
                  className="shadow-sm appearance-none border border-secondary rounded-lg w-full py-2 px-3 bg-dark-background text-light-text leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-sm"
                  placeholder="e.g., Inquiry about courses/app"
                  value={userSubject}
                  onChange={(e) => setUserSubject(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="whatsappMessage" className="block text-secondary text-sm font-semibold mb-1">
                  Your Detailed Message <span className="text-red-500">*</span>
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