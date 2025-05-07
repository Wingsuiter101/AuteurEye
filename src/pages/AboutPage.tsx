import React from 'react';

const AboutPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center px-4 sm:px-2">
    <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 text-center text-auteur-primary border border-white/10">
      <h1 className="text-3xl font-bold mb-4">About AuteurEye</h1>
      <p className="mb-4">
        <strong>AuteurEye</strong> is a cinematic discovery tool that helps you explore, compare, and learn about film directors and their unique styles. Our mission is to make film appreciation accessible and fun for everyone.
      </p>
      <p className="mb-4">
        Built with love by <strong>SD Studios</strong>.
      </p>
      <p className="text-sm text-auteur-primary/60">Version 1.0.0</p>
    </div>
  </div>
);

export default AboutPage; 