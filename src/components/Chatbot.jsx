import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa'; // Import icons
import LoadingSpinner from './LoadingSpinner'; // Assuming you have a LoadingSpinner component
import { db } from '../firebase'; // Import Firestore db
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingChatbot, setLoadingChatbot] = useState(false); // General loading state for chatbot operations (API key fetch, chat init, message send)
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]); // Stores messages as { role: 'user' | 'model', text: string }
  const [userMessage, setUserMessage] = useState('');
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const [geminiApiKey, setGeminiApiKey] = useState(null); // State to store fetched API key

  // Initialize Gemini API only once
  const genAI = useRef(null);
  const chat = useRef(null);

  // Founder's WhatsApp number for error reporting (REPLACE WITH ACTUAL FOUNDER'S WHATSAPP NUMBER)
  const founderWhatsappNumber = "+919876543210";

  const websiteInfo = `
You are Mathematico AI, a highly intelligent, empathetic, and resourceful chatbot assistant. Your primary goal is to fully understand user inquiries related to the Mathematico website and our services, then provide precise, relatable, and actionable guidance.

Mathematico is a special coaching center focused on mastering mathematics, also offering an Android app.

Here are the available pages on the Mathematico website:
- **Home Page**: (/) - Overview of Mathematico, our mission, and key offerings.
- **About Us Page**: (/about) - Learn about Mathematico's philosophy, mission, vision, values, and story, including information about our founder, Dipanjan Chatterjee.
- **Instructors Page**: (/instructors) - Detailed profile of our lead instructor, Dipanjan Chatterjee, his qualifications, experience, and achievements.
- **Courses Page**: (/courses) - Explore our comprehensive range of mathematics courses for all levels (Beginner, Intermediate, Advanced, Competitive) and categories (Algebra, Geometry, Calculus, etc.). Users can inquire about specific courses here.
- **Books Page**: (/books) - Access a curated collection of mathematical books and PDF resources for learning.
- **Videos Page**: (/videos) - Watch insightful video tutorials, problem-solving demonstrations, and engaging lectures.
- **Posts Page**: (/posts) - Discover our blog with articles, challenging problems, intriguing puzzles, riddles, and quizzes.
- **Reviews Page**: (/reviews) - Read testimonials from our students and parents, and submit your own feedback.
- **Contact Us Page**: (/contact) - Find our contact information (address, phone, email, WhatsApp, business hours) and a form to send us a message. It also includes a map to our physical location.
- **Admin Login**: (/admin/login) - This page is strictly for internal administrative use and is not accessible to general users.

When responding:
- **Be highly empathetic, encouraging, and genuinely helpful.** Strive for a conversational and relatable tone.
- **Focus strictly on guiding the user within the context of the Mathematico website and its offerings.**
- **Actively listen and infer user intent.** If a query is vague, or if you anticipate further needs, proactively ask clarifying or specific follow-up questions. For example: "To help me guide you better, could you tell me what specific math topic or course level you're interested in?", or "Is there anything else I can assist you with regarding [topic we just discussed]?"
- **If the user asks for information available on a specific page, always tell them which page to visit AND provide the direct link.** For example: "You can find detailed information about our founder, Dipanjan Chatterjee, on the Instructors Page: [Meet Our Instructor](/instructors)."
- Encourage users to explore relevant pages and suggest practical next steps (e.g., "After exploring our courses, you might want to visit the Contact Us page for enrollment details.").
- Keep responses clear, concise, and highly informative, prioritizing the most relevant information first.
- If a user expresses interest in enrolling or needs detailed course information, direct them to the Courses page for program details and to the Contact page or our WhatsApp for direct inquiry.
- **Never make up information.** If you don't have enough details, politely state that you can only assist with topics related to Mathematico, and direct the user to the most relevant page or to contact us directly.
- **Conclude interactions by offering further assistance.**
`;

  // Function to report API key errors via WhatsApp
  const handleReportIssue = () => {
    if (error) {
      const message = encodeURIComponent(`Mathematico AI Chatbot Error: ${error}\nPlease investigate.`);
      const whatsappUrl = `https://wa.me/${founderWhatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("No active error to report. If you're experiencing an issue, please describe it and contact support directly.");
    }
  };

  const fetchGeminiApiKey = useCallback(async () => {
    setLoadingChatbot(true); // Start loading for API key fetch
    try {
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists() && settingsSnap.data().geminiApiKey) {
        const key = settingsSnap.data().geminiApiKey;
        setGeminiApiKey(key);
        setError(null);
        return key; // Return key for immediate use
      } else {
        setError("Gemini API key is not configured. Please contact the administrator.");
      }
    } catch (err) {
      console.error("Error fetching Gemini API key:", err);
      setError("Failed to load Gemini API key. Chatbot may not function.");
    } finally {
      setLoadingChatbot(false); // End loading for API key fetch
    }
    return null;
  }, []);

  const initializeChat = useCallback((apiKey) => {
    if (!apiKey) {
      setError("Gemini API key is missing. Chatbot cannot be initialized.");
      return;
    }

    try {
      genAI.current = new GoogleGenerativeAI(apiKey);
      const model = genAI.current.getGenerativeModel({
        model: "gemini-2.5-flash", // Using the flash model as requested
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      });

      const modelGreeting = "Hello! I'm Mathematico AI, your virtual assistant. How can I help you navigate our website or answer your questions about Mathematico today?";

      // Load history from local storage
      const storedHistoryJSON = localStorage.getItem('mathematico_ai_chat_history');
      let loadedChatHistoryForUI = []; // History for the UI state
      let loadedChatHistoryForGemini = []; // History for Gemini's startChat method

      if (storedHistoryJSON) {
        try {
          const parsedHistory = JSON.parse(storedHistoryJSON);
          if (Array.isArray(parsedHistory) && parsedHistory.length > 0) {
            // Filter out any potential non-string 'text' parts from history
            const validParsedHistory = parsedHistory.filter(msg => typeof msg.text === 'string');
            loadedChatHistoryForUI = validParsedHistory;
            // Convert to Gemini format
            loadedChatHistoryForGemini = validParsedHistory.map(msg => ({
              role: msg.role,
              parts: [{ text: msg.text }]
            }));
          }
        } catch (parseError) {
          console.error("Error parsing chat history from local storage:", parseError);
          // Fallback to empty history if parsing fails
        }
      }

      // Gemini's internal history starts with the system instruction and an initial model response
      // followed by any loaded conversation history.
      const geminiInitialHistory = [
        {
          role: "user", // Acting as a user providing system instructions
          parts: [{ text: websiteInfo }]
        },
        {
          role: "model",
          parts: [{ text: modelGreeting }]
        },
        ...loadedChatHistoryForGemini // Append loaded history
      ];

      // Start a new chat session
      chat.current = model.startChat({
        history: geminiInitialHistory,
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      // Set the UI chat history. If there's loaded history, use it. Otherwise, start with the greeting.
      if (loadedChatHistoryForUI.length > 0) {
        setChatHistory(loadedChatHistoryForUI);
      } else {
        setChatHistory([{ role: 'model', text: modelGreeting }]);
      }
      setError(null); // Clear any previous API key errors now that chat is initialized
    } catch (err) {
      console.error("Failed to initialize Gemini AI:", err);
      setError("Failed to initialize the chatbot. Please try again later.");
    } finally {
      setLoadingChatbot(false);
    }
  }, [websiteInfo]); // websiteInfo is a dependency

  // Effect to save chat history to local storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      // Filter out the initial AI greeting if it's the only message and there's no user input yet,
      // or if it's identical to the websiteInfo system prompt to avoid saving redundant info.
      // We only save actual conversation turns.
      const conversationToSave = chatHistory.filter(msg => 
        !(msg.role === 'model' && msg.text.startsWith("Hello! I'm Mathematico AI") && chatHistory.length === 1)
      );

      if (conversationToSave.length > 0) {
          localStorage.setItem('mathematico_ai_chat_history', JSON.stringify(conversationToSave));
      } else {
          localStorage.removeItem('mathematico_ai_chat_history'); // Clear if history becomes empty or only initial greeting
      }
    } else {
      localStorage.removeItem('mathematico_ai_chat_history');
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isOpen && !geminiApiKey && !chat.current) {
      // Only attempt to fetch key if chatbot is opening and key is not yet available
      const loadKeyAndInitChat = async () => {
        setLoadingChatbot(true); // Indicate overall chatbot loading
        const key = await fetchGeminiApiKey();
        if (key && !chat.current) {
          initializeChat(key);
        } else if (!key) {
          setLoadingChatbot(false); // If key fetch failed, stop loading
        }
      };
      loadKeyAndInitChat();
    } else if (isOpen && geminiApiKey && !chat.current) {
        // Key is already fetched, just initialize chat
        setLoadingChatbot(true); // Indicate chat initialization
        initializeChat(geminiApiKey);
    } else if (!isOpen) {
        // When closing, reset chat to allow re-initialization if opened again
        chat.current = null;
        genAI.current = null;
        setChatHistory([]); // Clear UI history but local storage persists
        setError(null);
        setLoadingChatbot(false);
    }
  }, [isOpen, geminiApiKey, fetchGeminiApiKey, initializeChat]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleClearChat = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem('mathematico_ai_chat_history');
    chat.current = null; // Invalidate current chat session
    genAI.current = null; // Invalidate current genAI instance
    setError(null);
    setLoadingChatbot(true); // Show loading while re-initializing
    // Re-fetch key and initialize chat
    const loadKeyAndInitChat = async () => {
        const key = await fetchGeminiApiKey();
        if (key) {
            initializeChat(key);
        } else {
            setLoadingChatbot(false); // If key fetch failed, stop loading
        }
    };
    loadKeyAndInitChat();
    setTimeout(() => inputRef.current?.focus(), 500); // Focus input after clearing
  }, [fetchGeminiApiKey, initializeChat]);


  const handleToggleChat = () => {
    setIsOpen(prev => !prev);
    if (!isOpen) { // When opening
        // Fetch key and initialize chat when opening
        if (!geminiApiKey) {
            const loadKeyAndInitChat = async () => {
                setLoadingChatbot(true);
                const key = await fetchGeminiApiKey();
                if (key) {
                    initializeChat(key);
                } else {
                    setLoadingChatbot(false);
                }
            };
            loadKeyAndInitChat();
        } else if (!chat.current) {
            // Key already fetched but chat not initialized (e.g., after clearing)
            initializeChat(geminiApiKey);
        }
        setTimeout(() => inputRef.current?.focus(), 300); // Focus input after modal opens
    } else { // When closing
        setUserMessage('');
        setError(null);
        setLoadingChatbot(false); // Ensure loading is reset when closing
        // Note: chat.current and genAI.current are not reset here,
        // so if the user re-opens, the chat session (and Gemini's internal history) persists.
        // This is a design choice; if a fresh chat on every open is desired, they should be reset here.
        // For local storage persistence across sessions, we rely on the `useEffect` on `chatHistory`.
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || loadingChatbot || !chat.current) return;

    const currentMessage = userMessage.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: currentMessage }]);
    setUserMessage('');
    setLoadingChatbot(true); // Indicate message sending is happening
    setError(null);

    try {
      const result = await chat.current.sendMessage(currentMessage);
      const response = await result.response;
      const text = response.text();
      setChatHistory(prev => [...prev, { role: 'model', text: text }]);
    } catch (err) {
      console.error("Error sending message to Gemini AI:", err);
      setError("Sorry, I'm having trouble connecting right now. Please try again.");
      setChatHistory(prev => [...prev, { role: 'model', text: "Apologies, I encountered an error. Could you please rephrase or try again?" }]);
    } finally {
      setLoadingChatbot(false); // End message sending loading
      // Ensure focus is returned to the input after it's re-enabled
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  return (
    <>
      {/* Floating Chatbot Button */}
      <button
        onClick={handleToggleChat}
        className="fixed bottom-[6rem] right-6 bg-accent text-dark-background p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 ease-in-out z-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-dark-background text-sm sm:text-lg font-bold flex items-center justify-center group"
        aria-label={isOpen ? "Close chatbot" : "Open chatbot"}
      >
        {isOpen ? (
          <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <div className="flex items-center space-x-2">
            {/* Robot SVG with peekaboo animation on hover */}
            <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ease-in-out group-hover:translate-x-[-5px]" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10ZM15.5 10C16.3284 10 17 9.32843 17 8.5C17 7.67157 16.32843 7 15.5 7C14.6716 7 14 7.67157 14 8.5C14 9.32843 14.6716 10 15.5 10ZM12 18.5C9.48912 18.5 7.42211 16.9298 6.78453 14.5H17.2155C16.5779 16.9298 14.5109 18.5 12 18.5Z"/>
            </svg>
            <span>Ask Me</span>
          </div>
        )}
      </button>

      {/* Chatbot Modal */}
      <div className={`fixed bottom-0 left-0 right-0 h-3/4 sm:h-2/3 md:h-1/2 lg:h-2/3 w-full sm:max-w-md bg-medium-dark p-4 rounded-t-xl shadow-2xl border-t border-l border-r border-secondary z-[9999] transition-all duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}
        sm:bottom-[6rem] sm:left-auto sm:right-6 sm:rounded-xl sm:h-[600px] sm:max-w-sm` /* Desktop positioning and size */
      }>
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-secondary">
          <h2 className="text-xl font-bold text-primary flex items-center">
            <FaRobot className="mr-2" /> Mathematico AI
          </h2>
          <div className="flex items-center space-x-2">
            {error && (
              <button
                onClick={handleReportIssue}
                className="text-red-400 hover:text-red-300 transition-colors duration-200 p-1 text-sm flex items-center"
                aria-label="Report issue to administrator"
              >
                Report <span className="hidden sm:inline ml-1">Issue</span>
              </button>
            )}
            <button
              onClick={handleClearChat}
              className="text-secondary hover:text-light-text transition-colors duration-200 p-1 text-sm flex items-center"
              aria-label="Clear chat history"
            >
              Clear <span className="hidden sm:inline ml-1">Chat</span>
            </button>
            <button
              onClick={handleToggleChat}
              className="text-secondary hover:text-light-text transition-colors duration-200 p-1"
              aria-label="Close chatbot"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-2 text-sm animate-fade-in"><strong className="font-bold">Error:</strong> {error}</div>}
          {(loadingChatbot && chatHistory.length === 0) && ( // Show full spinner only initially
            <LoadingSpinner size="medium" />
          )}
          {chatHistory.map((msg, index) => (
            <div key={index} className={`mb-4 p-3 rounded-lg shadow-sm animate-fade-in ${
              msg.role === 'user'
                ? 'bg-primary text-light-text ml-auto rounded-br-none'
                : 'bg-dark-background text-light-text mr-auto rounded-bl-none'
            } max-w-[90%] md:max-w-[80%] markdown-content`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                children={msg.text}
              />
            </div>
          ))}
          {loadingChatbot && chatHistory.length > 0 && <LoadingSpinner size="small" />} {/* Small spinner while sending message */}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center pt-2 border-t border-secondary">
          <input
            type="text"
            ref={inputRef}
            className="flex-grow p-3 rounded-l-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-text text-sm"
            placeholder="Type your message..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={loadingChatbot || !chat.current}
            aria-label="Your message to Mathematico AI"
          />
          <button
            type="submit"
            className="bg-primary text-light-text p-3 rounded-r-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loadingChatbot || !userMessage.trim() || !chat.current}
            aria-label="Send message"
          >
            {loadingChatbot ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;