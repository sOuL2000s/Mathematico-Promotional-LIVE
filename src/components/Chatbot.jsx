import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa'; // Import icons
import LoadingSpinner from './LoadingSpinner'; // Assuming you have a LoadingSpinner component
import { db } from '../firebase'; // Import Firestore db
import { collection, getDocs, orderBy, doc, getDoc, query, limit } from 'firebase/firestore'; // Import Firestore functions


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingChatbot, setLoadingChatbot] = useState(false); // General loading state for chatbot operations (API key fetch, chat init, message send)
  const [error, setError] = useState(null);
  // Stores messages as { role: 'user' | 'model', text: string, followUps?: string[] }
  const [chatHistory, setChatHistory] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // New states for multiple API keys
  const [geminiApiKeys, setGeminiApiKeys] = useState([]); // Array of all fetched API keys
  const [currentApiKeyIndex, setCurrentApiKeyIndex] = useState(0); // Index of the currently active key
  const [activeApiKey, setActiveApiKey] = useState(null); // The actual API key string currently in use
  const [dynamicWebsiteData, setDynamicWebsiteData] = useState(''); // Stores dynamic data for prompt injection
  const [hasConversationStarted, setHasConversationStarted] = useState(false); // New state for quick questions visibility

  // Initialize Gemini API only once per active key
  const genAI = useRef(null);
  const chat = useRef(null);

  // Founder's WhatsApp number for error reporting
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
- **You have access to the following real-time data from the website (enclosed in <DYNAMIC_WEBSITE_DATA> tags). Use this information to answer specific queries, but do not just list it out. Summarize and guide users to the relevant pages for full details.**
`;

  // Function to report API key errors via WhatsApp
  const handleReportIssue = () => {
    if (error) {
      const message = encodeURIComponent(`Mathematico AI Chatbot Error: ${error}\nActive API Key Index: ${currentApiKeyIndex}\nTotal Keys: ${geminiApiKeys.length}\nPlease investigate.`);
      const whatsappUrl = `https://wa.me/${founderWhatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("No active error to report. If you're experiencing an issue, please describe it and contact support directly.");
    }
  };

  const fetchGeminiApiKeys = useCallback(async () => {
    setLoadingChatbot(true); // Start loading for API key fetch
    try {
      const settingsRef = doc(db, 'settings', 'global');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists() && settingsSnap.data().geminiApiKeys && settingsSnap.data().geminiApiKeys.length > 0) {
        const keys = settingsSnap.data().geminiApiKeys;
        setGeminiApiKeys(keys);
        setCurrentApiKeyIndex(0); // Start with the first key
        setActiveApiKey(keys[0]); // Set the first key as active
        setError(null);
        return keys[0]; // Return first key for immediate use
      } else {
        setError("Gemini API keys are not configured. Please contact the administrator.");
        setGeminiApiKeys([]);
        setCurrentApiKeyIndex(0);
        setActiveApiKey(null);
      }
    } catch (err) {
      console.error("Error fetching Gemini API keys:", err);
      setError("Failed to load Gemini API keys. Chatbot may not function.");
      setGeminiApiKeys([]);
      setCurrentApiKeyIndex(0);
      setActiveApiKey(null);
    } finally {
      setLoadingChatbot(false); // End loading for API key fetch
    }
    return null;
  }, []);

  // --- START: Refactored callback definitions for dependency management ---

  // handleApiKeySwitch: This function's sole responsibility is to update state to switch the active key.
  // It does NOT directly call initializeChat. The change in activeApiKey state will trigger the useEffect below.
  const handleApiKeySwitch = useCallback(() => {
      if (geminiApiKeys.length === 0) {
          setError("No API keys are configured. Please inform the administrator.");
          return;
      }

      const nextIndex = (currentApiKeyIndex + 1) % geminiApiKeys.length;
      setCurrentApiKeyIndex(nextIndex);
      setActiveApiKey(geminiApiKeys[nextIndex]); // This state update is what triggers re-initialization

      // Invalidate current chat session and genAI instance so they get recreated with the new key.
      chat.current = null;
      genAI.current = null;

      console.log(`Switching to API key at index: ${nextIndex}`);
      setError(`API key failed. Switching to key ${nextIndex + 1}/${geminiApiKeys.length}. Please try sending your message again.`);

      // No direct call to initializeChat here to break circular dependency.
  }, [geminiApiKeys, currentApiKeyIndex]); // Dependencies: only what's needed for the switch logic.

  // fetchDynamicWebsiteData: This function fetches and formats dynamic content from Firestore.
  const fetchDynamicWebsiteData = useCallback(async () => {
    const dataParts = [];
    const baseUrl = window.location.origin;

    // Fetch Latest Posts (top 3)
    try {
      const postsQ = query(collection(db, 'posts'), orderBy('timestamp', 'desc'), limit(3));
      const postsSnap = await getDocs(postsQ);
      if (!postsSnap.empty) {
        dataParts.push("Latest 3 Posts:");
        postsSnap.forEach(doc => {
          const post = doc.data();
          dataParts.push(`- ${post.title} (${baseUrl}/posts/${doc.id})`);
        });
      }
    } catch (e) {
      console.error("Error fetching posts for chatbot:", e);
    }

    // Fetch Courses (first 5, categorized by level)
    try {
      const coursesQ = query(collection(db, 'courses'), orderBy('title', 'asc'), limit(5));
      const coursesSnap = await getDocs(coursesQ);
      if (!coursesSnap.empty) {
        dataParts.push("\nCourses Offered:");
        coursesSnap.forEach(doc => {
          const course = doc.data();
          dataParts.push(`- ${course.title} (Level: ${course.level}, Category: ${course.category || 'N/A'}, Link: ${baseUrl}/courses)`);
        });
        if (coursesSnap.size >= 5) {
            dataParts.push(`... and more courses are available on the Courses Page (${baseUrl}/courses).`);
        }
      }
    } catch (e) {
      console.error("Error fetching courses for chatbot:", e);
    }

    // Fetch Books (first 5)
    try {
      const booksQ = query(collection(db, 'books'), orderBy('title', 'asc'), limit(5));
      const booksSnap = await getDocs(booksQ);
      if (!booksSnap.empty) {
        dataParts.push("\nBooks & PDF Resources:");
        booksSnap.forEach(doc => {
          const book = doc.data();
          dataParts.push(`- ${book.title} (Link to PDF: ${book.googleDriveLink})`);
        });
        if (booksSnap.size >= 5) {
            dataParts.push(`... and more books are available on the Books Page (${baseUrl}/books).`);
        }
      }
    } catch (e) {
      console.error("Error fetching books for chatbot:", e);
    }

    // Fetch Videos (first 5)
    try {
      const videosQ = query(collection(db, 'videos'), orderBy('title', 'asc'), limit(5));
      const videosSnap = await getDocs(videosQ);
      if (!videosSnap.empty) {
        dataParts.push("\nEducational Videos:");
        videosSnap.forEach(doc => {
          const video = doc.data();
          dataParts.push(`- ${video.title} (Link to YouTube: ${video.youtubeLink})`);
        });
        if (videosSnap.size >= 5) {
            dataParts.push(`... and more videos are available on the Videos Page (${baseUrl}/videos).`);
        }
      }
    } catch (e) {
      console.error("Error fetching videos for chatbot:", e);
    }

    // Fetch Latest Reviews (top 3)
    try {
      const reviewsQ = query(collection(db, 'reviews'), orderBy('timestamp', 'desc'), limit(3));
      const reviewsSnap = await getDocs(reviewsQ);
      if (!reviewsSnap.empty) {
        dataParts.push("\nLatest 3 Reviews:");
        reviewsSnap.forEach(doc => {
          const review = doc.data();
          const feedbackSnippet = (review.feedbackText || '').substring(0, 70) + (review.feedbackText.length > 70 ? '...' : '');
          dataParts.push(`- "${feedbackSnippet}" by ${review.reviewerName || 'Anonymous'} (${review.rating || 0} stars)`);
        });
      }
    } catch (e) {
      console.error("Error fetching reviews for chatbot:", e);
    }

    // Founder/Instructor Information (hardcoded reference to page, as detailed text isn't in settings/global)
    dataParts.push(`\nInstructor Information:
Detailed information about our lead instructor, Dipanjan Chatterjee (M.Sc. Pure Mathematics, teaching since 2011+ years of experience), including his qualifications, experience, and achievements, can be found on the Instructors Page: ${baseUrl}/instructors.`);


    setDynamicWebsiteData(`<DYNAMIC_WEBSITE_DATA>\n${dataParts.join('\n')}\n</DYNAMIC_WEBSITE_DATA>`);
  }, []);

  // initializeChat: This function performs the actual chat initialization.
  // It now implicitly uses `activeApiKey` from state rather than taking it as an argument.
  // On error, it calls `handleApiKeySwitch` (which only updates state, not re-initializes).
  const initializeChat = useCallback(() => {
    const keyToUse = activeApiKey; // Use the currently active API key from state.

    if (!keyToUse) {
      setError("Gemini API key is missing. Chatbot cannot be initialized.");
      setLoadingChatbot(false);
      return;
    }

    try {
      genAI.current = new GoogleGenerativeAI(keyToUse);
      const model = genAI.current.getGenerativeModel({
        model: "gemini-2.5-flash",
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
      const geminiInitialHistory = [
        {
          role: "user", // Acting as a user providing system instructions
          parts: [{ text: websiteInfo + dynamicWebsiteData }] // Inject dynamic data here
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
        setHasConversationStarted(true); // If history exists, conversation has started
      } else {
        setChatHistory([{ role: 'model', text: modelGreeting }]);
        setHasConversationStarted(false); // If no history, conversation hasn't started
      }
      setError(null); // Clear any previous API key errors now that chat is initialized
    } catch (err) {
      console.error("Failed to initialize Gemini AI with key:", keyToUse, err);
      setError("Failed to initialize the chatbot with the current key. Trying next key.");
      // Trigger API key switch by calling handleApiKeySwitch (which only updates state)
      handleApiKeySwitch();
    } finally {
      setLoadingChatbot(false);
    }
  }, [websiteInfo, activeApiKey, dynamicWebsiteData, handleApiKeySwitch]); // Dependencies: what initializeChat *directly* uses.

  // --- END: Refactored callback definitions for dependency management ---

  // Effect to save chat history to local storage whenever it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
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

  // Main effect for opening/closing chatbot and managing API keys/chat initialization
  // This useEffect now orchestrates the calls to fetchKeys and initializeChat based on state.
  useEffect(() => {
    if (isOpen) {
      if (geminiApiKeys.length === 0) {
        // No keys fetched yet or they were cleared, try to fetch
        const loadKeysAndInitChat = async () => {
          setLoadingChatbot(true);
          const firstKey = await fetchGeminiApiKeys(); // This updates `geminiApiKeys` and `activeApiKey`
          if (firstKey) {
            // Once `activeApiKey` is set by `fetchGeminiApiKeys`, `initializeChat` can be called.
            // The dependency `activeApiKey` in this useEffect will ensure `initializeChat` runs.
            // We call it explicitly here for immediate response, as state updates can be asynchronous.
            initializeChat();
          } else {
            setLoadingChatbot(false); // If key fetch failed, stop loading
          }
        };
        loadKeysAndInitChat();
      } else if (!chat.current && activeApiKey) {
        // Keys are present, but chat not initialized (e.g., after clearing or switching keys)
        setLoadingChatbot(true);
        initializeChat();
      } else if (!activeApiKey && geminiApiKeys.length > 0) {
        // Keys are present but activeApiKey somehow got unset (e.g., initial load after fetchKeys)
        setActiveApiKey(geminiApiKeys[0]); // This state update will trigger a re-render
        setCurrentApiKeyIndex(0); // Ensure index is reset
        setLoadingChatbot(true);
        initializeChat(); // Initialize with the newly set activeApiKey
      }
      setTimeout(() => inputRef.current?.focus(), 300); // Focus input after modal opens
    } else { // When closing
        setUserMessage('');
        setError(null);
        setLoadingChatbot(false); // Ensure loading is reset when closing
        // Chat and genAI instances are reset to ensure fresh state for potential key switches
        chat.current = null;
        genAI.current = null;
        setChatHistory([]); // Clear UI history, but local storage persists
        setHasConversationStarted(false); // Reset conversation state when closing
    }
  }, [isOpen, geminiApiKeys, activeApiKey, fetchGeminiApiKeys, initializeChat]);

  // Effect to fetch dynamic website data when chatbot opens or API key is ready
  useEffect(() => {
    if (isOpen && activeApiKey) {
      fetchDynamicWebsiteData();
    } else if (!isOpen) {
      setDynamicWebsiteData(''); // Clear dynamic data when chatbot closes
    }
  }, [isOpen, activeApiKey, fetchDynamicWebsiteData]);

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
    setHasConversationStarted(false); // Reset conversation state on clear

    // Re-fetch keys and initialize chat with the first key
    const loadKeysAndInitChat = async () => {
        const firstKey = await fetchGeminiApiKeys();
        if (firstKey) {
            initializeChat(); // Call initializeChat without argument, it uses state.
        } else {
            setLoadingChatbot(false); // If key fetch failed, stop loading
        }
    };
    loadKeysAndInitChat();
    setTimeout(() => inputRef.current?.focus(), 500); // Focus input after clearing
  }, [fetchGeminiApiKeys, initializeChat]);


  const handleToggleChat = () => {
    setIsOpen(prev => !prev);
    // Logic for opening/closing is primarily handled by the main useEffect
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userMessage.trim() || loadingChatbot || !chat.current || !activeApiKey) {
      if (!activeApiKey && geminiApiKeys.length > 0) {
          setError("Chatbot not initialized. Please wait or try again.");
          // Attempt to re-initialize if possible
          if (!chat.current && !loadingChatbot) {
            setLoadingChatbot(true);
            initializeChat(geminiApiKeys[currentApiKeyIndex]);
          }
      } else if (geminiApiKeys.length === 0) {
          setError("No API keys are configured. Please inform the administrator.");
      }
      return;
    }

    const currentMessage = userMessage.trim();
    setChatHistory(prev => [...prev, { role: 'user', text: currentMessage }]);
    setUserMessage('');
    setLoadingChatbot(true); // Indicate message sending is happening
    setError(null); // Clear previous errors
    setHasConversationStarted(true); // Conversation has definitely started

    try {
      const result = await chat.current.sendMessage(currentMessage);
      const response = await result.response;
      const text = response.text();

      // IMPORTANT: For actual dynamic, AI-generated follow-up questions,
      // you would need to adjust the AI's prompt to output them in a structured, parsable format
      // (e.g., JSON with a 'text' field and a 'followUps' array).
      // The current implementation provides static examples based on keywords.
      let followUps = [];
      if (text.toLowerCase().includes("course")) {
        followUps = ["Tell me more about a specific course.", "How do I enroll in a course?"];
      } else if (text.toLowerCase().includes("instructor") || text.toLowerCase().includes("dipanjan")) {
        followUps = ["What are the instructor's qualifications?", "Where can I find his achievements?"];
      } else if (text.toLowerCase().includes("app")) {
        followUps = ["Where can I download the app?", "What features does the app have?"];
      } else if (text.toLowerCase().includes("post") || text.toLowerCase().includes("blog")) {
        followUps = ["Show me recent posts.", "What kind of posts do you have?"];
      } else {
        // Generic follow-ups for other responses
        followUps = ["What are your office hours?", "How can I contact support?"];
      }

      setChatHistory(prev => [...prev, { role: 'model', text: text, followUps: followUps }]);
    } catch (err) {
      console.error("Error sending message to Gemini AI:", err);
      // Determine if it's an API key specific error
      if (err.message && (err.message.includes("API key not valid") || err.message.includes("403") || err.message.includes("429"))) {
          console.warn("Attempting to switch API key due to error:", err.message);
          handleApiKeySwitch(); // Switch API key and inform user
      } else {
          setError("Sorry, I'm having trouble connecting right now. Please try again.");
          setChatHistory(prev => [...prev, { role: 'model', text: "Apologies, I encountered an error. Could you please rephrase or try again?" }]);
      }
    } finally {
      setLoadingChatbot(false); // End message sending loading
      // Ensure focus is returned to the input after it's re-enabled
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const handleQuickQuestionClick = (question) => {
    setUserMessage(question);
    // Directly submit the message when a quick question is clicked
    // This will trigger handleSubmit and update hasConversationStarted
    const event = new Event('submit', { cancelable: true, bubbles: true });
    inputRef.current.form.dispatchEvent(event);
  };

  const handleFollowUpClick = (followUpQuestion) => {
    setUserMessage(followUpQuestion);
    // Directly submit the message when a follow-up question is clicked
    const event = new Event('submit', { cancelable: true, bubbles: true });
    inputRef.current.form.dispatchEvent(event);
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
            <div key={index} className="mb-4 animate-fade-in">
              <div className={`p-3 rounded-lg shadow-sm ${
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
              {/* Follow-up Buttons for Model messages */}
              {msg.role === 'model' && msg.followUps && msg.followUps.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 ml-auto max-w-[90%] md:max-w-[80%]">
                  {msg.followUps.map((followUp, fIndex) => (
                    <button
                      key={fIndex}
                      onClick={() => handleFollowUpClick(followUp)}
                      className="px-3 py-1 bg-secondary text-dark-background rounded-full hover:bg-accent hover:text-light-text transition-colors duration-200 text-xs"
                      disabled={loadingChatbot}
                    >
                      {followUp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loadingChatbot && chatHistory.length > 0 && <LoadingSpinner size="small" />} {/* Small spinner while sending message */}
        </div>

        {/* Quick Questions / Follow-up Buttons (Conditional) */}
        {!hasConversationStarted && (
          <div className="mt-4 pt-2 border-t border-secondary">
            <p className="text-gray-text text-sm mb-2">Quick Questions:</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleQuickQuestionClick('What are your latest courses?')}
                className="px-3 py-1 bg-secondary text-dark-background rounded-full hover:bg-accent hover:text-light-text transition-colors duration-200"
                disabled={loadingChatbot || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
              >
                Latest Courses
              </button>
              <button
                onClick={() => handleQuickQuestionClick('Tell me about the instructor.')}
                className="px-3 py-1 bg-secondary text-dark-background rounded-full hover:bg-accent hover:text-light-text transition-colors duration-200"
                disabled={loadingChatbot || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
              >
                Instructor Info
              </button>
              <button
                onClick={() => handleQuickQuestionClick('Show me recent posts.')}
                className="px-3 py-1 bg-secondary text-dark-background rounded-full hover:bg-accent hover:text-light-text transition-colors duration-200"
                disabled={loadingChatbot || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
              >
                Recent Posts
              </button>
              <button
                onClick={() => handleQuickQuestionClick('How can I enroll in a course?')}
                className="px-3 py-1 bg-secondary text-dark-background rounded-full hover:bg-accent hover:text-light-text transition-colors duration-200"
                disabled={loadingChatbot || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
              >
                Enrollment Process
              </button>
              <button
                onClick={() => handleQuickQuestionClick('Where can I find study materials?')}
                className="px-3 py-1 bg-secondary text-dark-background rounded-full hover:bg-accent hover:text-light-text transition-colors duration-200"
                disabled={loadingChatbot || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
              >
                Study Materials
              </button>
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="mt-4 flex items-center pt-2 border-t border-secondary">
          <input
            type="text"
            ref={inputRef}
            className="flex-grow p-3 rounded-l-lg bg-dark-background text-light-text border border-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder-gray-text text-sm"
            placeholder="Type your message..."
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
            disabled={loadingChatbot || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
            aria-label="Your message to Mathematico AI"
          />
          <button
            type="submit"
            className="bg-primary text-light-text p-3 rounded-r-lg hover:bg-blue-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={loadingChatbot || !userMessage.trim() || !chat.current || !activeApiKey || geminiApiKeys.length === 0}
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