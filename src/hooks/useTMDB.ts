// src/hooks/useTMDB.ts
import { useState, useCallback } from 'react';
import { Director, DirectorDetails, Movie } from '../types/tmdb.ts';
import { tmdbService } from '../services/tmdb.ts';

interface UseTMDBReturn {
  loading: boolean;
  error: string | null;
  searchDirectors: (query: string) => Promise<Director[]>;
  getDirectorDetails: (id: number) => Promise<DirectorDetails>;
  getPopularDirectors: (page?: number) => Promise<Director[]>;
  getEstablishedDirectors: () => Promise<Director[]>;
  compareDirectors: (id1: number, id2: number) => Promise<any>;
  getImageUrl: (path: string | null, size?: string) => string | undefined;
  getTopRatedMovies: (page?: number) => Promise<Movie[]>;
  getMovieCredits: (movieId: number) => Promise<any>;
  getMovieDetails: (movieId: number) => Promise<any>;
}

export const useTMDB = (): UseTMDBReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T,>(request: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      const result = await request();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchDirectors = useCallback((query: string) => {
    return handleRequest(() => tmdbService.searchDirectors(query));
  }, []);

  const getEstablishedDirectors = useCallback(() => {
    return handleRequest(() => tmdbService.getEstablishedDirectors());
  }, []);

  const getDirectorDetails = useCallback((id: number) => {
    return handleRequest(() => tmdbService.getDirectorDetails(id));
  }, []);

  const getPopularDirectors = useCallback((page?: number) => {
    return handleRequest(() => tmdbService.getPopularDirectors(page));
  }, []);

  const compareDirectors = useCallback((id1: number, id2: number) => {
    return handleRequest(() => tmdbService.compareDirectors(id1, id2));
  }, []);

  const getImageUrl = useCallback((path: string | null, size?: string): string | undefined => {
    const result = tmdbService.getImageUrl(path, size);
    return result || undefined;
  }, []);

  const getTopRatedMovies = useCallback((page?: number) => {
    return handleRequest(() => tmdbService.getTopRatedMovies(page));
  }, []);

  const getMovieCredits = useCallback((movieId: number) => {
    return handleRequest(() => tmdbService.getMovieCredits(movieId));
  }, []);

  const getMovieDetails = useCallback((movieId: number) => {
    return handleRequest(() => tmdbService.getMovieDetails(movieId));
  }, []);

  return {
    loading,
    error,
    searchDirectors,
    getDirectorDetails,
    getEstablishedDirectors,
    getPopularDirectors,
    compareDirectors,
    getImageUrl,
    getTopRatedMovies,
    getMovieCredits,
    getMovieDetails
  };
};