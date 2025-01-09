import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Star, Camera, BookOpen, PenTool } from 'lucide-react';
import { useTMDB } from '../hooks/useTMDB';
import { MovieRecommendationService, DirectorPreferenceProfile, MovieScore } from '../services/movieRecommendation';
import { QuizService } from '../services/quizService';
import type { DirectorDetails } from '../types/tmdb';

const movieRecommendationService = new MovieRecommendationService();
const quizService = new QuizService();

const ContextualQuiz = () => {
  const { getEstablishedDirectors, getDirectorDetails, getImageUrl } = useTMDB();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<MovieScore[]>([]);
  const [preferences, setPreferences] = useState<DirectorPreferenceProfile | null>(null);
  const [directors, setDirectors] = useState<DirectorDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        // Get initial directors
        const initialDirectors = await getEstablishedDirectors();
        
        // Get full details for directors
        const detailedDirectors = await Promise.all(
          initialDirectors.slice(0, 30).map(async (d, index) => {
            await new Promise(resolve => setTimeout(resolve, index * 100)); // Rate limiting
            return getDirectorDetails(d.id);
          })
        );

        setDirectors(detailedDirectors);

        // Generate questions
        const generatedQuestions = quizService.generateQuestions(detailedDirectors);
        setQuestions(generatedQuestions);
        
      } catch (error) {
        setError('Failed to load director data. Please try again.');
        console.error('Error initializing quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [getEstablishedDirectors, getDirectorDetails]);

  const handleAnswer = (answer: any) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    // Update preferences based on answer
    const newPreferences = movieRecommendationService.updatePreferences(
      preferences,
      answer,
      questions[currentQuestion].type
    );
    setPreferences(newPreferences);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate movie recommendations
      setLoading(true);
      try {
        const movieMatches = movieRecommendationService.findMatchingMovies(
          directors,
          newPreferences
        );
        setRecommendations(movieMatches);
      } catch (error) {
        setError('Failed to generate recommendations. Please try again.');
        console.error('Error generating recommendations:', error);
      } finally {
        setLoading(false);
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
    if (!questions[currentQuestion]) return null;
    
    return (
      <motion.div
        key={currentQuestion}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {getQuestionIcon(questions[currentQuestion].type)}
            <h2 className="text-2xl font-bold text-auteur-primary">
              {questions[currentQuestion].text}
            </h2>
          </div>
          <div className="w-full h-2 bg-auteur-bg rounded-full">
            <motion.div
              className="h-full bg-auteur-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentQuestion].options.map((option: any, index: number) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswer(option)}
              className="p-4 bg-auteur-bg-dark rounded-xl text-left hover:bg-auteur-bg-card
                      transition-all duration-200"
            >
              <span className="text-auteur-primary">{option.text}</span>
              {option.director && (
                <div className="mt-2 text-sm text-auteur-neutral">
                  By {option.director.name}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderRecommendations = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
          <p className="text-auteur-primary">Finding your perfect movie matches...</p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-auteur-primary mb-4">
            Your Curated Film Recommendations
          </h2>
          <p className="text-auteur-neutral">
            Based on your directorial preferences, we think you'll appreciate these films:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((movieScore) => (
            <motion.div
              key={movieScore.movie.id}
              whileHover={{ y: -4 }}
              className="bg-auteur-bg-dark rounded-xl overflow-hidden shadow-lg"
            >
              {movieScore.movie.poster_path ? (
                <img
                src={getImageUrl(movieScore.movie.poster_path) || undefined}
                  alt={movieScore.movie.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-auteur-bg-card flex items-center justify-center">
                  <Film className="w-12 h-12 text-auteur-neutral" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-auteur-primary">
                  {movieScore.movie.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-auteur-neutral">
                  <span>{new Date(movieScore.movie.release_date).getFullYear()}</span>
                  <span>•</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="ml-1">{movieScore.movie.vote_average.toFixed(1)}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-auteur-primary mb-2">
                    Why you might like this:
                  </h4>
                  <ul className="space-y-1">
                    {movieScore.matchReasons.map((reason, index) => (
                      <li key={index} className="text-sm text-auteur-neutral flex items-start gap-2">
                        <div className="mt-1">
                          <div className="w-1.5 h-1.5 bg-auteur-accent rounded-full" />
                        </div>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => {
              setCurrentQuestion(0);
              setAnswers([]);
              setPreferences(null);
              setRecommendations([]);
            }}
            className="px-6 py-2 bg-auteur-accent text-white rounded-lg
                     hover:bg-auteur-accent-dark transition-colors"
          >
            Take Quiz Again
          </button>
        </div>
      </motion.div>
    );
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="text-auteur-primary mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-auteur-accent text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-auteur-primary mb-2">
          Discover Films Through Directors
        </h1>
        <p className="text-auteur-neutral">
          Share your cinematic preferences to find films that match your taste in directorial styles.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading && currentQuestion === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
            <p className="text-auteur-primary">Loading director data...</p>
          </div>
        ) : recommendations.length === 0 ? (
          renderQuestion()
        ) : (
          renderRecommendations()
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContextualQuiz;