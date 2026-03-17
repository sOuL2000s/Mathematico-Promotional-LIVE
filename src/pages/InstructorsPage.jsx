import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { FaGraduationCap, FaChalkboardTeacher, FaCalendarAlt, FaStar } from 'react-icons/fa'; // Icons for sections
import { db } from '../firebase'; // Import db
import { doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
import LoadingSpinner from '../components/LoadingSpinner'; // Import LoadingSpinner
import ErrorDisplay from '../components/ErrorDisplay'; // Import ErrorDisplay


const InstructorsPage = () => {
  const [founderImageUrl, setFounderImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFounderImage = async () => {
      setLoading(true);
      setError(null);
      try {
        const settingsRef = doc(db, 'settings', 'global');
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          setFounderImageUrl(data.founderImageUrl || '/logo512.png'); // Default to a fallback if not set
        } else {
          setFounderImageUrl('/logo512.png'); // Default if no settings doc
        }
      } catch (err) {
        console.error("Error fetching founder image:", err);
        setError("Failed to load founder image.");
        setFounderImageUrl('/logo512.png'); // Fallback on error
      } finally {
        setLoading(false);
      }
    };
    fetchFounderImage();
  }, []);

  // Helper to add Cloudinary transformations
  const getOptimizedImageUrl = (url, width) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;
    // Example: insert 'f_auto,q_auto,w_WIDTH' after '/upload/'
    return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
  };

  // Since there is only one instructor, the page focuses on him
  const instructor = {
    name: "Dipanjan Chatterjee",
    title: "Founder & Lead Instructor",
    qualification: "M.Sc. in Pure Mathematics",
    experience: `Teaching since 2011 (${new Date().getFullYear() - 2011}+ years)`, // Dynamically calculate experience
    mathematicoFounded: "Mathematico officially started in 2016",
    bio: [
      "Dipanjan Chatterjee is the visionary founder and sole instructor at Mathematico. With a profound passion for mathematics and an M.Sc. in Pure Mathematics, he has been dedicated to teaching and mentoring students since 2011.",
      "His journey with Mathematico officially began in 2016, driven by a philosophy to demystify complex mathematical concepts and make learning an engaging and insightful experience for every student.",
      "Known for his innovative pedagogical approaches, meticulous personalized attention, and ability to transform daunting equations into clear insights, Dipanjan has earned a reputation for building strong foundations and cultivating a deep understanding of mathematical principles.",
      "From his humble beginnings, Dipanjan has grown to become a phenomenon in mathematics education, empowering countless students to not just learn, but to truly excel in their academic and competitive pursuits. His focus on conceptual clarity, advanced problem-solving techniques, and rigorous examination readiness ensures that students are well-prepared to conquer any mathematical challenge."
    ],
    imageUrl: founderImageUrl, // Use the dynamically fetched image URL
    achievements: [
      "Mentored thousands of students for various academic boards and competitive exams.",
      "Developed an innovative curriculum that integrates traditional teaching with modern digital tools.",
      "Consistently achieved high student success rates in board exams and entrance tests.",
      "Pioneered an interactive Android app to enhance self-paced learning and practice."
    ]
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen"><ErrorDisplay message={error} /></div>;

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-6 md:mb-10 text-center animate-fade-in-up">Meet Our Instructor</h1>
      <p className="text-base sm:text-xl text-secondary text-center mb-8 md:mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-100">
        At Mathematico, quality education is our cornerstone, and it starts with our dedicated and expert instructor.
      </p>

      {/* Instructor Card */}
      <section className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-secondary max-w-4xl mx-auto animate-fade-in-up animation-delay-200">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="flex-shrink-0 text-center">
            <img
              src={getOptimizedImageUrl(instructor.imageUrl, 300)} // Optimize image for display width
              alt={instructor.name}
              className="rounded-full w-48 h-48 md:w-56 md:h-56 object-cover object-top mx-auto shadow-lg border-4 border-accent"
              loading="lazy" // Lazy load image
            />
            <h2 className="text-3xl font-bold text-primary mt-4">{instructor.name}</h2>
            <p className="text-light-text text-xl">{instructor.title}</p>
          </div>

          <div className="md:flex-grow text-center md:text-left">
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center md:justify-start text-secondary text-lg">
                <FaGraduationCap className="text-accent mr-3 text-2xl" />
                <span>{instructor.qualification}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-secondary text-lg">
                <FaChalkboardTeacher className="text-accent mr-3 text-2xl" />
                <span>{instructor.experience}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start text-secondary text-lg">
                <FaCalendarAlt className="text-accent mr-3 text-2xl" />
                <span>{instructor.mathematicoFounded}</span>
              </div>
            </div>

            <div className="space-y-4 text-base sm:text-lg text-secondary leading-relaxed">
              {instructor.bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Key Achievements */}
        <div className="mt-10 pt-8 border-t border-secondary">
          <h3 className="text-2xl font-bold text-light-text mb-4 flex items-center justify-center md:justify-start">
            <FaStar className="text-accent mr-3 text-2xl" /> Key Achievements
          </h3>
          <ul className="list-disc list-inside text-base sm:text-lg text-secondary space-y-2 ml-4">
            {instructor.achievements.map((achievement, index) => (
              <li key={index}>{achievement}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Call to Action or further info */}
      <section className="bg-primary text-light-text p-6 md:p-8 rounded-xl shadow-xl mt-8 md:mt-16 text-center animate-fade-in-up animation-delay-400 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 md:mb-4">Ready to learn from the best?</h2>
        <p className="text-base sm:text-lg mb-4 md:mb-6 opacity-90">
          Join Mathematico and experience a transformative learning journey under expert guidance.
        </p>
        <button className="inline-block bg-accent text-dark-background font-bold py-2.5 px-6 sm:px-8 rounded-full hover:bg-cyan-400 transition-colors duration-300 transform hover:scale-105 shadow-md text-base sm:text-lg">
          Explore Our Courses
        </button>
      </section>
    </div>
  );
};

export default InstructorsPage;