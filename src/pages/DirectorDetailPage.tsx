import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { DirectorDetails } from '../types/tmdb';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Film, Star, Clock, Globe } from 'lucide-react';

const DirectorDetailPage = () => {
  const { id } = useParams();
  const { loading, error, getDirectorDetails, getImageUrl } = useTMDB();
  const [director, setDirector] = useState<DirectorDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'films'>('overview');

  useEffect(() => {
    const fetchDirector = async () => {
      if (id) {
        try {
          const data = await getDirectorDetails(parseInt(id));
          setDirector(data);
        } catch (err) {
          console.error('Error fetching director:', err);
        }
      }
    };
    fetchDirector();
  }, [id, getDirectorDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auteur-bg">
        <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !director) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auteur-bg">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-auteur-primary mb-4">
            {error || 'Director not found'}
          </h2>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const avgRating = director.directed_movies.reduce((acc, movie) => acc + movie.vote_average, 0) / director.directed_movies.length;
  const totalVotes = director.directed_movies.reduce((acc, movie) => acc + movie.vote_count, 0);
  const languages = [...new Set(director.directed_movies.map(movie => movie.original_language))];
  const genres = [...new Set(director.directed_movies.flatMap(movie => movie.genres.map(g => g.name)))];

  return (
    <main className="min-h-screen bg-auteur-bg -mt-20">
      {/* Enhanced Hero Section */}
      <div className="relative h-screen md:h-[70vh] overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getImageUrl(director.profile_path)})`,
            filter: 'blur(8px) brightness(0.3)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-auteur-bg via-auteur-bg/80" />
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className="w-64 h-96 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 mx-auto md:mx-0">
              <img
                src={getImageUrl(director.profile_path)}
                alt={director.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-display font-bold text-white mb-6"
              >
                {director.name}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-6 text-auteur-primary-light mb-8"
              >
                {director.birthday && (
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{new Date(director.birthday).toLocaleDateString()}</span>
                  </div>
                )}
                {director.place_of_birth && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>{director.place_of_birth}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Film size={18} />
                  <span>{director.directed_movies.length} Films</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={18} />
                  <span>{avgRating.toFixed(1)} Average Rating</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-auteur-bg-card p-8 rounded-xl">
            <h3 className="text-blue-400 text-sm font-medium mb-3">Total Films</h3>
            <p className="text-4xl font-bold text-blue-400">{director.directed_movies.length}</p>
          </div>
          <div className="bg-auteur-bg-card p-8 rounded-xl">
            <h3 className="text-yellow-400 text-sm font-medium mb-3">Average Rating</h3>
            <p className="text-4xl font-bold text-yellow-400">{avgRating.toFixed(1)}</p>
          </div>
          <div className="bg-auteur-bg-card p-8 rounded-xl">
            <h3 className="text-green-400 text-sm font-medium mb-3">Total Votes</h3>
            <p className="text-4xl font-bold text-green-400">{totalVotes.toLocaleString()}</p>
          </div>
          <div className="bg-auteur-bg-card p-8 rounded-xl">
            <h3 className="text-purple-400 text-sm font-medium mb-3">Languages</h3>
            <p className="text-4xl font-bold text-purple-400">{languages.length}</p>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex mb-8 border-b border-auteur-neutral/20">
          {(['overview', 'films'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-medium transition-colors capitalize
                ${activeTab === tab 
                  ? 'text-auteur-accent border-b-2 border-auteur-accent' 
                  : 'text-auteur-neutral hover:text-auteur-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="pb-16"
          >
            {activeTab === 'overview' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-white mb-6">Biography</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-auteur-primary-light whitespace-pre-line">
                      {director.biography}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Known For</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-auteur-primary-light mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {genres.map(genre => (
                          <span key={genre} className="px-3 py-1 bg-auteur-bg-dark rounded-full text-sm text-auteur-primary">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-auteur-primary-light mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {languages.map(lang => (
                          <span key={lang} className="px-3 py-1 bg-auteur-bg-dark rounded-full text-sm text-auteur-primary">
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {director.directed_movies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-auteur-bg-card rounded-xl overflow-hidden shadow-lg transition-shadow hover:shadow-xl"
                  >
                    <div className="aspect-[2/3] relative">
                      {movie.poster_path ? (
                        <img
                          src={getImageUrl(movie.poster_path)}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-auteur-bg-dark flex items-center justify-center">
                          <span className="text-auteur-neutral">No poster</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40" />
                      <div className="absolute bottom-0 p-6">
                        <h3 className="text-white font-bold text-xl mb-2">{movie.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-white/90">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(movie.release_date).getFullYear()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span>{movie.vote_average.toFixed(1)}</span>
                          </div>
                          {movie.runtime && (
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{movie.runtime}min</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Globe size={14} />
                            <span>{movie.original_language.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-auteur-primary-light text-sm line-clamp-3">
                        {movie.overview}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
};

export default DirectorDetailPage;