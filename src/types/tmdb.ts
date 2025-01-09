// src/types/tmdb.ts
export interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }
  
  export interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    overview: string;
    vote_average: number;
    runtime?: number;
    genres: Array<{ id: number; name: string }>;
    credits?: {
      cast: Cast[];
      crew: any[];
    };
  }
  
  export interface Director {
    id: number;
    name: string;
    biography: string;
    profile_path: string | null;
    known_for_department: string;
    place_of_birth: string | null;
    birthday: string | null;
    deathday: string | null;
  }
  
  export interface DirectorDetails extends Director {
    directed_movies: Movie[];
    total_movies: number;
  }