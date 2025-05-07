// src/types/tmdb.ts
// Shared types for TMDB API responses

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
  vote_count: number;
  runtime?: number;
  original_language: string;  
  genres: Array<{ id: number; name: string }>;
  popularity?: number; // Added popularity for enhanced scoring
  credits?: {
    cast: Cast[];
    crew: any[];
  };
  keywords: { id: number; name: string }[]; // Keywords are now always fetched
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
    gender?: number;
}

export interface DirectorDetails extends Director {
    directed_movies: Movie[];
    total_movies: number;
    biography: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface KeywordData {
    id?: number; // Movie ID or keyword ID
    keywords: Keyword[];
}

export interface Keyword {
    id: number;
    name: string;
}