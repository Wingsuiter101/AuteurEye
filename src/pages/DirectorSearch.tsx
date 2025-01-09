import React, { memo } from 'react';
import { SearchIcon, X } from 'lucide-react';
import { Director, DirectorDetails } from '../types/tmdb.ts';

interface DirectorSearchProps {
  index: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: Director[];
  selectedDirector: DirectorDetails | null;
  onDirectorSelect: (director: Director) => void;
  onDeselect: () => void;
  getImageUrl: (path: string) => string;
}

const DirectorSearch = memo(function DirectorSearch({
  index,
  searchQuery,
  setSearchQuery,
  searchResults,
  selectedDirector,
  onDirectorSelect,
  onDeselect,
  getImageUrl
}: DirectorSearchProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchQuery(e.target.value);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="relative">
        <div className="relative">
          {selectedDirector ? (
            <div className="flex items-center w-full p-3 md:p-4 rounded-lg bg-auteur-bg-card border border-auteur-neutral/20">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-auteur-neutral/20 mr-3">
                {selectedDirector.profile_path ? (
                  <img
                    src={getImageUrl(selectedDirector.profile_path)}
                    alt={selectedDirector.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-auteur-primary">
                    {selectedDirector.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-grow">
                <p className="text-sm md:text-base text-auteur-primary">{selectedDirector.name}</p>
                <p className="text-xs text-auteur-neutral">{selectedDirector.directed_movies.length} films</p>
              </div>
              <button
                onClick={onDeselect}
                className="ml-2 p-1 hover:bg-auteur-bg-dark rounded-full"
              >
                <X className="w-4 h-4 text-auteur-neutral" />
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={`Search for Director ${index + 1}`}
              className="w-full p-3 md:p-4 rounded-lg bg-auteur-bg-card border border-auteur-neutral/20
                       focus:border-auteur-accent focus:ring-1 focus:ring-auteur-accent/50
                       text-sm md:text-base text-auteur-primary placeholder:text-auteur-neutral"
            />
          )}
          {!selectedDirector && <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-auteur-neutral" />}
        </div>

        {searchResults.length > 0 && searchQuery.length > 2 && !selectedDirector && (
          <div className="absolute z-10 w-full mt-1 bg-auteur-bg-card border border-auteur-neutral/20 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {searchResults.map((director) => (
              <button
                key={director.id}
                onClick={() => onDirectorSelect(director)}
                className="w-full p-3 flex items-center gap-3 hover:bg-auteur-bg-dark/50
                         text-left transition-colors border-b border-auteur-neutral/10 last:border-0"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-auteur-neutral/20 flex-shrink-0">
                  {director.profile_path ? (
                    <img
                      src={getImageUrl(director.profile_path)}
                      alt={director.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-auteur-primary">
                      {director.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-auteur-primary">{director.name}</h3>
                  <p className="text-xs text-auteur-neutral">{director.known_for_department}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default DirectorSearch;