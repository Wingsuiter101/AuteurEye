import React from 'react';

const PrivacyPage: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center px-4 sm:px-2">
    <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 sm:p-8 text-center text-auteur-primary border border-white/10">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        <strong>AuteurEye</strong> does not collect, store, or share any personal data from users. We respect your privacy.
      </p>
      <p className="mb-4">
        This app uses the <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-auteur-accent underline">TMDB API</a> to provide movie and director information. Please review <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-auteur-accent underline">TMDB's privacy policy</a> for more details about their data practices.
      </p>
      <p className="text-sm text-auteur-primary/60">If you have any privacy concerns, please contact SD Studios.</p>
    </div>
  </div>
);

export default PrivacyPage; 