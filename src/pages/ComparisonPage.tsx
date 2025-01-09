import React, { useState, useEffect } from 'react';
import { Film, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTMDB } from '../hooks/useTMDB.ts';
import { Director, DirectorDetails } from '../types/tmdb.ts';
import DirectorSearch from './DirectorSearch';

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
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <h1 className="text-xl md:text-3xl font-bold text-center mb-6 text-auteur-primary">
        Compare Directors
      </h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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

      {comparisonData && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Stats for Director 1 */}
            <div className="space-y-4">
              {/* Average Rating */}
              <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Average Rating</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-auteur-primary">
                      {comparisonData.ratings[Object.keys(comparisonData.ratings)[0]].toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-auteur-neutral/20 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(comparisonData.ratings[Object.keys(comparisonData.ratings)[0]] / 10) * 100}%` }}
                      className="h-full bg-yellow-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Total Films */}
              <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Total Films</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-auteur-primary">
                      {comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[0]]}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-auteur-neutral/20 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[0]] / 
                        Math.max(...Object.values(comparisonData.moviesCount))) * 100}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

           {/* Favorite Genres (replacing Films per Year) */}
           <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Favorite Genres</h3>
                </div>
                <div className="space-y-3">
                  {comparisonData.favoriteGenres[Object.keys(comparisonData.favoriteGenres)[0]].map((genre, idx) => (
                    <div key={genre.name} className="mb-3">
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-auteur-primary">{genre.name}</span>
                        <span className="text-auteur-neutral">{genre.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-auteur-neutral/20 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${genre.percentage}%` }}
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-green-400' : 'bg-green-300'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Length */}
              <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Years Active</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-auteur-primary">
                      {comparisonData.yearsActive[Object.keys(comparisonData.yearsActive)[0]]} years
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats for Director 2 */}
            <div className="space-y-4">
              {/* Average Rating */}
              <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Average Rating</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-auteur-primary">
                      {comparisonData.ratings[Object.keys(comparisonData.ratings)[1]].toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-auteur-neutral/20 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(comparisonData.ratings[Object.keys(comparisonData.ratings)[1]] / 10) * 100}%` }}
                      className="h-full bg-yellow-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Total Films */}
              <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Total Films</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-auteur-primary">
                      {comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[1]]}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-auteur-neutral/20 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(comparisonData.moviesCount[Object.keys(comparisonData.moviesCount)[1]] / 
                        Math.max(...Object.values(comparisonData.moviesCount))) * 100}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

               {/* Favorite Genres (replacing Films per Year) */}
               <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Favorite Genres</h3>
                </div>
                <div className="space-y-3">
                  {comparisonData.favoriteGenres[Object.keys(comparisonData.favoriteGenres)[1]].map((genre, idx) => (
                    <div key={genre.name} className="mb-3">
                      <div className="flex justify-between text-xs md:text-sm mb-1">
                        <span className="text-auteur-primary">{genre.name}</span>
                        <span className="text-auteur-neutral">{genre.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-auteur-neutral/20 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${genre.percentage}%` }}
                          className={`h-full rounded-full ${
                            idx === 0 ? 'bg-green-500' : idx === 1 ? 'bg-green-400' : 'bg-green-300'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Career Length */}
              <div className="bg-auteur-bg-dark rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary">Years Active</h3>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-auteur-primary">
                      {comparisonData.yearsActive[Object.keys(comparisonData.yearsActive)[1]]} years
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {selectedDirectors.map((director, index) => {
              if (!director) return null;
              const latestMovie = director.directed_movies[0]; // Movies are already sorted by date
              
              return (
                <motion.div
                  key={director.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-auteur-bg-dark rounded-lg p-4"
                >
                  <h3 className="text-sm md:text-base font-medium text-auteur-primary mb-3">{director.name}'s Films</h3>
                  
                  {/* Latest Movie with Poster */}
                  {latestMovie && (
                    <div className="mb-4">
                      <h4 className="text-sm text-auteur-neutral mb-2">Latest Film:</h4>
                      <div className="flex gap-4">
                        {latestMovie.poster_path && (
                          <div className="w-24 h-36 flex-shrink-0">
                            <img
                              src={getImageUrl(latestMovie.poster_path)}
                              alt={latestMovie.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-auteur-primary">
                            {latestMovie.title} ({new Date(latestMovie.release_date).getFullYear()})
                          </div>
                          <div className="text-xs text-auteur-neutral mt-1">
                            Rating: {latestMovie.vote_average.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other Movies Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {director.directed_movies.slice(1, 7).map((movie) => (
                      <div
                        key={movie.id}
                        className="bg-auteur-bg-card rounded p-2 text-xs md:text-sm text-auteur-primary"
                      >
                        {movie.title} ({new Date(movie.release_date).getFullYear()})
                        <div className="text-auteur-neutral text-xs">Rating: {movie.vote_average.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ComparisonPage;