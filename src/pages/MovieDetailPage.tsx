import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTMDB } from '../hooks/useTMDB';
import { motion } from 'framer-motion';
import { Star, Calendar, Clock, Users, ArrowLeft, Tag, ChevronDown, ChevronUp } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      profile_path: string;
    }>;
  };
}

const MovieDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, error, getMovieDetails, getImageUrl } = useTMDB();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [expandedOverview, setExpandedOverview] = useState(false);

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

  // Get directors
  const directors = movie.credits?.crew?.filter((member: any) => member.job === 'Director') || [];

  return (
    <main className="min-h-screen bg-gradient-to-b from-auteur-bg to-auteur-bg-dark -mt-20">
      {/* Glassmorphic Back Button for Desktop */}
      <button
        onClick={() => navigate(-1)}
        className="hidden md:flex fixed top-6 left-6 z-50 items-center gap-2 text-white hover:text-auteur-accent transition-colors pointer-events-auto bg-white/20 hover:bg-black/40 backdrop-blur-lg rounded-full px-4 py-2 shadow border border-white/30"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-auteur-bg pt-32 pb-10 md:pt-0 md:pb-16">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'original')})`,
              filter: 'blur(16px) brightness(0.4)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-auteur-bg/80 via-transparent to-auteur-bg/90" />
        </div>
        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-16 pb-4 md:pt-48 md:pb-16">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="flex flex-col items-center">
              {/* Poster */}
              <div className="w-40 aspect-[2/3] rounded-xl overflow-hidden shadow-xl border border-white/30 bg-white/20 backdrop-blur-lg mb-8">
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Title */}
              <h1 className="text-3xl font-extrabold text-white mb-4 text-center drop-shadow-lg">
                {movie.title}
              </h1>
              {/* Release Date */}
              <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-auteur-bg-dark/60 text-auteur-primary-light text-sm shadow border border-auteur-accent/20 mb-4">
                <Calendar className="text-auteur-accent" size={16} />
                {formatDate(movie.release_date)}
              </span>
              {/* Director Info */}
              {directors.length > 0 && (
                <div className="w-full mb-6 flex items-center gap-4 justify-center md:justify-start">
                  <span className="text-sm text-auteur-primary mr-2">
                    Director{directors.length > 1 ? 's' : ''}
                  </span>
                  {directors.map((director: any) => (
                    <div
                      key={director.id}
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => navigate(`/director/${director.id}`)}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-auteur-neutral/20 ring-2 ring-auteur-accent/20 group-hover:ring-auteur-accent/50 transition-all duration-300">
                        {director.profile_path ? (
                          <img
                            src={getImageUrl(director.profile_path, 'w185')}
                            alt={director.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            {director.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-auteur-primary group-hover:text-auteur-accent transition-colors">
                        {director.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* Overview (clamped with read more) */}
              <div className={`relative max-w-xl mb-6 text-center`}>
                <p className={`text-auteur-primary-light text-sm leading-relaxed ${expandedOverview ? '' : 'line-clamp-2'}`}>{movie.overview}</p>
                {movie.overview.length > 120 && (
                  <a
                    className="mt-2 inline-flex items-center justify-center gap-2 text-auteur-accent text-sm font-bold underline underline-offset-2 cursor-pointer hover:text-auteur-accent-dark transition"
                    onClick={() => setExpandedOverview(v => !v)}
                    tabIndex={0}
                    role="button"
                  >
                    {expandedOverview ? 'Show less' : 'Read more'}
                    {expandedOverview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </a>
                )}
              </div>
            </div>
          </div>
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-6 items-center">
            {/* Poster */}
            <div className="col-span-5 flex justify-center">
              <div className="w-72 aspect-[2/3] rounded-xl overflow-hidden shadow-xl border border-white/30 bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <img
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            {/* Info */}
            <div className="col-span-7 flex flex-col items-start max-w-2xl gap-4">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                {movie.title}
              </h1>
              {/* Release Date */}
              <span className="flex items-center gap-2 px-5 py-2 rounded-full bg-auteur-bg-dark/60 text-auteur-primary-light text-sm shadow border border-auteur-accent/20 mb-4">
                <Calendar className="text-auteur-accent" size={18} />
                {formatDate(movie.release_date)}
              </span>
              {/* Director Info */}
              {directors.length > 0 && (
                <div className="w-full mb-6 flex items-center gap-4 justify-center md:justify-start">
                  <span className="text-sm text-auteur-primary mr-2">
                    Director{directors.length > 1 ? 's' : ''}
                  </span>
                  {directors.map((director: any) => (
                    <div
                      key={director.id}
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => navigate(`/director/${director.id}`)}
                    >
                      <div className="w-9 h-9 rounded-full overflow-hidden bg-auteur-neutral/20 ring-2 ring-auteur-accent/20 group-hover:ring-auteur-accent/50 transition-all duration-300">
                        {director.profile_path ? (
                          <img
                            src={getImageUrl(director.profile_path, 'w185')}
                            alt={director.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs">
                            {director.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-bold text-auteur-primary group-hover:text-auteur-accent transition-colors">
                        {director.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {/* Overview (clamped with read more) */}
              <div className={`relative max-w-2xl mb-6`}>
                <p className={`text-auteur-primary-light text-sm leading-relaxed ${expandedOverview ? '' : 'line-clamp-2'}`}>{movie.overview}</p>
                {movie.overview.length > 120 && (
                  <a
                    className="mt-2 inline-flex items-center gap-2 text-auteur-accent text-sm font-bold underline underline-offset-2 cursor-pointer hover:text-auteur-accent-dark transition"
                    onClick={() => setExpandedOverview(v => !v)}
                    tabIndex={0}
                    role="button"
                  >
                    {expandedOverview ? 'Show less' : 'Read more'}
                    {expandedOverview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Divider below hero */}
        <div className="absolute left-0 right-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-auteur-bg" />
      </section>

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
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-yellow-400 text-sm font-medium mb-1">Average Rating</h3>
                <p className="text-3xl font-bold text-auteur-primary">{movie.vote_average.toFixed(1)}</p>
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
              <div className="p-3 rounded-lg bg-green-500/10">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-green-400 text-sm font-medium mb-1">Total Votes</h3>
                <p className="text-3xl font-bold text-auteur-primary">{movie.vote_count.toLocaleString()}</p>
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
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-blue-400 text-sm font-medium mb-1">Runtime</h3>
                <p className="text-3xl font-bold text-auteur-primary">{formatRuntime(movie.runtime)}</p>
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
                <Tag className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-purple-400 text-sm font-medium mb-1">Genres</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {movie.genres.map((g: any) => (
                    <span key={g.id} className="px-3 py-1 bg-auteur-accent/20 text-auteur-accent rounded-full text-sm">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 pb-32 sm:pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Cast Card */}
          <div className="flex-1 backdrop-blur-lg bg-white/5 border border-white/10 p-5 rounded-xl shadow-black/10 space-y-4">
            <h2 className="text-2xl font-semibold text-auteur-primary mb-6">Cast</h2>
            <div className="divide-y divide-auteur-neutral/10">
              {movie.credits?.cast?.slice(0, 10).map((actor: any) => (
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
          </div>
          {/* Crew Card */}
          <div className="flex-1 backdrop-blur-lg bg-white/5 border border-white/10 p-5 rounded-xl shadow-black/10 space-y-4">
            <h2 className="text-2xl font-semibold text-auteur-primary mb-6">Crew</h2>
            <div className="divide-y divide-auteur-neutral/10">
              {movie.credits?.crew
                ?.filter((member: any) => member.job !== 'Director')
                ?.slice(0, 10)
                .map((member: any) => (
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
          </div>
        </div>
      </div>
    </main>
  );
};

export default MovieDetailPage;