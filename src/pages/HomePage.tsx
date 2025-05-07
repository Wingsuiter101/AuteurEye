import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTMDB } from '../hooks/useTMDB';
import { DirectorDetails } from '../types/tmdb';
import { Film } from 'lucide-react';
import { Star, Clock, TrendingUp, ChevronRight, ChevronDown, Brain } from 'lucide-react';
import favicon from '../assets/favicon.svg';
import homeHeroBg from '../assets/home-hero-bg.png';
import LoadingCamera from '../components/LoadingCamera';

const CACHE_KEY = 'auteureye_directors_cache';
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const HomePage = () => {
  const { getDirectorDetails, getImageUrl, getEstablishedDirectors } = useTMDB();
  const [directors, setDirectors] = useState<DirectorDetails[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDirectors = async () => {
      setIsLoading(true);
      try {
        // Check cache first
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const isCacheValid = Date.now() - timestamp < CACHE_DURATION;
          
          if (isCacheValid && isMounted) {
            setDirectors(data);
            setIsLoading(false);
            return;
          }
        }

        // If no cache or cache expired, fetch new data
        if (!isMounted) return;
        
        const directors = await getEstablishedDirectors();
        
        if (!isMounted) return;
        
        const selectedDirectors = directors
          .sort(() => Math.random() - 0.5)
          .slice(0, 6);
        
        const detailedDirectors = await Promise.all(
          selectedDirectors.map(async (director, index) => {
            await new Promise(resolve => setTimeout(resolve, index * 100));
            return getDirectorDetails(director.id);
          })
        );
        
        if (isMounted) {
          setDirectors(detailedDirectors);
          // Cache the new data
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: detailedDirectors,
            timestamp: Date.now()
          }));
        }
      } catch (err) {
        console.error('Error fetching directors:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
  
    fetchDirectors();
    
    return () => {
      isMounted = false;
    };
  }, [getDirectorDetails, getEstablishedDirectors]);

  // Memoize the active director to prevent unnecessary re-renders
  const activeDirector = useMemo(() => {
    return activeIndex !== null ? directors[activeIndex] : null;
  }, [activeIndex, directors]);

  // Memoize the calculated values
  const calculateAvgRating = useMemo(() => (director: DirectorDetails) => {
    const validMovies = director.directed_movies.filter(movie => movie.vote_average >= 2);
    if (validMovies.length === 0) return 0;
    return validMovies.reduce((acc, movie) => acc + movie.vote_average, 0) / validMovies.length;
  }, []);

  const getCareerSpan = useMemo(() => (director: DirectorDetails) => {
    if (!director.directed_movies.length) return null;
    const dates = director.directed_movies
      .map(movie => new Date(movie.release_date).getFullYear())
      .filter(year => !isNaN(year));
    if (!dates.length) return null;
    return `${Math.min(...dates)} - ${Math.max(...dates)}`;
  }, []);

  const getTopGenres = useMemo(() => (director: DirectorDetails, count: number = 5) => {
    const genreCounts: { [key: string]: number } = {};
    let totalMovies = 0;

    director.directed_movies.forEach(movie => {
      if (movie.genres && movie.genres.length > 0) {
        totalMovies++;
        movie.genres.forEach(genre => {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });
      }
    });

    if (totalMovies === 0) return [];

    return Object.entries(genreCounts)
      .map(([name, occurrences]) => ({
        name,
        percentage: (occurrences / totalMovies) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, count);
  }, []);

  if (isLoading || !directors.length) {
    return <LoadingCamera />;
  }

  return (
    <div className="min-h-screen pb-20 lg:py-16 bg-gradient-to-b from-auteur-bg to-auteur-bg-dark">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Enhanced Hero Section with Background */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative rounded-2xl overflow-hidden mb-12 md:mb-20 shadow-2xl"
          style={{ backgroundImage: `url(${homeHeroBg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
        >
          <div className="relative z-20 py-12 md:py-20 px-6 md:px-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-block mb-6 p-2 rounded-full"
            >
              <span className="relative inline-block group">
                <img 
                  src={favicon} 
                  alt="Filmstrip Icon" 
                  className="w-16 h-16 transition-transform duration-300 ease-in-out hover:scale-125 hover:rotate-12 cursor-pointer group-hover:drop-shadow-[0_0_16px_rgba(99,102,241,0.7)]"
                />
                <span className="pointer-events-none absolute inset-0 rounded-full overflow-hidden">
                  <span className="absolute left-[-75%] top-0 w-1/2 h-full bg-gradient-to-r from-white/60 to-transparent opacity-0 group-hover:opacity-80 group-hover:animate-shine" />
                </span>
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-tight"
            >
              Discover Cinematic <span className="text-auteur-accent">Masters</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-auteur-primary-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              Explore the world's most influential directors and their masterpieces
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Link to="/quiz" className="inline-flex items-center gap-2 bg-auteur-accent hover:bg-auteur-accent-dark text-white font-medium px-6 py-3 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                <Brain className="w-5 h-5" />
                Take the Quiz
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile Accordion View - Enhanced */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 lg:hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-auteur-primary flex items-center gap-2">
              <Star className="w-5 h-5 text-auteur-accent" />
              Featured Directors
            </h2>
            <Link to="/compare" className="text-sm text-auteur-accent hover:text-auteur-accent-light flex items-center gap-1 z-10">
              <span>Compare Directors</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {directors.map((director, idx) => (
            <React.Fragment key={director.id}>
              {/* Button Card Container - Enhanced with better visual styling */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`backdrop-blur-lg rounded-xl border overflow-hidden shadow-lg ${idx === activeIndex 
                  ? 'border-auteur-accent/30 shadow-auteur-accent/10' 
                  : 'border-white/10 shadow-black/10'}`}
              >
                <button
                  onClick={() => setActiveIndex(idx === activeIndex ? null : idx)}
                  className={`w-full p-5 transition-all duration-300 ${
                    idx === activeIndex 
                      ? 'bg-gradient-to-br from-auteur-accent/20 to-auteur-accent-dark/40 text-white' 
                      : 'bg-black/10 text-auteur-primary hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="w-14 h-14 rounded-full overflow-hidden bg-auteur-neutral/20 flex-shrink-0 ring-1 ring-white/10"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      {director.profile_path ? (
                        <img
                          src={getImageUrl(director.profile_path)}
                          alt={director.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-medium">
                          {director.name[0]}
                        </div>
                      )}
                    </motion.div>
                    {/* Container for name and film count - Ensure left alignment */}
                    <div className="flex-1 min-w-0 ml-4 text-left"> 
                      {/* Restore font size */} 
                      <span className="text-auteur-primary font-medium block text-base"> 
                        {director.name}
                      </span>
                      <span className="text-xs text-auteur-primary-light opacity-70 block">
                        {director.directed_movies.length} films
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: idx === activeIndex ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6" />
                    </motion.div>
                  </div>
                </button>
              </motion.div>

              {/* Details Panel Container - Now a sibling element */}
              <AnimatePresence mode="wait">
                {idx === activeIndex && (
                  <motion.div
                    key={`${director.id}-details`} // Need a unique key for the details
                    layout="position" // Ensure layout prop is present
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      // Let layout handle size and position, just animate opacity
                      open: { opacity: 1 }, 
                      collapsed: { opacity: 0 }
                    }}
                    // Revert to easeOut transition
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    // Enhanced mobile details panel with better visuals
                    className="backdrop-blur-xl bg-gradient-to-br from-black/20 to-auteur-accent/5 rounded-xl border border-auteur-accent/20 p-6 overflow-hidden mt-4 shadow-lg"
                  >
                    {/* Enhanced mobile details panel */}
                    <div className="space-y-6"> {/* Increased spacing */}
                      {/* Biography with styled quote marks */}
                      <div className="relative">
                        <div className="absolute -top-1 -left-1 text-3xl text-auteur-accent/30">❝</div>
                        <p className="text-auteur-primary-light text-sm opacity-90 leading-relaxed pl-6 pr-2"> 
                          {director.biography ? `${director.biography.split('. ').slice(0, 3).join('. ')}.` : 'Biography not available.'}
                        </p>
                        <div className="absolute -bottom-4 -right-1 text-3xl text-auteur-accent/30">❞</div>
                      </div>
                      
                      {/* Stats row */}
                      <div className="flex justify-between pt-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-auteur-primary">{director.directed_movies.length}</div>
                          <div className="text-xs text-auteur-primary-light">Films</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-auteur-primary">{calculateAvgRating(director).toFixed(1)}</div>
                          <div className="text-xs text-auteur-primary-light">Avg Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-auteur-primary">{getCareerSpan(director) || 'N/A'}</div>
                          <div className="text-xs text-auteur-primary-light">Career</div>
                        </div>
                      </div>
                      
                      {/* Top Genres with enhanced styling */}
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-auteur-primary mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-auteur-accent rounded-full"></div>
                          Top Genres
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {getTopGenres(director, 3).map(genre => (
                            <span key={genre.name} className="text-xs font-medium bg-gradient-to-r from-auteur-accent/20 to-auteur-accent/30 text-auteur-accent-light px-3 py-1.5 rounded-full border border-auteur-accent/10 shadow-sm">
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      {/* Known For with enhanced movie cards */}
                      <div className="pt-2">
                        <h4 className="text-sm font-semibold text-auteur-primary mb-3 flex items-center gap-2">
                          <div className="w-1 h-4 bg-auteur-accent rounded-full"></div>
                          Known For
                        </h4>
                        <div className="space-y-3"> 
                          {director.directed_movies.slice(0, 2).map(movie => (
                             <div 
                              key={movie.id}
                              className="flex items-center gap-4 cursor-pointer group p-3 rounded-lg bg-black/10 hover:bg-auteur-accent/10 transition-all duration-200 border border-white/5 hover:border-auteur-accent/20"
                              onClick={() => navigate(`/movie/${movie.id}`)}
                            >
                              <div className="w-10 h-14 rounded-md bg-auteur-neutral/20 flex-shrink-0 border border-white/10 overflow-hidden shadow-md"> 
                                {movie.poster_path ? (
                                  <img src={getImageUrl(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover"/>
                                ) : <Film className="w-5 h-5 m-auto text-auteur-neutral/50"/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-auteur-primary group-hover:text-auteur-accent transition-colors truncate">
                                  {movie.title}
                                </div>
                                <div className="text-xs text-auteur-primary-light flex items-center gap-1 mt-1">
                                  <span>{new Date(movie.release_date).getFullYear()}</span>
                                  {movie.vote_average >= 2 && (
                                    <>
                                      <span className="mx-1">•</span>
                                      <Star className="w-3 h-3 text-auteur-accent" />
                                      <span>{movie.vote_average.toFixed(1)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-auteur-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Enhanced CTA button */}
                      <button 
                         onClick={() => navigate(`/director/${director.id}`)}
                         className="w-full mt-4 text-center text-sm py-3 bg-gradient-to-r from-auteur-accent to-auteur-accent-dark text-white rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                      >
                        <span>View Full Profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Desktop Side-by-Side View */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Director Selection Panel */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-xl font-bold text-auteur-primary mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-auteur-accent" />
              Featured Directors
            </h2>
            <div className="space-y-3"> 
              {directors.map((director, idx) => (
                <motion.button
                  key={director.id}
                  onClick={() => setActiveIndex(idx === activeIndex ? null : idx)}
                  className={`w-full p-4 rounded-xl transition-all duration-200 backdrop-blur-md border border-white/10 shadow-sm ${
                    idx === activeIndex 
                      ? 'bg-gradient-to-r from-auteur-accent/60 to-auteur-accent-dark/60 text-white ring-2 ring-auteur-accent/50 shadow-lg' 
                      : 'bg-black/10 text-auteur-primary hover:bg-white/10 hover:border-white/20'
                  }`}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20 flex-shrink-0 ring-1 ring-white/10"> 
                      {director.profile_path ? (
                        <img
                          src={getImageUrl(director.profile_path)}
                          alt={director.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-medium">
                          {director.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="text-left flex-grow min-w-0">
                      <p className="font-medium text-base block"> 
                        {director.name}
                      </p>
                      <p className="text-sm opacity-80">{director.directed_movies.length} films</p>
                    </div>
                    {idx === activeIndex && (
                      <ChevronRight className="w-5 h-5 text-white/80" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Director Details Panel */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeIndex !== null && activeDirector && (
                <motion.div
                  key={activeDirector.id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.98 }}
                  transition={{
                    duration: 0.5,
                    ease: "circOut"
                  }}
                  className="space-y-8 backdrop-blur-xl bg-black/15 rounded-2xl border border-white/10 p-6 shadow-xl"
                >
                  {/* Hero Section */}
                  <div className="relative h-auto min-h-[24rem] md:h-96 rounded-xl overflow-hidden shadow-lg"> 
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ 
                        backgroundImage: `url(${getImageUrl(activeDirector.profile_path)})`,
                        filter: 'blur(6px) brightness(0.4)' 
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" /> 
                    <div className="relative h-full flex items-center p-6 md:p-10">
                      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 w-full">
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          className="w-40 h-56 md:w-56 md:h-72 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 ring-4 ring-auteur-accent/20"
                        >
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
                        </motion.div>
                        <div className="text-center md:text-left flex-grow">
                          <motion.h1 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4"
                          >
                            {activeDirector.name}
                          </motion.h1>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-5" 
                          >
                            <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start"> 
                              <div className="flex items-center gap-2 text-auteur-accent whitespace-nowrap">
                                <Film className="w-5 h-5" />
                                <span className="text-white">{activeDirector.directed_movies.length} Films</span>
                              </div>
                              <div className="flex items-center gap-2 text-auteur-accent whitespace-nowrap">
                                <Star className="w-5 h-5" />
                                <span className="text-white">{calculateAvgRating(activeDirector).toFixed(1)} Avg Rating</span>
                              </div>
                              {getCareerSpan(activeDirector) && (
                                <div className="flex items-center gap-2 text-auteur-accent whitespace-nowrap">
                                  <Clock className="w-5 h-5" />
                                  <span className="text-white">{getCareerSpan(activeDirector)}</span>
                                </div>
                              )}
                            </div>
                            <p className="text-auteur-primary-light text-base leading-relaxed max-w-3xl opacity-90"> 
                              {activeDirector.biography ? `${activeDirector.biography.split('.').slice(0, 2).join('.')}.` : 'Biography not available.'} 
                            </p>
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="mt-6 flex justify-center md:justify-start"
                            >
                              <button
                                onClick={() => navigate(`/director/${activeDirector.id}`)}
                                className="px-6 py-3 bg-gradient-to-r from-auteur-accent to-auteur-accent-dark text-white rounded-xl 
                                         font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 
                                         backdrop-blur-md hover:ring-2 hover:ring-auteur-accent/50"
                              >
                                View Full Profile
                              </button>
                            </motion.div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats & Genres Container */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Top Genres */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.4 }}
                      className="backdrop-blur-lg bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 shadow-black/10"
                    >
                      <h3 className="text-lg font-semibold text-auteur-primary flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-auteur-accent" />
                        Signature Genres
                      </h3>
                      <div className="space-y-3">
                        {getTopGenres(activeDirector).map(genre => (
                          <div key={genre.name} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-auteur-primary-light opacity-90">{genre.name}</span>
                              <span className="text-auteur-accent font-medium">{genre.percentage.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"> 
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${genre.percentage}%` }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-auteur-accent to-auteur-accent-dark rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>

                    {/* Recent Films */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25, duration: 0.4 }}
                      className="backdrop-blur-lg bg-white/5 border border-white/10 p-5 rounded-xl space-y-4 shadow-black/10"
                    >
                      <h3 className="text-lg font-semibold text-auteur-primary flex items-center gap-2">
                        <Film className="w-5 h-5 text-auteur-accent" />
                        Recent Films
                      </h3>
                      <div className="space-y-3">
                        {activeDirector.directed_movies.slice(0, 3).map(movie => (
                          <div 
                            key={movie.id}
                            className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors duration-200"
                            onClick={() => navigate(`/movie/${movie.id}`)}
                          >
                            <div className="w-12 h-16 rounded-md overflow-hidden bg-auteur-neutral/20 flex-shrink-0 border border-white/10"> 
                              {movie.poster_path ? (
                                <img
                                  src={getImageUrl(movie.poster_path)}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-auteur-bg-dark">
                                  <Film className="w-6 h-6 text-auteur-accent/50" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-auteur-primary group-hover:text-auteur-accent transition-colors">
                                {movie.title}
                              </h4>
                              <p className="text-sm text-auteur-primary-light opacity-80">
                                {new Date(movie.release_date).getFullYear()}
                                {movie.vote_average > 0 && ` • ${movie.vote_average.toFixed(1)}`}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-auteur-accent/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;