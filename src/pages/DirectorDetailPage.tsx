import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { DirectorDetails, Movie } from '../types/tmdb';
import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !director) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-auteur-primary mb-4">
            {error || 'Director not found'}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-auteur-bg">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${getImageUrl(director.profile_path)})`,
            filter: 'blur(10px) brightness(0.5)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-auteur-bg" />
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-bold text-white mb-4"
          >
            {director.name}
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 text-auteur-neutral-light text-sm"
          >
            {director.birthday && (
              <span>{new Date(director.birthday).getFullYear()}</span>
            )}
            {director.place_of_birth && (
              <span>{director.place_of_birth}</span>
            )}
            <span>{director.directed_movies.length} Films</span>
          </motion.div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex mb-8 border-b border-auteur-neutral/20">
          {(['overview', 'films'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors capitalize
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
          >
            {activeTab === 'overview' ? (
              <div className="prose prose-invert max-w-none">
                <p className="text-lg text-auteur-primary-light whitespace-pre-line">
                  {director.biography}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {director.directed_movies.map((movie) => (
                  <motion.div
                    key={movie.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-auteur-bg-card rounded-xl overflow-hidden shadow-lg"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 p-4">
                        <h3 className="text-white font-bold text-lg mb-1">{movie.title}</h3>
                        <div className="flex items-center text-sm text-white/80">
                          <span>{new Date(movie.release_date).getFullYear()}</span>
                          <span className="mx-2">•</span>
                          <span className="flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            {movie.vote_average.toFixed(1)}
                          </span>
                        </div>
                      </div>
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