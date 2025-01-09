import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTMDB } from '../hooks/useTMDB';
import { DirectorDetails } from '../types/tmdb';
import { Film, Star, Clock, TrendingUp } from 'lucide-react';

// At the top of HomePage.tsx, after imports




const HomePage = () => {
  // Get the loading state and methods from useTMDB hook
  const { loading, getDirectorDetails, getImageUrl, getEstablishedDirectors } = useTMDB();
  const [directors, setDirectors] = useState<DirectorDetails[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  
  // Add a local loading state for more granular control
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDirectors = async () => {
      setIsLoading(true);
      try {
        const directors = await getEstablishedDirectors();
        
        // Take 6 random directors
        const selectedDirectors = directors
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
        
        // Add delay between requests to avoid rate limiting
        const detailedDirectors = await Promise.all(
          selectedDirectors.map(async (director, index) => {
            // Add a small delay between each request
            await new Promise(resolve => setTimeout(resolve, index * 100));
            return getDirectorDetails(director.id);
          })
        );
        
        setDirectors(detailedDirectors);
      } catch (err) {
        console.error('Error fetching directors:', err);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchDirectors();
  }, [getEstablishedDirectors, getDirectorDetails]);

  // Check both loading states
  if (isLoading || !directors.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auteur-bg">
        <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  const calculateAvgRating = (director: DirectorDetails) => {
    const validMovies = director.directed_movies.filter(movie => movie.vote_average > 0);
    if (validMovies.length === 0) return 0;
    return validMovies.reduce((acc, movie) => acc + movie.vote_average, 0) / validMovies.length;
  };

  const getCareerSpan = (director: DirectorDetails) => {
    if (!director.directed_movies.length) return null;
    const dates = director.directed_movies
      .map(movie => new Date(movie.release_date).getFullYear())
      .filter(year => !isNaN(year));
    if (!dates.length) return null;
    return `${Math.min(...dates)} - ${Math.max(...dates)}`;
  };

  const getTopGenres = (director: DirectorDetails) => {
    const genreCounts: { [key: string]: number } = {};
    director.directed_movies.forEach(movie => {
      movie.genres.forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
    });
    
    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre, count]) => ({
        name: genre,
        percentage: (count / director.directed_movies.length) * 100
      }));
  };

  if (loading || !directors.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auteur-bg">
        <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  const activeDirector = directors[activeIndex];

  return (
    <div className="min-h-screen bg-auteur-bg">
      <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="grid lg:grid-cols-12 gap-4 lg:gap-8">
          {/* Director Selection Panel */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-xl font-bold text-auteur-primary mb-6">Popular Directors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              {directors.map((director, idx) => (
                <motion.button
                  key={director.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-4 rounded-xl transition-all ${
                    idx === activeIndex 
                      ? 'bg-auteur-accent text-white' 
                      : 'bg-auteur-bg-dark text-auteur-primary hover:bg-auteur-bg-card'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20 flex-shrink-0">
                      {director.profile_path ? (
                        <img
                          src={getImageUrl(director.profile_path)}
                          alt={director.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {director.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-left truncate">
                      <p className="font-medium truncate">{director.name}</p>
                      <p className="text-sm opacity-80">{director.directed_movies.length} films</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Director Details Panel */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDirector.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Hero Section */}
                <div className="relative h-auto min-h-[20rem] md:h-80 rounded-2xl overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${getImageUrl(activeDirector.profile_path)})`,
                      filter: 'blur(8px) brightness(0.5)'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80" />
                  <div className="relative h-full flex items-center p-4 md:p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 w-full">
                      <div className="w-32 h-44 md:w-48 md:h-64 rounded-xl overflow-hidden shadow-2xl flex-shrink-0">
                        {activeDirector.profile_path ? (
                          <img
                          src={getImageUrl(activeDirector.profile_path) || undefined}
                          alt={activeDirector.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-auteur-bg-dark flex items-center justify-center">
                            <span className="text-4xl">{activeDirector.name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center md:text-left">
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">{activeDirector.name}</h1>
                        <div className="flex flex-col md:flex-row gap-2 md:gap-4 text-white/80 text-sm md:text-base">
                          {activeDirector.birthday && (
                            <span>Born: {new Date(activeDirector.birthday).toLocaleDateString()}</span>
                          )}
                          {activeDirector.place_of_birth && (
                            <>
                              <span className="hidden md:inline">•</span>
                              <span>{activeDirector.place_of_birth}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-6 flex justify-center md:justify-start">
                          <div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/director/${activeDirector.id}`)}
                              className="px-6 py-2 bg-auteur-accent text-white rounded-lg"
                            >
                              View Full Profile
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-auteur-bg-dark p-4 md:p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Film className="text-auteur-accent" />
                      <h3 className="font-medium">Total Films</h3>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-auteur-primary">
                      {activeDirector.directed_movies.length}
                    </p>
                  </div>


                  <div className="bg-auteur-bg-dark p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="text-yellow-500" />
                      <h3 className="font-medium">Average Rating</h3>
                    </div>
                    <p className="text-3xl font-bold text-auteur-primary">
                      {calculateAvgRating(activeDirector).toFixed(1)}
                    </p>
                  </div>

                  <div className="bg-auteur-bg-dark p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="text-green-500" />
                      <h3 className="font-medium">Career Span</h3>
                    </div>
                    <p className="text-lg font-bold text-auteur-primary">
                      {getCareerSpan(activeDirector)}
                    </p>
                  </div>

                  <div className="bg-auteur-bg-dark p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="text-purple-500" />
                      <h3 className="font-medium">Top Genres</h3>
                    </div>
                    <div className="space-y-2">
                      {getTopGenres(activeDirector).map(genre => (
                        <div key={genre.name} className="text-sm">
                          <span className="text-auteur-primary">{genre.name}</span>
                          <span className="text-auteur-neutral ml-2">
                            {genre.percentage.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                 {/* Filmography Grid */}
                 <div>
                  <h2 className="text-xl font-bold text-auteur-primary mb-6">Notable Films</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {activeDirector.directed_movies
                      .filter(movie => movie.vote_average > 0)
                      .slice(0, 8)
                      .map(movie => (
                        <motion.div
                          key={movie.id}
                          whileHover={{ scale: 1.05 }}
                          className="bg-auteur-bg-dark rounded-xl overflow-hidden"
                        >
                          <div className="aspect-[2/3] relative">
                            {movie.poster_path ? (
                              <img
                                src={getImageUrl(movie.poster_path)}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-auteur-neutral flex items-center justify-center">
                                <Film className="w-12 h-12 text-auteur-primary" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                            <div className="absolute bottom-0 p-4">
                              <h3 className="text-white font-medium truncate">{movie.title}</h3>
                              <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                                <span>{new Date(movie.release_date).getFullYear()}</span>
                                <span>•</span>
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="ml-1">{movie.vote_average.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>

                {/* Biography Section */}
                {activeDirector.biography && (
                  <div className="bg-auteur-bg-dark p-4 md:p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-auteur-primary mb-4">Biography</h2>
                    <p className="text-auteur-primary-light leading-relaxed">
                      {activeDirector.biography}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;