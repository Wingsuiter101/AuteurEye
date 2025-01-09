// src/services/tmdb.ts
import { Director, DirectorDetails, Movie } from '../types/tmdb';

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

interface PersonCredit {
  id: number;
  job?: string;
  title?: string;
  crew?: Array<{ job: string }>;
  department?: string;
}

class TMDBService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly imageBaseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY;
    this.baseUrl = import.meta.env.VITE_TMDB_API_BASE_URL;
    this.imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
  }

  private async fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const queryParams = new URLSearchParams({
      api_key: this.apiKey,
      language: 'en-US',
      ...params
    });

    const response = await fetch(`${this.baseUrl}${endpoint}?${queryParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`TMDB API Error: ${response.status} - ${errorData.status_message || response.statusText}`);
    }

    return response.json();
  }

  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null;
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
    // TIER 1: Major international cinema directors (historically significant)
    // --------------------------------------------------------------------------
    const majorDirectors = [
      // Japanese Cinema
      906,       // Akira Kurosawa
      608,       // Hayao Miyazaki
      5354,      // Hirokazu Kore-eda
      1424133,   // Ryusuke Hamaguchi
      122807,    // Makoto Shinkai
      119177,    // Mamoru Hosoda
  
      // Korean Cinema
      21684,     // Bong Joon-ho
      578,       // Park Chan-wook (verify ID if needed!)
      // You could also add:
      // 59800,   // Kim Ki-duk (verify ID if needed!)
  
      // Chinese/Hong Kong/Taiwan Cinema
      8346,      // Wong Kar-wai
      13176,     // Ang Lee
      7796,      // Zhang Yimou
      1815310,   // Bi Gan (emerging art-house director, China)
  
      // Indian Cinema
      11710,     // Satyajit Ray
      51767,     // Mani Ratnam
      55040,     // Shekhar Kapur
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
      // Possibly also Mati Diop (Senegal/France) => ID 1376389
  
      // African Cinema
      108635,    // Ousmane Sembène (Senegal)
      // Youssef Chahine (Egypt) => needs ID verification (e.g., 167115)
  
      // Latin American Cinema
      6004,      // Fernando Meirelles (Brazil)
      66965,     // Lucrecia Martel (Argentina)
      1205722,   // Kleber Mendonça Filho (Brazil)
    ];
  
    // --------------------------------------------------------------------------
    // TIER 2: Mainstream directors (commercially successful)
    // --------------------------------------------------------------------------
    const mainstreamDirectors = [
      // Big Hollywood/Mainstream Names
      525,       // Christopher Nolan
      1032,      // Martin Scorsese
      488,       // Steven Spielberg
      108,       // David Fincher (verify if correct for Fincher)
      25829,     // Denis Villeneuve
      40520,     // Alfonso Cuarón
      84039,     // Guillermo del Toro
      138,       // Quentin Tarantino
      2710,      // James Cameron
  
      // More Mainstream
      1496,      // Sam Mendes
      10466,     // Sam Raimi
      55985,     // Taika Waititi
      15217,     // James Wan
      8587,      // Jane Campion (New Zealand)
    ];
  
    // --------------------------------------------------------------------------
    // STEP 1: Fetch mainstream directors (70% of initial pool)
    // --------------------------------------------------------------------------
    await Promise.all(
      mainstreamDirectors.map(async (directorId) => {
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
    // STEP 2: Fetch major international directors
    // --------------------------------------------------------------------------
    await Promise.all(
      majorDirectors.map(async (directorId) => {
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
    // STEP 3: Discover contemporary directors from major film industries
    // --------------------------------------------------------------------------
    const languageGroups = [
      // Tier 1: Major International Cinema
      { language: 'ja', year: 2023, minVotes: 100 }, // Japanese
      { language: 'ko', year: 2023, minVotes: 100 }, // Korean
      { language: 'zh', year: 2023, minVotes: 100 }, // Chinese/HK
      { language: 'hi', year: 2023, minVotes: 100 }, // Hindi
      { language: 'fr', year: 2023, minVotes: 100 }, // French
      { language: 'it', year: 2023, minVotes: 100 }, // Italian
      { language: 'de', year: 2023, minVotes: 100 }, // German
  
      // Tier 2: Additional World Cinema
      { language: 'es', year: 2023, minVotes: 50 }, // Spanish
      { language: 'pt', year: 2023, minVotes: 50 }, // Portuguese
      { language: 'tr', year: 2023, minVotes: 50 }, // Turkish
      { language: 'th', year: 2023, minVotes: 50 }, // Thai
      { language: 'fa', year: 2023, minVotes: 50 }, // Persian
      { language: 'ar', year: 2023, minVotes: 50 }, // Arabic
    ];
  
    for (const { language, year, minVotes } of languageGroups) {
      try {
        const response = await this.fetchFromTMDB<TMDBResponse<any>>('/discover/movie', {
          'primary_release_year': year.toString(),
          'sort_by': 'vote_average.desc',
          'vote_count.gte': minVotes.toString(),
          'with_original_language': language,
          'page': '1'
        });
  
        // We'll examine just the top 2 results from each group
        const moviesWithCredits = await Promise.all(
          response.results.slice(0, 2).map(movie =>
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
        console.error(`Error fetching movies for language ${language}:`, error);
      }
    }
  
    // --------------------------------------------------------------------------
    // STEP 4: Add some additional mainstream directors from recent popular films
    // --------------------------------------------------------------------------
    const popularResponse = await this.fetchFromTMDB<TMDBResponse<any>>('/movie/popular', {
      'page': '1'
    });
  
    const popularMovies = await Promise.all(
      popularResponse.results.slice(0, 5).map(movie =>
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

// Get the array of directors
const directorArray = Array.from(directors.values());
    
// Only validate directors that aren't in our predefined lists
const validatedDirectors = await Promise.all(
  directorArray.map(async (director) => {
    // If director is in our predefined lists, keep them automatically
    if ([...majorDirectors, ...mainstreamDirectors].includes(director.id)) {
      console.log(`✓ Keeping predefined director ${director.name}`);
      return director;
    }

    // Otherwise validate they have enough directed movies
    try {
      const credits = await this.fetchFromTMDB<any>(`/person/${director.id}/movie_credits`);
      const directedMovies = credits.crew?.filter(
        (credit: any) => credit.job === 'Director'
      ) || [];

      if (directedMovies.length > 3) {
        console.log(`✓ Keeping ${director.name} with ${directedMovies.length} directed movies`);
        return director;
      } else {
        console.log(`Filtering out ${director.name} - only directed ${directedMovies.length} movies`);
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
  
          // Only return directors who have actually directed movies
          if (directedMovies.length > 3) {
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
          console.log(`✗ ${person.name} has not directed any movies`);
          return null;
        } catch (error) {
          console.error(`Error checking credits for ${person.name}:`, error);
          return null;
        }
      })
    );
  
    // Filter out null values (non-directors and those with 0 directed films)
    const filteredDirectors = directors.filter((d): d is Director => d !== null);
    console.log(`Found ${filteredDirectors.length} directors with movies`);
    
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
          if (directedMovies.length >= 3) {  // Changed from > 0 to >= 3
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
      const recentMovies = movies.slice(0, 10);
      return recentMovies.reduce((acc, movie) => 
        acc + movie.vote_average, 0) / recentMovies.length;
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
}

export const tmdbService = new TMDBService();