import React, { createContext, useContext, useState, useCallback } from 'react';

interface TMDBContextType {
  getDirectorDetails: (id: number) => Promise<any>;
  getImageUrl: (path: string) => string;
  getEstablishedDirectors: () => Promise<any[]>;
}

const TMDBContext = createContext<TMDBContextType | undefined>(undefined);

export const useTMDB = () => {
  const context = useContext(TMDBContext);
  if (!context) {
    throw new Error('useTMDB must be used within a TMDBProvider');
  }
  return context;
};

export const TMDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey] = useState(import.meta.env.VITE_TMDB_API_KEY);
  const baseUrl = 'https://api.themoviedb.org/3';
  const imageBaseUrl = 'https://image.tmdb.org/t/p';

  const getDirectorDetails = useCallback(async (id: number) => {
    try {
      const response = await fetch(
        `${baseUrl}/person/${id}?api_key=${apiKey}&append_to_response=movie_credits`
      );
      if (!response.ok) throw new Error('Failed to fetch director details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching director details:', error);
      throw error;
    }
  }, [apiKey]);

  const getImageUrl = useCallback((path: string) => {
    return `${imageBaseUrl}/original${path}`;
  }, []);

  const getEstablishedDirectors = useCallback(async () => {
    try {
      const response = await fetch(
        `${baseUrl}/person/popular?api_key=${apiKey}&language=en-US&page=1`
      );
      if (!response.ok) throw new Error('Failed to fetch directors');
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching directors:', error);
      throw error;
    }
  }, [apiKey]);

  const value = {
    getDirectorDetails,
    getImageUrl,
    getEstablishedDirectors,
  };

  return <TMDBContext.Provider value={value}>{children}</TMDBContext.Provider>;
}; 