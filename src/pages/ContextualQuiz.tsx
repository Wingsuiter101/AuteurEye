import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Star, Camera, BookOpen, PenTool, User } from 'lucide-react';
import { useTMDB } from '../hooks/useTMDB';
import { MovieRecommendationService, DirectorPreferenceProfile, MovieScore } from '../services/movieRecommendation';
import { QuizService, QuizOption } from '../services/quizService'; 
import type { Movie } from '../types/tmdb'; 

const movieRecommendationService = new MovieRecommendationService();
const quizService = new QuizService();

const ContextualQuiz = () => {
  const { getImageUrl, getTopRatedMovies, getMovieCredits } = useTMDB(); 
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizOption[]>([]); 
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<MovieScore[]>([]);
  const [preferences, setPreferences] = useState<DirectorPreferenceProfile>(
    movieRecommendationService.initializePreferenceProfile() 
  );
  const [error, setError] = useState<string | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [expandedMovie, setExpandedMovie] = useState<MovieScore | null>(null);
  const [movieCredits, setMovieCredits] = useState<any>(null);

  useEffect(() => {
    const loadQuestions = () => {
      try {
        setLoading(true);
        const generatedQuestions = quizService.generateQuestions();
        if (generatedQuestions.length === 0) {
          setError('Could not generate quiz questions. Please try again later.');
        } else {
          setQuestions(generatedQuestions);
        }
      } catch (error) {
        setError('Failed to generate quiz questions. Please try again.');
        console.error('Error generating questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswer = async (answer: QuizOption) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    const currentPrefs = preferences ?? movieRecommendationService.initializePreferenceProfile();
    const newPreferences = movieRecommendationService.updatePreferences(
      currentPrefs,
      answer
    );
    setPreferences(newPreferences);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question answered
      setQuizComplete(true); 
      console.log('[handleAnswer] Final User Preferences:', JSON.stringify(newPreferences, null, 2)); // Log final preferences
      setLoading(true);
      setError(null);
      try {
        // Fetch movies and add randomization
        const moviePool: Movie[] = await getTopRatedMovies();
        console.log('Fetched Movie Pool (Top 5):', moviePool.slice(0, 5)); // Log fetched movies
        console.log('Final User Preferences:', newPreferences); // Log final preferences
        
        // Shuffle the movie pool to ensure variety
        const shuffledMoviePool = [...moviePool].sort(() => Math.random() - 0.5);
        console.log('Shuffled the movie pool for variety')

        if (!moviePool || moviePool.length === 0) {
          setError("Could not fetch movies to generate recommendations.");
          setRecommendations([]);
        } else {
          const movieMatches = movieRecommendationService.findMatchingMovies(
            newPreferences,
            shuffledMoviePool // Use the shuffled movie pool for more variety
          );
          setRecommendations(movieMatches);
          if (movieMatches.length === 0) {
            console.log("No matching movies found based on preferences.");
          }
        }
      } catch (error) {
        setError('Failed to generate recommendations. Please try again.');
        console.error('Error generating recommendations:', error);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleMovieClick = async (movieScore: MovieScore) => {
    if (expandedMovie?.movie.id === movieScore.movie.id) {
      setExpandedMovie(null);
      setMovieCredits(null);
    } else {
      setExpandedMovie(movieScore);
      try {
        const credits = await getMovieCredits(movieScore.movie.id);
        setMovieCredits(credits);
      } catch (error) {
        console.error('Error fetching movie credits:', error);
      }
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'visual_style':
        return <Camera className="w-6 h-6 text-auteur-accent" />;
      case 'narrative_style':
        return <BookOpen className="w-6 h-6 text-auteur-accent" />;
      case 'thematic':
        return <PenTool className="w-6 h-6 text-auteur-accent" />;
      default:
        return <Film className="w-6 h-6 text-auteur-accent" />;
    }
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    if (!question) return null;

    return (
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center w-full max-w-3xl mx-auto"
      >
        {/* Stack vertically on xs, row on sm+, center text xs, left align sm+ */}
        <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-3">
          {getQuestionIcon(question.type)}
          <h2 className="text-2xl font-medium text-auteur-primary">
            {question.text}
          </h2>
        </div>

        {/* Increased gap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          {question.options.map((option: QuizOption) => (
            <motion.button
              key={option.id}
              onClick={() => handleAnswer(option)}
              // Increased vertical padding
              className="block w-full text-left px-6 py-5 rounded-lg border border-auteur-neutral/30 bg-auteur-bg-dark text-auteur-primary transition duration-200 ease-in-out hover:bg-auteur-primary/10 hover:border-auteur-primary/30 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-auteur-accent focus:ring-offset-2 focus:ring-offset-auteur-bg"
            >
              {option.text}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderRecommendations = () => {
    if (recommendations.length === 0 && !loading && quizComplete) {
      return (
        <motion.div
          key="no-recs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-auteur-neutral"
        >
          <p className='mb-4'>No recommendations found based on your preferences.</p>
          <p className='mb-6'>Try adjusting your answers or take the quiz again!</p>
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setAnswers([]);
              setPreferences(movieRecommendationService.initializePreferenceProfile());
              setRecommendations([]);
              setError(null);
              setQuizComplete(false);
            }}
            className="px-6 py-2 bg-auteur-accent text-white rounded-lg hover:bg-opacity-80 transition duration-200 focus:outline-none focus:ring-2 focus:ring-auteur-accent focus:ring-offset-2 focus:ring-offset-auteur-bg"
          >
            Take Quiz Again
          </button>
        </motion.div>
      );
    }

    if (recommendations.length === 0 && loading && quizComplete) {
      return (
        <motion.div key="loading-recs" className="flex flex-col items-center justify-center space-y-4 py-16">
          <div className="w-12 h-12 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
          <p className="text-auteur-primary">Generating recommendations...</p>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="recs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-semibold text-center text-auteur-primary mt-0 md:mt-12">
          Recommendations For You
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {recommendations.map((movieScore) => (
            <motion.div
              key={movieScore.movie.id}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => handleMovieClick(movieScore)}
              className={`bg-auteur-bg-dark rounded-xl overflow-hidden shadow-lg border border-auteur-neutral/10 
                hover:border-auteur-primary/30 hover:bg-auteur-primary/5 transition duration-200 ease-in-out cursor-pointer
                ${expandedMovie?.movie.id === movieScore.movie.id ? 'col-span-2 sm:col-span-3 lg:col-span-3 xl:col-span-4 row-span-2' : ''}`}
            >
              <div className={`${expandedMovie?.movie.id === movieScore.movie.id ? 'flex flex-col md:flex-row gap-6' : ''}`}>
                <div className={`${expandedMovie?.movie.id === movieScore.movie.id ? 'md:w-1/3' : ''}`}>
                  {movieScore.movie.poster_path ? (
                    <img
                      src={getImageUrl(movieScore.movie.poster_path) || undefined}
                      alt={movieScore.movie.title}
                      className={`w-full ${expandedMovie?.movie.id === movieScore.movie.id ? 'h-full rounded-xl shadow-lg' : 'aspect-[2/3]'} object-cover`}
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-auteur-secondary flex items-center justify-center">
                      <Film className="w-12 h-12 text-auteur-primary opacity-50" />
                    </div>
                  )}
                </div>
                <div className={`p-3 sm:p-4 ${expandedMovie?.movie.id === movieScore.movie.id ? 'md:w-2/3 md:p-6' : ''}`}>
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <h3 className="font-bold text-auteur-primary text-base sm:text-lg line-clamp-2">
                      {movieScore.movie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-auteur-neutral">
                      <span>{new Date(movieScore.movie.release_date).getFullYear()}</span>
                      <span>•</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className="ml-1">{movieScore.movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs font-semibold inline-block py-1 px-2 sm:px-3 uppercase rounded-full text-auteur-accent bg-auteur-accent bg-opacity-20">
                        Match: {movieScore.score.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {expandedMovie?.movie.id === movieScore.movie.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4 sm:mt-6 space-y-4 sm:space-y-6"
                    >
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-auteur-primary">Overview</h4>
                        <p className="text-sm text-auteur-primary-light leading-relaxed">
                          {movieScore.movie.overview}
                        </p>
                      </div>

                      {movieCredits && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-auteur-primary">Director</h4>
                          <div className="flex items-center gap-4 p-4 bg-auteur-bg-card/30 rounded-xl border border-auteur-neutral/10">
                            {movieCredits.crew.find((person: any) => person.job === 'Director')?.profile_path ? (
                              <img
                                src={getImageUrl(movieCredits.crew.find((person: any) => person.job === 'Director')?.profile_path)}
                                alt={movieCredits.crew.find((person: any) => person.job === 'Director')?.name}
                                className="w-16 h-16 rounded-full object-cover shadow-md"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-auteur-bg-dark flex items-center justify-center">
                                <User className="w-8 h-8 text-auteur-primary opacity-50" />
                              </div>
                            )}
                            <div>
                              <h5 className="text-base font-medium text-auteur-primary">
                                {movieCredits.crew.find((person: any) => person.job === 'Director')?.name}
                              </h5>
                              <p className="text-sm text-auteur-neutral">Director</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-auteur-primary">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {movieScore.movie.genres?.map((genre: any) => (
                            <span
                              key={genre.id}
                              className="text-xs px-3 py-1.5 rounded-full bg-auteur-bg-card/30 text-auteur-primary-light border border-auteur-neutral/10"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setAnswers([]);
              setPreferences(movieRecommendationService.initializePreferenceProfile());
              setRecommendations([]);
              setError(null);
              setQuizComplete(false);
              setExpandedMovie(null);
              setMovieCredits(null);
            }}
            className="px-6 py-2 bg-auteur-accent text-white rounded-lg hover:bg-opacity-80 transition duration-200 focus:outline-none focus:ring-2 focus:ring-auteur-accent focus:ring-offset-2 focus:ring-offset-auteur-bg"
          >
            Take Quiz Again
          </button>
        </div>
      </motion.div>
    );
  };

  if (error && recommendations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-auteur-primary mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-auteur-accent text-white rounded-lg hover:bg-opacity-80 transition duration-200 focus:outline-none focus:ring-2 focus:ring-auteur-accent focus:ring-offset-2 focus:ring-offset-auteur-bg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 min-h-screen pb-32 sm:pb-20">
      {!quizComplete && (
        <div className="text-center mb-12 mt-0 sm:mt-12 md:mt-16">
          <h1 className="text-3xl font-bold text-auteur-primary mb-2">
            Discover Your Film Style
          </h1>
          <p className="text-auteur-primary-light">
            Answer a few questions about your preferences to find films tailored to your taste.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading && !quizComplete && questions.length === 0 ? ( // Only show initial loading if questions array is empty
          <motion.div key="loading-quiz" className="flex flex-col items-center justify-center space-y-4 py-16">
            <div className="w-12 h-12 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
            <p className="text-auteur-primary">Loading quiz...</p>
          </motion.div>
        ) : !quizComplete ? ( 
          renderQuestion()
        ) : (
          renderRecommendations()
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContextualQuiz;