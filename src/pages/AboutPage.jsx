import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto py-12 px-4 min-h-screen">
      <h1 className="text-5xl font-bold text-dark mb-8 text-center">About Mathematico</h1>

      <section className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Mission</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          At Mathematico, our mission is to demystify mathematics and make it accessible, engaging, and enjoyable for students of all ages and levels. We believe that with the right guidance and tools, anyone can develop a strong foundation in math and achieve their academic and professional aspirations. We are committed to fostering a love for learning and critical thinking.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Vision</h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          Our vision is to be the leading platform for mathematics education, both through our physical coaching centers and our innovative digital solutions. We aim to create a global community of math enthusiasts, empowering them with the skills to solve real-world problems and drive innovation. We envision a future where mathematical literacy is universal and celebrated.
        </p>
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md mb-8 border border-gray-100">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Values</h2>
        <ul className="list-disc list-inside text-lg text-gray-700 space-y-3">
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
      </section>

      <section className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-3xl font-semibold text-primary mb-4">Our Story</h2>
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Mathematico was founded in 20XX by a team of passionate educators who saw a gap in traditional math instruction. They envisioned a more dynamic, personalized, and technology-integrated approach to learning. Starting as a small local coaching center, Mathematico quickly gained a reputation for its effective teaching methods and student success stories.
        </p>
        <p className="text-lg text-gray-700 leading-relaxed">
          Driven by the desire to reach more students and provide flexible learning options, we launched our highly acclaimed Android app. This app perfectly complements our in-person coaching, offering a seamless blend of traditional and digital learning that caters to the modern student. Today, Mathematico continues to grow, touching more lives and helping countless individuals conquer their fear of math and achieve their academic dreams.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;