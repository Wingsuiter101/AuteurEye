import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import HomePage from './pages/HomePage.tsx'
import DirectorDetailPage from './pages/DirectorDetailPage.tsx'
import ComparisonPage from './pages/ComparisonPage.tsx'
import ContextualQuiz from './pages/ContextualQuiz'
import MovieDetailPage from './pages/MovieDetailPage'
import { useEffect, useState } from 'react';
import { tmdbService } from './services/tmdb';
import { useTMDB } from './hooks/useTMDB';

function BackgroundCollage({ posters }: { posters: string[] }) {
  console.log('Collage posters:', posters);
  return (
    <div className="fixed inset-0 z-1 overflow-hidden">
      <div
        className="w-screen h-screen grid grid-cols-5 grid-rows-4 gap-0 animate-slow-move"
        style={{
          opacity: 0.05,
          filter: 'blur(6px)',
        }}
      >
        {posters.slice(0, 20).map((url) => (
          <div
            key={url}
            className="w-full h-full min-h-[100px] min-w-[100px] bg-cover bg-center"
            style={{ backgroundImage: `url(${url})` }}
          />
        ))}
      </div>
    </div>
  );
}

function useCollagePosters() {
  const [posters, setPosters] = useState<string[]>([]);
  const { getImageUrl } = useTMDB();
  useEffect(() => {
    async function fetchCollage() {
      try {
        const movies = await tmdbService.getDiverseMoviePool(20);
        setPosters(
          movies
            .filter((m: any) => m.poster_path)
            .map((m: any) => getImageUrl(m.poster_path, 'w500'))
            .filter((url): url is string => Boolean(url))
        );
      } catch {}
    }
    fetchCollage();
  }, [getImageUrl]);
  return posters;
}

function App() {
  const posters = useCollagePosters();
  return (
    <Router basename="/AuteurEye">
      <div className="relative min-h-screen bg-auteur-bg text-auteur-primary">
        <BackgroundCollage posters={posters} />
        
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
