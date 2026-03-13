import React from 'react';
import { FaBullseye, FaLightbulb, FaHandsHelping, FaHistory } from 'react-icons/fa'; // Icons for sections

const AboutPage = () => {
  const sections = [
    {
      id: "mission",
      title: "Our Mission",
      icon: FaBullseye,
      content: (
        <p className="text-base sm:text-lg text-gray-base leading-relaxed">
          At Mathematico, our mission is to demystify mathematics and make it accessible, engaging, and enjoyable for students of all ages and levels. We believe that with the right guidance and tools, anyone can develop a strong foundation in math and achieve their academic and professional aspirations. We are committed to fostering a love for learning and critical thinking.
        </p>
      )
    },
    {
      id: "vision",
      title: "Our Vision",
      icon: FaLightbulb,
      content: (
        <p className="text-base sm:text-lg text-gray-base leading-relaxed">
          Our vision is to be the leading platform for mathematics education, both through our physical coaching centers and our innovative digital solutions. We aim to create a global community of math enthusiasts, empowering them with the skills to solve real-world problems and drive innovation. We envision a future where mathematical literacy is universal and celebrated.
        </p>
      )
    },
    {
      id: "values",
      title: "Our Values",
      icon: FaHandsHelping,
      content: (
        <ul className="list-disc list-inside text-base sm:text-lg text-gray-base space-y-2 md:space-y-3">
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
          <p className="text-base sm:text-lg text-gray-base leading-relaxed mb-3 md:mb-4">
            Mathematico was founded in 20XX by a team of passionate educators who saw a gap in traditional math instruction. They envisioned a more dynamic, personalized, and technology-integrated approach to learning. Starting as a small local coaching center, Mathematico quickly gained a reputation for its effective teaching methods and student success stories.
          </p>
          <p className="text-base sm:text-lg text-gray-base leading-relaxed">
            Driven by the desire to reach more students and provide flexible learning options, we launched our highly acclaimed Android app. This app perfectly complements our in-person coaching, offering a seamless blend of traditional and digital learning that caters to the modern student. Today, Mathematico continues to grow, touching more lives and helping countless individuals conquer their fear of math and achieve their academic dreams.
          </p>
        </>
      )
    }
  ];

  return (
    <div className="container mx-auto py-8 md:py-12 px-4 min-h-screen">
      <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-6 md:mb-10 text-center animate-fade-in-up">About Mathematico</h1>

      <div className="space-y-8 md:space-y-12">
        {sections.map((section, index) => (
          <section
            key={section.id}
            className="bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center mb-4 md:mb-6">
              <section.icon className="text-primary text-4xl mr-4 flex-shrink-0" />
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