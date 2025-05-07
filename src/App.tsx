import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { TMDBProvider } from '@/contexts/TMDBContext';
import HomePage from '@/pages/HomePage';
import ErrorBoundary from '@/components/ErrorBoundary';
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import DirectorDetailPage from '@/pages/DirectorDetailPage';
import ComparisonPage from '@/pages/ComparisonPage';
import ContextualQuiz from '@/pages/ContextualQuiz';
import MovieDetailPage from '@/pages/MovieDetailPage';
import BackgroundCollage from '@/components/BackgroundCollage';
import { useCollagePosters } from '@/hooks/useCollagePosters';
import Footer from '@/components/Footer';
import AboutPage from '@/pages/AboutPage';
import PrivacyPage from '@/pages/PrivacyPage';

const App: React.FC = () => {
  const posters = useCollagePosters();
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <TMDBProvider>
          <Router basename="/AuteurEye">
            <SEO />
            <div className="relative min-h-screen bg-auteur-bg text-auteur-primary">
              <BackgroundCollage posters={posters} />
              
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/director/:id" element={<DirectorDetailPage />} />
                  <Route path="/compare" element={<ComparisonPage />} />
                  <Route path="/quiz" element={<ContextualQuiz />} />
                  <Route path="/movie/:id" element={<MovieDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                </Routes>
              </main>
            </div>
            {/* Desktop Footer */}
            <div className="hidden md:block">
              <Footer />
            </div>
          </Router>
        </TMDBProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default App;
