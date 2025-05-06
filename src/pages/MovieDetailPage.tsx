import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { motion } from 'framer-motion';
import { Film, Star, Calendar, Clock, Users, ArrowLeft } from 'lucide-react';

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, getMovieDetails, getImageUrl } = useTMDB();
  const [movie, setMovie] = useState<any>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (id) {
        try {
          const data = await getMovieDetails(parseInt(id));
          setMovie(data);
        } catch (err) {
          console.error('Error fetching movie:', err);
        }
      }
    };
    fetchMovie();
  }, [id, getMovieDetails]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-auteur-bg">
        <div className="w-16 h-16 border-4 border-auteur-accent rounded-full border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-auteur-bg">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-auteur-primary mb-4">
            {error || 'Movie not found'}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-auteur-accent text-white rounded-lg hover:bg-opacity-80 transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Format runtime to hours and minutes
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format release date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-auteur-bg to-auteur-bg-dark -mt-20">
      {/* Movie Hero Section */}
      <div className="relative h-screen md:h-[70vh] overflow-hidden pt-20">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`,
            filter: 'blur(8px) brightness(0.3)' 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-auteur-bg via-auteur-bg/90 to-transparent" />
        
        {/* Back Button */}
        <div className="container mx-auto px-4 pt-0 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-auteur-primary hover:text-auteur-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
        </div>

        {/* Movie Content Container */}
        <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-8 sm:pb-16">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="pt-6 pb-8 flex flex-col items-center">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-48 rounded-xl overflow-hidden shadow-xl mb-6"
                style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' }}
              >
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Title and Rating */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center w-full"
              >
                <h1 className="text-2xl font-bold text-white mb-2">
                  {movie.title}
                </h1>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-auteur-accent" />
                  <span className="text-white font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {movie.genres.slice(0, 3).map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-auteur-accent/20 text-auteur-accent rounded-full text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-auteur-accent">
                    <Calendar className="w-4 h-4" />
                    <span className="text-white">{formatDate(movie.release_date)}</span>
                  </div>
                  {movie.runtime > 0 && (
                    <div className="flex items-center gap-2 text-auteur-accent">
                      <Clock className="w-4 h-4" />
                      <span className="text-white">{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block py-12">
            <div className="flex gap-8">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-64 rounded-xl overflow-hidden shadow-xl flex-shrink-0"
                style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.3)' }}
              >
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1"
              >
                <h1 className="text-4xl font-bold text-white mb-4">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre: any) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-auteur-accent/20 text-auteur-accent rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-6 mb-6 text-base">
                  <div className="flex items-center gap-2 text-auteur-accent">
                    <Calendar className="w-5 h-5" />
                    <span className="text-white">{formatDate(movie.release_date)}</span>
                  </div>
                  {movie.runtime > 0 && (
                    <div className="flex items-center gap-2 text-auteur-accent">
                      <Clock className="w-5 h-5" />
                      <span className="text-white">{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-auteur-accent">
                    <Star className="w-5 h-5" />
                    <span className="text-white">{movie.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-auteur-accent">
                    <Users className="w-5 h-5" />
                    <span className="text-white">{movie.vote_count.toLocaleString()} votes</span>
                  </div>
                </div>

                <p className="text-auteur-primary-light text-lg leading-relaxed max-w-3xl mb-8">
                  {movie.overview}
                </p>

                {/* Directors Section */}
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-auteur-accent mb-4">
                    Director{movie.credits?.crew?.filter((member: any) => member.job === 'Director').length > 1 ? 's' : ''}
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {movie.credits?.crew
                      ?.filter((member: any) => member.job === 'Director')
                      .map((director: any) => (
                        <div 
                          key={director.id} 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/director/${director.id}`)}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20 ring-2 ring-auteur-accent/20 group-hover:ring-auteur-accent/50 transition-all duration-300">
                            {director.profile_path ? (
                              <img
                                src={getImageUrl(director.profile_path, 'w185')}
                                alt={director.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xl">
                                {director.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-medium group-hover:text-auteur-accent transition-colors">
                              {director.name}
                            </h3>
                            <ArrowLeft className="w-4 h-4 rotate-180 text-auteur-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overview Section */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-4">
          <h2 className="text-xl font-semibold text-auteur-primary mb-3">Overview</h2>
          <p className="text-auteur-primary-light text-sm leading-relaxed mb-6">
            {movie.overview}
          </p>

          {/* Directors Section */}
          <h2 className="text-xl font-semibold text-auteur-primary mb-3">
            Director{movie.credits?.crew?.filter((member: any) => member.job === 'Director').length > 1 ? 's' : ''}
          </h2>
          <div className="flex flex-wrap gap-4 mb-6">
            {movie.credits?.crew
              ?.filter((member: any) => member.job === 'Director')
              .map((director: any) => (
                <div 
                  key={director.id} 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => navigate(`/director/${director.id}`)}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20 ring-2 ring-auteur-accent/20 group-hover:ring-auteur-accent/50 transition-all duration-300">
                    {director.profile_path ? (
                      <img
                        src={getImageUrl(director.profile_path, 'w185')}
                        alt={director.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {director.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-auteur-primary font-medium group-hover:text-auteur-accent transition-colors">
                      {director.name}
                    </h3>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Cast and Crew Section */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Cast Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold text-auteur-primary mb-4 md:mb-6">Cast</h2>
            <div className="divide-y divide-auteur-neutral/10">
              {movie.credits?.cast?.slice(0, 5).map((actor: any, idx: number) => (
                <div key={actor.id} className="flex items-center gap-4 py-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20">
                    {actor.profile_path ? (
                      <img
                        src={getImageUrl(actor.profile_path, 'w185')}
                        alt={actor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {actor.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-auteur-primary font-medium">{actor.name}</h3>
                    <p className="text-sm text-auteur-primary-light">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Crew Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-sm bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold text-auteur-primary mb-4 md:mb-6">Crew</h2>
            <div className="divide-y divide-auteur-neutral/10">
              {movie.credits?.crew
                ?.filter((member: any) => member.job !== 'Director')
                ?.slice(0, 5)
                .map((member: any, idx: number) => (
                  <div key={member.id} className="flex items-center gap-4 py-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20">
                      {member.profile_path ? (
                        <img
                          src={getImageUrl(member.profile_path, 'w185')}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-auteur-primary font-medium">{member.name}</h3>
                      <p className="text-sm text-auteur-primary-light">{member.job}</p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default MovieDetailPage;