import { useState, useEffect } from 'react';
import { useTMDB } from './useTMDB';
import { tmdbService } from '../services/tmdb';

export const useCollagePosters = () => {
  const [posters, setPosters] = useState<string[]>([]);
  const { getImageUrl } = useTMDB();

  useEffect(() => {
    async function fetchCollage() {
      try {
        const movies = await tmdbService.getDiverseMoviePool(20);
        setPosters(
          movies
            .filter((m: any) => m.poster_path)
            .map((m: any) => getImageUrl(m.poster_path, 'w500'))
            .filter((url): url is string => Boolean(url))
        );
      } catch (error) {
        console.error('Error fetching collage posters:', error);
      }
    }
    fetchCollage();
  }, [getImageUrl]);

  return posters;
}; 