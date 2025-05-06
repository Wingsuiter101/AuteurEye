// src/services/tmdb.ts
import { Director, DirectorDetails, Movie } from '../types/tmdb';

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly imageBaseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY;
    this.baseUrl = import.meta.env.VITE_TMDB_API_BASE_URL;
    this.imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    // Validate configuration on initialization
    if (!this.apiKey) {
      throw new Error('TMDB API key is not configured. Please check your .env file.');
    }
    if (!this.baseUrl) {
      throw new Error('TMDB API base URL is not configured. Please check your .env file.');
    }
    if (!this.imageBaseUrl) {
      throw new Error('TMDB image base URL is not configured. Please check your .env file.');
    }
  }

  private async fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      language: 'en-US',
      ...params
    });

    const url = `${this.baseUrl}${endpoint}?${queryParams}`;
    
    try {
      const response = await fetch(url);
      
      // Log the response details for debugging
      console.debug(`TMDB API Request: ${url}`);
      console.debug(`Status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `TMDB API Error: ${response.status} - ${response.statusText}`;
        
        // Check if response is HTML (indicating a possible routing/URL issue)
        if (contentType?.includes('text/html')) {
          errorMessage = `Invalid API response (HTML received). Please check API configuration. Status: ${response.status}`;
          console.error('Received HTML instead of JSON. Check API base URL configuration.');
        } else {
          // Try to get detailed error message from JSON response
          try {
            const errorData = await response.json();
            errorMessage = `TMDB API Error: ${response.status} - ${errorData.status_message || response.statusText}`;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
        }
        
        throw new Error(errorMessage);
      }

      // Verify the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error(`Expected JSON response but received ${contentType}`);
      }

      return response.json();
    } catch (error) {
      // Add request context to the error
      const enhancedError = new Error(
        `Failed to fetch from TMDB API (${endpoint}): ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      console.error('TMDB API Error:', {
        endpoint,
        params,
        error: error instanceof Error ? error.message : error
      });
      throw enhancedError;
    }
  }

  getImageUrl(path: string | null, size: string = 'w500'): string | undefined {
    if (!path) return undefined;
    return `${this.imageBaseUrl}/${size}${path}`;
  }

  async searchAll(query: string): Promise<any[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<any>>('/search/person', {
      query,
      include_adult: 'false'
    });
    return response.results;
  }

  async getEstablishedDirectors(): Promise<Director[]> {
    const directors = new Map<number, Director>();

    // --------------------------------------------------------------------------
    // STEP 1: Pull in historically significant directors (various world cinemas)
    // --------------------------------------------------------------------------
    const historicallySignificantDirectors = [
      // Japanese Cinema
      906,       // Akira Kurosawa
      608,       // Hayao Miyazaki
      5354,      // Hirokazu Kore-eda
      1424133,   // Ryusuke Hamaguchi
      122807,    // Makoto Shinkai
      119177,    // Mamoru Hosoda

      // Korean Cinema
      21684,     // Bong Joon-ho
      578,       // Park Chan-wook

      // Chinese/Hong Kong/Taiwan Cinema
      8346,      // Wong Kar-wai
      13176,     // Ang Lee
      7796,      // Zhang Yimou
      1815310,   // Bi Gan

      // Indian Cinema (reduced to just two most significant directors)
      11710,     // Satyajit Ray
      22212,     // Mira Nair

      // European Masters
      1189046,   // Céline Sciamma (France)
      5641,      // Ingmar Bergman (Sweden)
      23715,     // Agnès Varda (France)
      5172,      // Michael Haneke (Austria)
      7232,      // Pedro Almodóvar (Spain)
      13560,     // Jacques Audiard (France)

      // Middle Eastern Cinema
      8949,      // Abbas Kiarostami (Iran)
      7428,      // Asghar Farhadi (Iran)

      // African Cinema
      108635,    // Ousmane Sembène (Senegal)

      // Latin American Cinema
      6004,      // Fernando Meirelles (Brazil)
      1205722,   // Kleber Mendonça Filho (Brazil)

      488,       // Steven Spielberg
      1032,      // Martin Scorsese
      108,       // David Fincher
      138,       // Quentin Tarantino
      7906,      // Kathryn Bigelow
      5655,      // Spike Lee
      1776,      // Sofia Coppola
      1356061,   // Ava DuVernay
      1146425,   // Greta Gerwig
      5656,      // Wes Anderson
    ];

    // Fetch details for historically significant directors
    await Promise.all(
      historicallySignificantDirectors.map(async (directorId) => {
        try {
          const directorDetails = await this.fetchFromTMDB<any>(`/person/${directorId}`);
          directors.set(directorId, {
            id: directorId,
            name: directorDetails.name,
            biography: directorDetails.biography || '',
            profile_path: directorDetails.profile_path,
            known_for_department: directorDetails.known_for_department,
            place_of_birth: directorDetails.place_of_birth,
            birthday: directorDetails.birthday,
            deathday: directorDetails.deathday
          });
        } catch (error) {
          console.error(`Error fetching director ${directorId}:`, error);
        }
      })
    );

    // --------------------------------------------------------------------------
    // STEP 2: Discover contemporary directors from multiple recent years
    //
    // Instead of specifying a single primary_release_year (e.g., 2023),
    // we use a date range. For example, from 2019-01-01 to 2023-12-31.
    // You can adjust the range, minVotes, and pages to find the right balance.
    // --------------------------------------------------------------------------

    // We can define multiple languages we want to discover. 
    // Feel free to add or remove languages as needed.
    const languageGroups = [
      { language: 'en', minVotes: 30 },
      { language: 'ja', minVotes: 50 },  // Japanese
      { language: 'ko', minVotes: 50 },  // Korean
      { language: 'zh', minVotes: 50 },  // Chinese
      { language: 'ta', minVotes: 70 },  // Tamil
      { language: 'te', minVotes: 60 },  // Telugu
      { language: 'ml', minVotes: 80 },  // Malayalam
      { language: 'hi', minVotes: 60 },  // Hindi - increased minimum votes to reduce frequency
      { language: 'fr', minVotes: 50 },  // French
      { language: 'it', minVotes: 50 },  // Italian
      { language: 'de', minVotes: 50 },  // German

      // Broaden to additional world cinema languages
      { language: 'es', minVotes: 30 },  // Spanish
      { language: 'pt', minVotes: 30 },  // Portuguese
      { language: 'tr', minVotes: 30 },  // Turkish
      { language: 'th', minVotes: 30 },  // Thai
      { language: 'fa', minVotes: 30 },  // Persian
      { language: 'ar', minVotes: 30 },  // Arabic
      { language: 'sv', minVotes: 30 },  // Swedish
      { language: 'da', minVotes: 30 },  // Danish
      { language: 'no', minVotes: 30 },  // Norwegian
    ];

    // We'll pull movies from 2019-01-01 to 2023-12-31
    const dateRangeParams = {
      'primary_release_date.gte': '1980-01-01',
      'primary_release_date.lte': '2024-12-31',
      'sort_by': 'vote_average.desc'
    };

    // We'll limit ourselves to a few pages (e.g., 1 and 2) to balance load times
    const pagesToFetch = [1, 2];

    for (const { language, minVotes } of languageGroups) {
      for (const page of pagesToFetch) {
        try {
          const response = await this.fetchFromTMDB<TMDBResponse<any>>('/discover/movie', {
            ...dateRangeParams,
            'vote_count.gte': minVotes.toString(),
            'with_original_language': language,
            'page': page.toString()
          });

          // We'll examine the top 3 results from each page
          const moviesWithCredits = await Promise.all(
            response.results.slice(0, 5).map((movie) =>
              this.fetchFromTMDB<any>(`/movie/${movie.id}`, {
                'append_to_response': 'credits'
              })
            )
          );

          for (const movie of moviesWithCredits) {
            const director = movie.credits?.crew?.find(
              (person: any) => person.job === 'Director'
            );

            if (director && !directors.has(director.id)) {
              try {
                const personDetails = await this.fetchFromTMDB<any>(`/person/${director.id}`);
                directors.set(director.id, {
                  id: director.id,
                  name: director.name,
                  biography: personDetails.biography || '',
                  profile_path: director.profile_path || personDetails.profile_path,
                  known_for_department: personDetails.known_for_department,
                  place_of_birth: personDetails.place_of_birth,
                  birthday: personDetails.birthday,
                  deathday: personDetails.deathday
                });
              } catch (error) {
                console.error(`Error fetching person ${director.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Error fetching movies for language ${language} (page ${page}):`, error);
        }
      }
    }

    // --------------------------------------------------------------------------
    // STEP 3: Add directors from currently popular films (for variety)
    // --------------------------------------------------------------------------
    try {
      const popularResponse = await this.fetchFromTMDB<TMDBResponse<any>>('/movie/popular', {
        page: '1'
      });

      const popularMovies = await Promise.all(
        popularResponse.results.slice(0, 5).map((movie) =>
          this.fetchFromTMDB<any>(`/movie/${movie.id}`, {
            'append_to_response': 'credits'
          })
        )
      );

      for (const movie of popularMovies) {
        const director = movie.credits?.crew?.find(
          (person: any) => person.job === 'Director'
        );

        if (director && !directors.has(director.id)) {
          try {
            const personDetails = await this.fetchFromTMDB<any>(`/person/${director.id}`);
            directors.set(director.id, {
              id: director.id,
              name: director.name,
              biography: personDetails.biography || '',
              profile_path: director.profile_path || personDetails.profile_path,
              known_for_department: personDetails.known_for_department,
              place_of_birth: personDetails.place_of_birth,
              birthday: personDetails.birthday,
              deathday: personDetails.deathday
            });
          } catch (error) {
            console.error(`Error fetching person ${director.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching popular movies:', error);
    }

    // --------------------------------------------------------------------------
    // STEP 4: Validate all directors (both discovered & historically significant)
    // --------------------------------------------------------------------------
    const directorArray = Array.from(directors.values());
    const validatedDirectors = await Promise.all(
      directorArray.map(async (director) => {
        try {
          const credits = await this.fetchFromTMDB<any>(`/person/${director.id}/movie_credits`);
          const directedMovies = credits.crew?.filter(
            (credit: any) => credit.job === 'Director'
          ) || [];

          if (directedMovies.length > 0) {
            console.log(`✓ Keeping ${director.name} with ${directedMovies.length} directed movies`);
            return director;
          } else {
            console.log(`Filtering out ${director.name} - no directed movies`);
            return null;
          }
        } catch (error) {
          console.error(`Error checking credits for ${director.name}:`, error);
          return null;
        }
      })
    );

    // Filter out null values and return
    return validatedDirectors.filter((d): d is Director => d !== null);
  }

  async searchDirectors(query: string): Promise<Director[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<any>>('/search/person', {
      query,
      include_adult: 'false'
    });
  
    // For each person, fetch their full movie credits
    const directors = await Promise.all(
      response.results.map(async (person) => {
        try {
          console.log(`Checking full credits for: ${person.name}`);
          const credits = await this.fetchFromTMDB<any>(`/person/${person.id}/movie_credits`);
          
          // Check if they have directed any movies
          const directedMovies = credits.crew?.filter(
            (credit: any) => credit.job === 'Director'
          ) || [];
  
          // Only return directors who have directed at least 2 movies
          if (directedMovies.length >= 2) {  // Changed from > 3 to >= 2
            console.log(`✓ Found ${directedMovies.length} directed movies for ${person.name}`);
            return {
              id: person.id,
              name: person.name,
              biography: person.biography || '',
              profile_path: person.profile_path,
              known_for_department: person.known_for_department,
              place_of_birth: person.place_of_birth,
              birthday: person.birthday,
              deathday: person.deathday
            };
          }
          console.log(`✗ ${person.name} has fewer than 2 directed movies`);
          return null;
        } catch (error) {
          console.error(`Error checking credits for ${person.name}:`, error);
          return null;
        }
      })
    );
  
    // Filter out null values (non-directors and those with < 2 directed films)
    const filteredDirectors = directors.filter((d): d is Director => d !== null);
    console.log(`Found ${filteredDirectors.length} directors with 2+ movies`);
    
    return filteredDirectors;
  }
  
  async getPopularDirectors(page: number = 1): Promise<Director[]> {
    const response = await this.fetchFromTMDB<TMDBResponse<any>>('/person/popular', {
      page: page.toString()
    });
  
    // Use the same thorough director filtering logic as searchDirectors
    const directors = await Promise.all(
      response.results.map(async (person) => {
        try {
          const credits = await this.fetchFromTMDB<any>(`/person/${person.id}/movie_credits`);
          
          // Check if they have directed any movies
          const directedMovies = credits.crew?.filter(
            (credit: any) => credit.job === 'Director'
          ) || [];
  
          // Only return directors who have directed at least 3 movies
          if (directedMovies.length >=2 ) {  // Changed from > 0 to >= 3
            return {
              id: person.id,
              name: person.name,
              biography: person.biography || '',
              profile_path: person.profile_path,
              known_for_department: person.known_for_department,
              place_of_birth: person.place_of_birth,
              birthday: person.birthday,
              deathday: person.deathday
            };
          }
          return null;
        } catch (error) {
          console.error(`Error checking credits for ${person.name}:`, error);
          return null;
        }
      })
    );
  
    // Filter out null values and return only valid directors
    return directors.filter((d): d is Director => d !== null);
  }

  async getDirectorDetails(directorId: number): Promise<DirectorDetails> {
    // Fetch basic director info
    const director = await this.fetchFromTMDB<any>(`/person/${directorId}`);
  
    // Fetch director's movies with credits
    const credits = await this.fetchFromTMDB<{
      crew: Array<{
        id: number;
        job: string;
        title: string;
        release_date?: string;
      }>;
    }>(`/person/${directorId}/movie_credits`);
  
    // Filter for movies where they were director and sort by date
    const directorMovieIds = credits.crew
      .filter(credit => credit.job === 'Director')
      .sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date) : new Date(0);
        const dateB = b.release_date ? new Date(b.release_date) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      })
      .map(movie => movie.id);
  
    // Fetch full details for each movie including cast and genres
    const moviePromises = directorMovieIds.map(movieId => 
      this.fetchFromTMDB<Movie>(`/movie/${movieId}`, { append_to_response: 'credits' })
    );
  
    const directedMovies = await Promise.all(moviePromises);
  
    // Sort movies by release date (newest first)
    directedMovies.sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  
    return {
      ...director,
      directed_movies: directedMovies,
      total_movies: directedMovies.length
    };
  }

  async getMovieDetails(movieId: number): Promise<Movie> {
    return this.fetchFromTMDB<Movie>(`/movie/${movieId}`, {
      append_to_response: 'credits'
    });
  }

  async getMovieCredits(movieId: number): Promise<any> {
    return this.fetchFromTMDB<any>(`/movie/${movieId}/credits`);
  }

  // Added helper to fetch keywords for a single movie
  private async getMovieKeywords(movieId: number): Promise<{ id: number; name: string }[]> {
    try {
      const response = await this.fetchFromTMDB<{ keywords: { id: number; name: string }[] }>(`/movie/${movieId}/keywords`);
      return response.keywords || [];
    } catch (error) {
      console.error(`Failed to fetch keywords for movie ID ${movieId}:`, error);
      return []; // Return empty array on error for this specific movie
    }
  }

  async compareDirectors(directorId1: number, directorId2: number): Promise<{
    director1: DirectorDetails;
    director2: DirectorDetails;
    commonGenres: string[];
    averageRatings: { director1: number; director2: number };
  }> {
    const [director1, director2] = await Promise.all([
      this.getDirectorDetails(directorId1),
      this.getDirectorDetails(directorId2)
    ]);

    // Calculate average ratings for recent movies (last 10)
    const getRecentAvgRating = (movies: Movie[]) => {
      // Filter out movies with ratings below 2 (likely errors or extremely poor data)
      const validMovies = movies.filter(movie => movie.vote_average >= 2).slice(0, 10);
      
      // Return 0 if there are no valid movies
      if (validMovies.length === 0) return 0;
      
      // Calculate the average rating
      return validMovies.reduce((acc, movie) => 
        acc + movie.vote_average, 0) / validMovies.length;
    };

    // Find common genres
    const getGenres = (movies: Movie[]) => 
      new Set(movies.flatMap(movie => movie.genres.map(g => g.name)));
    
    const genres1 = getGenres(director1.directed_movies);
    const genres2 = getGenres(director2.directed_movies);
    const commonGenres = [...genres1].filter(genre => genres2.has(genre));

    return {
      director1,
      director2,
      commonGenres,
      averageRatings: {
        director1: getRecentAvgRating(director1.directed_movies),
        director2: getRecentAvgRating(director2.directed_movies)
      }
    };
  }

  /**
   * Get a diverse set of movies from multiple endpoints (popular, now playing, top rated, etc.)
   * This ensures we get a good mix of movies instead of just the same top-rated classics
   */
  async getDiverseMoviePool(count: number = 50): Promise<Movie[]> {
    console.log(`[getDiverseMoviePool] Fetching diverse movie pool of approximately ${count} movies...`);
    
    // Define the endpoints to fetch from
    const endpoints = [
      // Basic endpoints
      { path: '/movie/popular', pages: 1 },
      { path: '/movie/now_playing', pages: 1 },
      { path: '/movie/top_rated', pages: 1 },
      
      // World Cinema - fetch films by country/language
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'fr', sort_by: 'vote_count.desc' } }, // French cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'ja', sort_by: 'vote_count.desc' } }, // Japanese cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'ko', sort_by: 'vote_count.desc' } }, // Korean cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'it', sort_by: 'vote_count.desc' } }, // Italian cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'es', sort_by: 'vote_count.desc' } }, // Spanish cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'de', sort_by: 'vote_count.desc' } }, // German cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'sv', sort_by: 'vote_count.desc' } }, // Swedish cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'hi', sort_by: 'vote_count.desc' } }, // Hindi/Indian cinema
      { path: '/discover/movie', pages: 1, params: { with_original_language: 'zh', sort_by: 'vote_count.desc' } }, // Chinese cinema
      
      // Arthouse and critically acclaimed
      { path: '/discover/movie', pages: 1, params: { sort_by: 'vote_average.desc', 'vote_count.gte': '1000', with_genres: '18' } }, // Highly-rated dramas
      { path: '/discover/movie', pages: 1, params: { sort_by: 'vote_average.desc', 'vote_count.gte': '500', with_genres: '10749,18' } }, // Romance dramas
      
      // Specific genres
      { path: '/discover/movie', pages: 1, params: { with_genres: '28,12,16' } }, // Action, Adventure, Animation
      { path: '/discover/movie', pages: 1, params: { with_genres: '35,80,18' } }, // Comedy, Crime, Drama
      { path: '/discover/movie', pages: 1, params: { with_genres: '14,27,9648' } }, // Fantasy, Horror, Mystery
      { path: '/discover/movie', pages: 1, params: { with_genres: '10749,878,53' } }, // Romance, Sci-Fi, Thriller
      
      // Independent and festival films (approximated by lower vote counts but high ratings)
      { path: '/discover/movie', pages: 1, params: { sort_by: 'vote_average.desc', 'vote_count.gte': '100', 'vote_count.lte': '1000' } },
    ];
    
    // Fetch movies from all endpoints
    const allMovies: Movie[] = [];
    
    for (const endpoint of endpoints) {
      for (let page = 1; page <= endpoint.pages; page++) {
        try {
          const params: Record<string, string> = { page: page.toString() };
          if (endpoint.params) {
            Object.assign(params, endpoint.params);
          }
          
          const response = await this.fetchFromTMDB<TMDBResponse<Movie>>(endpoint.path, params);
          
          if (response.results && response.results.length > 0) {
            allMovies.push(...response.results);
            console.log(`[getDiverseMoviePool] Fetched ${response.results.length} movies from ${endpoint.path} page ${page}`);
          }
        } catch (error) {
          console.error(`[getDiverseMoviePool] Error fetching from ${endpoint.path}:`, error);
          // Continue with other endpoints even if one fails
        }
      }
    }
    
    // Remove duplicates (same movie ID)
    const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
    console.log(`[getDiverseMoviePool] Collected ${uniqueMovies.length} unique movies from all endpoints`);
    
    // Shuffle the movies for even more randomness
    const shuffledMovies = uniqueMovies.sort(() => Math.random() - 0.5);
    
    // Take the requested number of movies
    const selectedMovies = shuffledMovies.slice(0, count);
    
    // Fetch keywords for the selected movies
    console.log(`[getDiverseMoviePool] Fetching keywords for ${selectedMovies.length} selected movies...`);
    const moviesWithKeywords = await Promise.all(
      selectedMovies.map(async (movie) => {
        try {
          const keywords = await this.getMovieKeywords(movie.id);
          return {
            ...movie,
            keywords: keywords,
          };
        } catch (error) {
          console.error(`[getDiverseMoviePool] Error fetching keywords for movie ID ${movie.id}:`, error);
          return {
            ...movie,
            keywords: [],
          };
        }
      })
    );
    
    console.log(`[getDiverseMoviePool] Finished fetching keywords. Returning ${moviesWithKeywords.length} diverse movies.`);
    return moviesWithKeywords;
  }

  /**
   * Get top rated movies (now enhanced to return a diverse set of movies)
   * @deprecated Use getDiverseMoviePool instead for more variety
   */
  async getTopRatedMovies(_page: number = 1): Promise<Movie[]> {
    console.log(`[getTopRatedMovies] Now using diverse movie pool instead of just top rated...`);
    return this.getDiverseMoviePool(20); // Return a diverse set of movies instead
  }
}

export const tmdbService = new TMDBService();