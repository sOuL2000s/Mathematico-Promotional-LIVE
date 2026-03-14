import React, { useState, useEffect } from 'react'; // Added useState and useEffect
import { FaBullseye, FaLightbulb, FaHandsHelping, FaHistory, FaUserGraduate } from 'react-icons/fa'; // Icons for sections
import { db } from '../firebase'; // Import db
import { doc, getDoc } from 'firebase/firestore'; // Import doc and getDoc
import LoadingSpinner from '../components/LoadingSpinner'; // Import LoadingSpinner
import ErrorDisplay from '../components/ErrorDisplay'; // Import ErrorDisplay


const AboutPage = () => {
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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen"><ErrorDisplay message={error} /></div>;


  const sections = [
    {
      id: "philosophy-founder",
      title: "Our Philosophy & Founder",
      icon: FaUserGraduate,
      content: (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-full md:w-1/3 flex-shrink-0 text-center">
            <img 
              src={founderImageUrl} 
              alt="Dipanjan Chatterjee, Founder of Mathematico" 
              className="rounded-full w-48 h-48 md:w-56 md:h-56 object-cover object-top mx-auto shadow-lg border-4 border-primary" 
              onError={(e) => { e.target.onerror = null; e.target.src = "/logo512.png" }} // Fallback image on error
            />
            <h3 className="text-xl font-semibold text-light-text mt-4">Dipanjan Chatterjee</h3>
            <p className="text-secondary text-md">M.Sc. in Pure Mathematics</p>
          </div>
          <div className="md:w-2/3">
            <p className="text-base sm:text-lg text-secondary leading-relaxed mb-3">
              At MATHEMATICO, we believe that every student possesses an inherent ability to conquer the complexities of mathematics. Our philosophy centers on transforming daunting equations into engaging insights, building a robust foundation, and cultivating a profound understanding of mathematical principles.
            </p>
            <p className="text-base sm:text-lg text-secondary leading-relaxed">
              Under the expert guidance of Dipanjan Chatterjee, M.Sc in Pure Maths, we employ innovative pedagogical approaches, provide meticulous personalized attention, and foster a nurturing learning ecosystem. Our focus is squarely on conceptual clarity, advanced problem-solving techniques, and rigorous examination readiness, empowering students to not just learn, but to truly excel.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "mission",
      title: "Our Mission",
      icon: FaBullseye,
      content: (
        <p className="text-base sm:text-lg text-secondary leading-relaxed">
          At Mathematico, our mission is to demystify mathematics and make it accessible, engaging, and enjoyable for students of all ages and levels. We believe that with the right guidance and tools, anyone can develop a strong foundation in math and achieve their academic and professional aspirations. We are committed to fostering a love for learning and critical thinking.
        </p>
      )
    },
    {
      id: "vision",
      title: "Our Vision",
      icon: FaLightbulb,
      content: (
        <p className="text-base sm:text-lg text-secondary leading-relaxed">
          Our vision is to be the leading platform for mathematics education, both through our physical coaching centers and our innovative digital solutions. We aim to create a global community of math enthusiasts, empowering them with the skills to solve real-world problems and drive innovation. We envision a future where mathematical literacy is universal and celebrated.
        </p>
      )
    },
    {
      id: "values",
      title: "Our Values",
      icon: FaHandsHelping,
      content: (
        <ul className="list-disc list-inside text-base sm:text-lg text-secondary space-y-2 md:space-y-3">
          <li>
            <strong>Excellence:</strong> We strive for the highest quality in teaching, curriculum development, and student support.
          </li>
          <li>
            <strong>Innovation:</strong> We continuously explore new methodologies and technologies, like our Android app, to enhance the learning experience.
          </li>
          <li>
            <strong>Integrity:</strong> We uphold honesty, transparency, and ethical practices in all our interactions.
          </li>
          <li>
            <strong>Empowerment:</strong> We empower students to take ownership of their learning, build confidence, and overcome challenges.
          </li>
          <li>
            <strong>Community:</strong> We foster a supportive and collaborative environment where students and educators can thrive together.
          </li>
        </ul>
      )
    },
    {
      id: "story",
      title: "Our Story",
      icon: FaHistory,
      content: (
        <>
          <p className="text-base sm:text-lg text-secondary leading-relaxed mb-3 md:mb-4">
            Mathematico's journey began with its founder, Dipanjan Chatterjee, M.Sc. in Pure Mathematics, who has been passionately teaching since 2011. What started as a humble endeavor to share the beauty of mathematics officially blossomed into Mathematico in 2016. Dipanjan's dedication and innovative teaching methods quickly made Mathematico a recognized name for effective math instruction.
          </p>
          <p className="text-base sm:text-lg text-secondary leading-relaxed">
            Driven by the desire to reach more students and provide flexible learning options, we launched our highly acclaimed Android app. This app perfectly complements our in-person coaching, offering a seamless blend of traditional and digital learning that caters to the modern student. Today, Mathematico continues to grow, touching more lives and helping countless individuals conquer their fear of math and achieve their academic dreams.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-light-text mb-6 md:mb-10 text-center animate-fade-in-up">About Mathematico</h1>

      <div className="space-y-8 md:space-y-12">
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="bg-medium-dark p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-secondary animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center mb-4 md:mb-6">
              <section.icon className="text-accent text-4xl mr-4 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary">{section.title}</h2>
            </div>
            {section.content}
          </section>
        ))}
      </div>
    </div>
  );
};

export default AboutPage;