import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import HomePage from './pages/HomePage.tsx'
import DirectorDetailPage from './pages/DirectorDetailPage.tsx'
import QuizPage from './pages/QuizPage.tsx'
import ComparisonPage from './pages/ComparisonPage.tsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-auteur-bg text-auteur-primary">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/director/:id" element={<DirectorDetailPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/compare" element={<ComparisonPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
