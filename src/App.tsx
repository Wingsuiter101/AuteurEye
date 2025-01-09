import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import HomePage from './pages/HomePage.tsx'
import DirectorDetailPage from './pages/DirectorDetailPage.tsx'
import QuizPage from './pages/QuizPage.tsx'
import ComparisonPage from './pages/ComparisonPage.tsx'

function App() {
  return (
    <Router>
      <div className="min-h-screen py-20 bg-auteur-bg text-auteur-primary">
        <Navbar />
        <Routes>
  <Route path="/AuteurEye/" element={<HomePage />} />
  <Route path="/AuteurEye/director/:id" element={<DirectorDetailPage />} />
  <Route path="/AuteurEye/quiz" element={<QuizPage />} />
  <Route path="/AuteurEye/compare" element={<ComparisonPage />} />
</Routes>
      </div>
    </Router>
  )
}

export default App
