// SearchBar.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTMDB } from '../hooks/useTMDB';
import { Director } from '../types/tmdb';

interface SearchResultProps {
  director: Director;
  onSelect: (director: Director) => void;
  getImageUrl: (path: string | null, size?: string) => string | undefined;
  index: number;
}

const SearchResult = ({ director, onSelect, getImageUrl, index }: SearchResultProps) => (
  <motion.button
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ delay: index * 0.05 }}
    onClick={() => onSelect(director)}
    className="w-full p-3 flex items-center gap-4 hover:bg-auteur-bg-dark/50 
               backdrop-blur-sm transition-all duration-300 group rounded-xl"
  >
    <div className="w-10 h-10 rounded-full overflow-hidden bg-auteur-neutral/20 flex-shrink-0
                    ring-2 ring-auteur-neutral/10 group-hover:ring-auteur-accent/30 transition-all">
      {director.profile_path ? (
        <img 
          src={getImageUrl(director.profile_path) || undefined}
          alt={director.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-auteur-primary-light">
          {director.name[0]}
        </div>
      )}
    </div>
    <div className="flex-grow text-left">
      <h3 className="font-medium text-auteur-primary group-hover:text-auteur-accent transition-colors">
        {director.name}
      </h3>
      {director.known_for_department && (
        <p className="text-sm text-auteur-primary-light">
          {director.known_for_department}
        </p>
      )}
    </div>
  </motion.button>
);

const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { searchDirectors, getImageUrl } = useTMDB();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchWithDebounce = setTimeout(async () => {
      if (query.length > 2) {
        setIsLoading(true);
        try {
          const searchResults = await searchDirectors(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        }
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchWithDebounce);
  }, [query, searchDirectors]);

  const handleSelect = (director: Director) => {
    navigate(`/director/${director.id}`);
    setQuery('');
    setIsExpanded(false);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Desktop Search */}
      <div className="hidden md:block">
        <div className="flex items-center">
          <motion.div
            className="relative flex items-center"
            animate={{ width: isExpanded ? '300px' : '40px' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {!isExpanded ? (
              <button
                onClick={() => setIsExpanded(true)}
                className="p-2 text-auteur-primary hover:text-auteur-accent 
                         bg-auteur-bg/30 hover:bg-auteur-bg/50 backdrop-blur-sm
                         rounded-xl transition-all duration-200"
              >
                <Search size={20} />
              </button>
            ) : (
              <div className="w-full relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search directors..."
                  className="w-full pl-10 pr-4 py-2 bg-auteur-bg/50 rounded-xl
                           text-auteur-primary placeholder:text-auteur-primary-light
                           focus:outline-none focus:ring-2 focus:ring-auteur-accent/50
                           border border-auteur-neutral/10"
                  onBlur={() => {
                    if (!query) setIsExpanded(false);
                  }}
                />
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-auteur-primary-light"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2
                             text-auteur-primary-light hover:text-auteur-primary
                             transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden w-full">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search directors..."
            className="w-full pl-10 pr-4 py-2 bg-auteur-bg/50 rounded-xl
                     text-auteur-primary placeholder:text-auteur-primary-light
                     focus:outline-none focus:ring-2 focus:ring-auteur-accent/50
                     border border-auteur-neutral/10"
          />
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-auteur-primary-light"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2
                       text-auteur-primary-light hover:text-auteur-primary
                       transition-colors duration-200"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {(query.length > 2) && (results.length > 0 || isLoading) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-0 right-0 top-full mt-2 
                     bg-auteur-bg-card/80 backdrop-blur-md rounded-xl
                     shadow-lg border border-auteur-neutral/10 overflow-hidden z-50"
            style={{ maxHeight: '400px' }}
          >
            <div className="overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-auteur-accent border-t-transparent
                              rounded-full mx-auto"
                  />
                </div>
              ) : (
                <div className="p-2">
                  {results.map((director, index) => (
                    <SearchResult
                      key={director.id}
                      director={director}
                      onSelect={handleSelect}
                      getImageUrl={getImageUrl}
                      index={index}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;