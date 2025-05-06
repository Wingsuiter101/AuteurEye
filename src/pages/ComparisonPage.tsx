import { useState, useEffect } from 'react';
import { Film, Award, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTMDB } from '../hooks/useTMDB.ts';
import { Director, DirectorDetails } from '../types/tmdb.ts';
import DirectorSearch from './DirectorSearch';

interface Genre {
  name: string;
  percentage: number;
}

const ComparisonPage = () => {
  const { searchDirectors, getDirectorDetails, getImageUrl } = useTMDB();
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [searchResults1, setSearchResults1] = useState<Director[]>([]);
  const [searchResults2, setSearchResults2] = useState<Director[]>([]);
  const [selectedDirectors, setSelectedDirectors] = useState<[DirectorDetails | null, DirectorDetails | null]>([null, null]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDirectorSelect = async (director: Director, index: number) => {
    setIsLoading(true);
    try {
      const details = await getDirectorDetails(director.id);
      const newSelectedDirectors = [...selectedDirectors] as [DirectorDetails | null, DirectorDetails | null];
      newSelectedDirectors[index] = details;
      setSelectedDirectors(newSelectedDirectors);
      
      if (index === 0) {
        setSearchResults1([]);
        setSearchQuery1('');
      } else {
        setSearchResults2([]);
        setSearchQuery2('');
      }

      if (newSelectedDirectors[0] && newSelectedDirectors[1]) {
        generateComparisonData(newSelectedDirectors[0], newSelectedDirectors[1]);
      }
    } catch (error) {
      console.error('Error fetching director details:', error);
    }
    setIsLoading(false);
  };

  const handleDirectorDeselect = (index: number) => {
    const newSelectedDirectors = [...selectedDirectors] as [DirectorDetails | null, DirectorDetails | null];
    newSelectedDirectors[index] = null;
    setSelectedDirectors(newSelectedDirectors);
    setComparisonData(null); // Add this line
    if (index === 0) {
      setSearchQuery1('');
    } else {
      setSearchQuery2('');
    }
  };

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (searchQuery1.length > 2) {
        const results = await searchDirectors(searchQuery1);
        setSearchResults1(results);
      } else {
        setSearchResults1([]);
      }
    }, 300);
    return () => clearTimeout(searchDebounce);
  }, [searchQuery1]);

  useEffect(() => {
    const searchDebounce = setTimeout(async () => {
      if (searchQuery2.length > 2) {
        const results = await searchDirectors(searchQuery2);
        setSearchResults2(results);
      } else {
        setSearchResults2([]);
      }
    }, 300);
    return () => clearTimeout(searchDebounce);
  }, [searchQuery2]);

  const generateComparisonData = (director1: DirectorDetails, director2: DirectorDetails) => {
    // Calculate average rating excluding unrated films
    const getRecentAvgRating = (movies: any[]) => {
      // Filter out movies with 0 or undefined ratings
      const ratedMovies = movies.filter(movie => movie.vote_average > 0);
      
      // Take up to 10 rated movies
      const recentRatedMovies = ratedMovies;
      
      // If no rated movies, return 0
      if (recentRatedMovies.length === 0) return 0;
      
      return recentRatedMovies.reduce((acc, movie) => 
        acc + movie.vote_average, 0) / recentRatedMovies.length;
    };
  
    const avgRating1 = getRecentAvgRating(director1.directed_movies);
    const avgRating2 = getRecentAvgRating(director2.directed_movies);
  
    // Rest of your existing code...
    const yearsActive1 = calculateYearsActive(director1);
    const yearsActive2 = calculateYearsActive(director2);
    const genreCount1 = calculateGenreFrequency(director1.directed_movies);
    const genreCount2 = calculateGenreFrequency(director2.directed_movies);
    const topGenres1 = getTopGenres(genreCount1);
    const topGenres2 = getTopGenres(genreCount2);
  
    setComparisonData({
      ratings: { [director1.name]: avgRating1, [director2.name]: avgRating2 },
      moviesCount: { [director1.name]: director1.directed_movies.length, [director2.name]: director2.directed_movies.length },
      favoriteGenres: { [director1.name]: topGenres1, [director2.name]: topGenres2 },
      yearsActive: { [director1.name]: yearsActive1, [director2.name]: yearsActive2 }
    });
  };

  const calculateGenreFrequency = (movies: any[]) => {
    const genreCount: { [key: string]: number } = {};
    movies.forEach(movie => {
      movie.genres.forEach((genre: { id: number; name: string }) => {
        genreCount[genre.name] = (genreCount[genre.name] || 0) + 1;
      });
    });
    return genreCount;
  };

  const getTopGenres = (genreCount: { [key: string]: number }) => {
    return Object.entries(genreCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([genre, count]) => ({ 
        name: genre, 
        percentage: (count / Object.values(genreCount).reduce((a, b) => a + b, 0)) * 100 
      }));
  };

  const calculateYearsActive = (director: DirectorDetails) => {
    const movies = director.directed_movies;
    if (!movies.length) return 0;
    const latestMovie = new Date(movies[0].release_date).getFullYear();
    const firstMovie = new Date(movies[movies.length - 1].release_date).getFullYear();
    return latestMovie - firstMovie + 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-auteur-bg to-auteur-bg-dark pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-auteur-primary mt-0 sm:mt-12"
        >
          Director Comparison
        </motion.h1>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <DirectorSearch
            index={0}
            searchQuery={searchQuery1}
            setSearchQuery={setSearchQuery1}
            searchResults={searchResults1}
            selectedDirector={selectedDirectors[0]}
            onDirectorSelect={(director) => handleDirectorSelect(director, 0)}
            onDeselect={() => handleDirectorDeselect(0)}
            getImageUrl={getImageUrl}
          />
          <DirectorSearch
            index={1}
            searchQuery={searchQuery2}
            setSearchQuery={setSearchQuery2}
            searchResults={searchResults2}
            selectedDirector={selectedDirectors[1]}
            onDirectorSelect={(director) => handleDirectorSelect(director, 1)}
            onDeselect={() => handleDirectorDeselect(1)}
            getImageUrl={getImageUrl}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center w-full py-12">
            <div className="w-10 h-10 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
          </div>
        ) : comparisonData && (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-8"
            >
              {/* Stats Comparison Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Director 1 Stats */}
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="backdrop-blur-md bg-auteur-bg-card/30 rounded-xl border border-auteur-neutral/10 p-6 space-y-6"
                  >
                    {/* Average Rating */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Award className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Average Rating</h3>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-auteur-primary font-medium">
                            {comparisonData.ratings[Object.keys(comparisonData.ratings)[0]].toFixed(1)}
                          </span>
                          <span className="text-auteur-neutral">out of 10</span>
                        </div>
                        <div className="w-full h-2 bg-auteur-neutral/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(comparisonData.ratings[Object.keys(comparisonData.ratings)[0]] / 10) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total Films */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Film className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Total Films</h3>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-auteur-primary font-medium">
                            {comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[0]]}
                          </span>
                          <span className="text-auteur-neutral">films</span>
                        </div>
                        <div className="w-full h-2 bg-auteur-neutral/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${(comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[0]] / 
                                Math.max(...(Object.values(comparisonData.moviesCount) as number[]))) * 100}%` 
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Favorite Genres */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Film className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Favorite Genres</h3>
                      </div>
                      <div className="space-y-4">
                        {comparisonData.favoriteGenres[Object.keys(comparisonData.favoriteGenres)[0]]
                          .map((genre: Genre, idx: number) => (
                            <div key={genre.name}>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-auteur-primary font-medium">{genre.name}</span>
                                <span className="text-auteur-neutral">{genre.percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-2 bg-auteur-neutral/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${genre.percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut", delay: idx * 0.2 }}
                                  className={`h-full rounded-full ${
                                    idx === 0 
                                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                      : idx === 1 
                                        ? 'bg-gradient-to-r from-green-400 to-green-300' 
                                        : 'bg-gradient-to-r from-green-300 to-green-200'
                                  }`}
                                />
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Years Active */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Years Active</h3>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-auteur-primary">
                          {comparisonData.yearsActive[Object.keys(comparisonData.yearsActive)[0]]}
                        </span>
                        <span className="text-auteur-neutral">years</span>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Director 2 Stats */}
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="backdrop-blur-md bg-auteur-bg-card/30 rounded-xl border border-auteur-neutral/10 p-6 space-y-6"
                  >
                    {/* Average Rating */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Award className="w-5 h-5 text-yellow-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Average Rating</h3>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-auteur-primary font-medium">
                            {comparisonData.ratings[Object.keys(comparisonData.ratings)[1]].toFixed(1)}
                          </span>
                          <span className="text-auteur-neutral">out of 10</span>
                        </div>
                        <div className="w-full h-2 bg-auteur-neutral/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(comparisonData.ratings[Object.keys(comparisonData.ratings)[1]] / 10) * 100}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Total Films */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Film className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Total Films</h3>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-auteur-primary font-medium">
                            {comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[1]]}
                          </span>
                          <span className="text-auteur-neutral">films</span>
                        </div>
                        <div className="w-full h-2 bg-auteur-neutral/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ 
                              width: `${(comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[1]] / 
                                Math.max(...(Object.values(comparisonData.moviesCount) as number[]))) * 100}%` 
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Favorite Genres */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Film className="w-5 h-5 text-green-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Favorite Genres</h3>
                      </div>
                      <div className="space-y-4">
                        {comparisonData.favoriteGenres[Object.keys(comparisonData.favoriteGenres)[1]]
                          .map((genre: Genre, idx: number) => (
                            <div key={genre.name}>
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-auteur-primary font-medium">{genre.name}</span>
                                <span className="text-auteur-neutral">{genre.percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-2 bg-auteur-neutral/10 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${genre.percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut", delay: idx * 0.2 }}
                                  className={`h-full rounded-full ${
                                    idx === 0 
                                      ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                      : idx === 1 
                                        ? 'bg-gradient-to-r from-green-400 to-green-300' 
                                        : 'bg-gradient-to-r from-green-300 to-green-200'
                                  }`}
                                />
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>

                    {/* Years Active */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-base font-medium text-auteur-primary">Years Active</h3>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-auteur-primary">
                          {comparisonData.yearsActive[Object.keys(comparisonData.yearsActive)[1]]}
                        </span>
                        <span className="text-auteur-neutral">years</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Films Section */}
              <div className="grid md:grid-cols-2 gap-6">
                {selectedDirectors.map((director, index) => {
                  if (!director) return null;
                  const latestMovie = director.directed_movies[0];
                  
                  return (
                    <motion.div
                      key={director.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="backdrop-blur-md bg-auteur-bg-card/30 rounded-xl border border-auteur-neutral/10 p-6"
                    >
                      <h3 className="text-lg font-medium text-auteur-primary mb-6 flex items-center gap-3">
                        <Film className="w-5 h-5 text-auteur-accent" />
                        {director.name}'s Films
                      </h3>
                      
                      {/* Latest Movie with Poster */}
                      {latestMovie && (
                        <div className="mb-6">
                          <h4 className="text-sm text-auteur-neutral mb-4">Latest Film</h4>
                          <div className="group relative overflow-hidden rounded-lg">
                            <div className="flex gap-4">
                              {latestMovie.poster_path && (
                                <div className="w-32 h-48 flex-shrink-0 overflow-hidden rounded-lg">
                                  <img
                                    src={getImageUrl(latestMovie.poster_path)}
                                    alt={latestMovie.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="text-lg font-medium text-auteur-primary mb-2">
                                  {latestMovie.title}
                                </div>
                                <div className="text-sm text-auteur-neutral mb-2">
                                  {new Date(latestMovie.release_date).getFullYear()}
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <span className="text-auteur-primary font-medium">{latestMovie.vote_average.toFixed(1)}</span>
                                  <span className="text-auteur-neutral">({latestMovie.vote_count.toLocaleString()} votes)</span>
                                </div>
                                <p className="text-sm text-auteur-primary-light mt-3 line-clamp-3">
                                  {latestMovie.overview}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Other Movies Grid */}
                      <div>
                        <h4 className="text-sm text-auteur-neutral mb-4">Other Notable Films</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {director.directed_movies.slice(1, 7).map((movie, idx) => (
                            <motion.div
                              key={movie.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="backdrop-blur-sm bg-auteur-bg-dark/30 rounded-lg p-3 border border-auteur-neutral/10
                                       hover:border-auteur-accent/50 transition-colors group"
                            >
                              <div className="text-sm font-medium text-auteur-primary mb-1 group-hover:text-auteur-accent transition-colors">
                                {movie.title}
                              </div>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="text-auteur-neutral">
                                  {new Date(movie.release_date).getFullYear()}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-400" />
                                  <span className="text-auteur-primary">{movie.vote_average.toFixed(1)}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default ComparisonPage;