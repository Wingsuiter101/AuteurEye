import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import HomePage from './pages/HomePage.tsx'
import DirectorDetailPage from './pages/DirectorDetailPage.tsx'
import QuizPage from './pages/QuizPage.tsx'
import ComparisonPage from './pages/ComparisonPage.tsx'
import ContextualQuiz from './pages/ContextualQuiz'
import MovieDetailPage from './pages/MovieDetailPage'

function App() {
  return (
    <Router basename="/AuteurEye">
      <div className="relative min-h-screen bg-auteur-bg text-auteur-primary">
        {/* Video Background */}
        <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover opacity-20"
          >
            <source src="/AuteurEye/background.mp4" type="video/mp4" />
          </video>
          {/* Overlay to ensure content readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-auteur-bg/80 to-auteur-bg-dark/80" />
        </div>
        
        <Navbar />
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/director/:id" element={<DirectorDetailPage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/quiz" element={<ContextualQuiz />} />
            <Route path="/movie/:id" element={<MovieDetailPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
