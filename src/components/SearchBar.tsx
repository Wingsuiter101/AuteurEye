import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useTMDB } from '../hooks/useTMDB.ts';
import { Director } from '../types/tmdb.ts';

interface SearchResultProps {
  director: Director;
  onSelect: (director: Director) => void;
  getImageUrl: (path: string | null) => string | null;
  index: number;
}

const SearchResult = ({ director, onSelect, getImageUrl, index }: SearchResultProps) => (
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ delay: index * 0.05 }}
    onClick={() => onSelect(director)}
    className="w-full p-4 flex items-center gap-4 hover:bg-auteur-bg-dark/50 
               backdrop-blur-sm transition-all duration-200 group rounded-xl"
  >
    <div className="w-12 h-12 rounded-full overflow-hidden bg-auteur-neutral/20 flex-shrink-0
                    ring-2 ring-auteur-neutral/10 group-hover:ring-auteur-accent/30 transition-all">
      {director.profile_path ? (
        <img
          src={getImageUrl(director.profile_path)}
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
      <h3 className="font-medium text-auteur-primary group-hover:text-auteur-accent 
                     transition-colors duration-200">
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Director[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { searchDirectors, getImageUrl } = useTMDB();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
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
    setIsOpen(false);
    setQuery('');
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: shouldReduceMotion ? 1 : 0.9,
      y: shouldReduceMotion ? 0 : -20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300
      }
    },
    exit: {
      opacity: 0,
      scale: shouldReduceMotion ? 1 : 0.95,
      y: shouldReduceMotion ? 0 : -10,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="p-2 text-auteur-primary hover:text-auteur-accent 
                   bg-auteur-bg/30 hover:bg-auteur-bg/50 backdrop-blur-sm
                   rounded-xl transition-all duration-200"
      >
        <Search size={20} />
      </motion.button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute right-0 top-full mt-4 w-screen max-w-lg 
                       bg-auteur-bg-card/80 backdrop-blur-md rounded-2xl
                       shadow-lg border border-auteur-neutral/10 overflow-hidden z-50"
              style={{ maxHeight: 'calc(100vh - 200px)' }}
            >
              {/* Search Input */}
              <div className="p-4 border-b border-auteur-neutral/10">
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2
                               text-auteur-primary-light"
                  />
                  {query && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2
                                 text-auteur-primary-light hover:text-auteur-primary
                                 transition-colors duration-200"
                    >
                      <X size={16} />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Results */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-y-auto bg-auteur-bg-card/50"
                style={{ maxHeight: 'calc(100vh - 280px)' }}
              >
                {isLoading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-auteur-accent border-t-transparent
                                rounded-full mx-auto"
                    />
                  </div>
                ) : results.length > 0 ? (
                  <div className="p-2 space-y-2">
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
                ) : query.length > 2 ? (
                  <div className="p-8 text-center text-auteur-primary-light">
                    No directors found
                  </div>
                ) : null}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;