import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { DirectorDetails } from '../types/tmdb';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Film, Star, Clock, Globe, ArrowLeft } from 'lucide-react';

const DirectorDetailPage = () => {
  const { id } = useParams();
  const { loading, error, getDirectorDetails, getImageUrl } = useTMDB();
  const navigate = useNavigate();
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
    <main className="min-h-screen bg-gradient-to-b from-auteur-bg to-auteur-bg-dark -mt-20">
      {/* Enhanced Hero Section */}
      <div className="relative h-screen md:h-[70vh] overflow-hidden pt-8 md:pt-20">
        {/* Back Button - direct child, debug background */}
        <button
          onClick={() => navigate(-1)}
          className="hidden sm:flex fixed top-4 left-4 sm:top-6 sm:left-6 z-50 items-center gap-2 text-white hover:text-auteur-accent transition-colors pointer-events-auto bg-white/10 backdrop-blur-md rounded-full px-4 py-2 shadow-lg hover:bg-black/40 border border-white/20"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getImageUrl(director.profile_path)})`,
            filter: 'blur(8px) brightness(0.3)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-auteur-bg via-auteur-bg/90 to-transparent" />
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-32 sm:pb-16">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 h-96 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 mx-auto md:mx-0 mt-8 md:mt-0 
                         ring-4 ring-auteur-accent/20 backdrop-blur-sm"
            >
              <img
                src={getImageUrl(director.profile_path)}
                alt={director.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex-1 text-center md:text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                {director.name}
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-wrap gap-6 text-auteur-primary-light mb-8 justify-center md:justify-start"
              >
                {director.birthday && (
                  <div className="flex items-center gap-2 bg-auteur-bg-dark/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <Calendar className="text-auteur-accent" size={18} />
                    <span>{new Date(director.birthday).toLocaleDateString()}</span>
                  </div>
                )}
                {director.place_of_birth && (
                  <div className="flex items-center gap-2 bg-auteur-bg-dark/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <MapPin className="text-auteur-accent" size={18} />
                    <span>{director.place_of_birth}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-auteur-bg-dark/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Film className="text-auteur-accent" size={18} />
                  <span>{director.directed_movies.length} Films</span>
                </div>
                <div className="flex items-center gap-2 bg-auteur-bg-dark/50 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Star className="text-auteur-accent" size={18} />
                  <span>{avgRating.toFixed(1)} Average Rating</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="backdrop-blur-md bg-auteur-bg-card/30 p-8 rounded-xl border border-auteur-neutral/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Film className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-blue-400 text-sm font-medium mb-1">Total Films</h3>
                <p className="text-3xl font-bold text-auteur-primary">{director.directed_movies.length}</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-md bg-auteur-bg-card/30 p-8 rounded-xl border border-auteur-neutral/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-yellow-400 text-sm font-medium mb-1">Average Rating</h3>
                <p className="text-3xl font-bold text-auteur-primary">{avgRating.toFixed(1)}</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-md bg-auteur-bg-card/30 p-8 rounded-xl border border-auteur-neutral/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Clock className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-green-400 text-sm font-medium mb-1">Total Votes</h3>
                <p className="text-3xl font-bold text-auteur-primary">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-md bg-auteur-bg-card/30 p-8 rounded-xl border border-auteur-neutral/10"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-purple-400 text-sm font-medium mb-1">Languages</h3>
                <p className="text-3xl font-bold text-auteur-primary">{languages.length}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4">
        <div className="flex mb-8 border-b border-auteur-neutral/10 backdrop-blur-sm bg-auteur-bg-dark/30 rounded-t-xl">
          {(['overview', 'films'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-medium transition-all capitalize relative
                ${activeTab === tab 
                  ? 'text-auteur-accent' 
                  : 'text-auteur-neutral hover:text-auteur-primary'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-auteur-accent"
                />
              )}
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
            className="pb-32 sm:pb-16"
          >
            {activeTab === 'overview' ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 backdrop-blur-md bg-auteur-bg-card/30 p-8 rounded-xl border border-auteur-neutral/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Biography</h2>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg text-auteur-primary-light whitespace-pre-line leading-relaxed">
                      {director.biography}
                    </p>
                  </div>
                </div>
                <div className="backdrop-blur-md bg-auteur-bg-card/30 p-8 rounded-xl border border-auteur-neutral/10">
                  <h2 className="text-2xl font-bold text-white mb-6">Known For</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-auteur-primary-light mb-4 text-lg">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {genres.map(genre => (
                          <span 
                            key={genre} 
                            className="px-4 py-2 bg-auteur-bg-dark/50 backdrop-blur-sm rounded-lg text-sm text-auteur-primary
                                     border border-auteur-neutral/10 hover:border-auteur-accent/50 transition-colors"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-auteur-primary-light mb-4 text-lg">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {languages.map(lang => (
                          <span 
                            key={lang} 
                            className="px-4 py-2 bg-auteur-bg-dark/50 backdrop-blur-sm rounded-lg text-sm text-auteur-primary
                                     border border-auteur-neutral/10 hover:border-auteur-accent/50 transition-colors"
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {director.directed_movies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group backdrop-blur-md bg-auteur-bg-card/30 rounded-lg border border-auteur-neutral/10 
                             overflow-hidden hover:border-auteur-accent/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate(`/movie/${movie.id}`)}
                  >
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {movie.poster_path ? (
                        <img
                          src={getImageUrl(movie.poster_path)}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-auteur-bg-dark flex items-center justify-center">
                          <Film className="w-8 h-8 text-auteur-accent/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex items-center gap-1.5 text-white/90 mb-2">
                          <Star className="w-3.5 h-3.5 text-yellow-400" />
                          <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
                          <span className="text-xs text-white/60">({movie.vote_count})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {movie.genres.slice(0, 2).map(genre => (
                            <span 
                              key={genre.id}
                              className="px-1.5 py-0.5 bg-auteur-bg-dark/50 backdrop-blur-sm rounded text-[10px] text-white/80"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-auteur-primary mb-1 line-clamp-1">
                        {movie.title}
                      </h3>
                      <p className="text-xs text-auteur-primary-light">
                        {new Date(movie.release_date).getFullYear()}
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
