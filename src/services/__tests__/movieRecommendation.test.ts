// d:\auteur-eye\src\services\__tests__\movieRecommendation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MovieRecommendationService, DirectorPreferenceProfile } from '../movieRecommendation';
import type { Movie } from '../../types/tmdb'; 
import type { QuizOption } from '../quizService';

// Mock QuizService
vi.mock('../quizService');

// Sample Movie Data (Simplified)
const mockMovie1: Movie = {
  id: 1,
  title: 'Action Movie 1',
  release_date: '2023-01-01',
  genres: [{ id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }],
  vote_average: 7.5,
  vote_count: 1000,
  original_language: 'en',
  poster_path: null, 
  overview: '', 
  keywords: []
};
const mockMovie2: Movie = {
  id: 2,
  title: 'Sci-Fi Epic',
  release_date: '2021-05-15',
  genres: [{ id: 878, name: 'Science Fiction' }, { id: 18, name: 'Drama' }],
  vote_average: 8.2,
  vote_count: 5000,
  original_language: 'en',
  poster_path: null, 
  overview: '', 
  keywords: [{ id: 1, name: 'space' }, { id: 2, name: 'future' }]
};

// Mock QuizOption
const mockQuizOption: QuizOption = {
  id: 1,
  text: 'Visually stunning sci-fi worlds',
  preferenceKey: 'visualStyles',
  styleKeywords: ['sci-fi', 'epic scale']
};

// Mock DirectorPreferenceProfile
let mockProfile: DirectorPreferenceProfile;

describe('MovieRecommendationService', () => {
  let service: MovieRecommendationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MovieRecommendationService();
    mockProfile = service.initializePreferenceProfile(); 
  });

  it('should initialize an empty preference profile', () => {
    expect(mockProfile.visualStyles).toEqual({});
    expect(mockProfile.narrativeStyles).toEqual({});
    expect(mockProfile.themes).toEqual({});
    expect(mockProfile.eras).toEqual({});
  });

  describe('updatePreferences', () => {
    it('should correctly update preferences based on a quiz answer', () => {
      const updatedProfile = service.updatePreferences(mockProfile, mockQuizOption);
      expect(updatedProfile.visualStyles['sci-fi']).toBe(1);
      expect(updatedProfile.visualStyles['epic scale']).toBe(1);
      expect(updatedProfile.narrativeStyles).toEqual({});
    });

    it('should increment scores for existing keywords', () => {
      let updatedProfile = service.updatePreferences(mockProfile, mockQuizOption);
      updatedProfile = service.updatePreferences(updatedProfile, mockQuizOption);
      expect(updatedProfile.visualStyles['sci-fi']).toBe(2);
      expect(updatedProfile.visualStyles['epic scale']).toBe(2);
    });

    it('should handle different preference keys', () => {
      const themeOption: QuizOption = {
        id: 2, text: 'Philosophical themes',
        preferenceKey: 'themes',
        styleKeywords: ['philosophy', 'existential']
      };
      const updatedProfile = service.updatePreferences(mockProfile, themeOption);
      expect(updatedProfile.themes['philosophy']).toBe(1);
      expect(updatedProfile.themes['existential']).toBe(1);
      expect(updatedProfile.visualStyles).toEqual({});
    });

    it('should return the current profile if the preference key is invalid', () => {
       const invalidOption = {
         id: 3, text: 'Invalid Option',
         preferenceKey: 'invalidCategory' as any,
         styleKeywords: ['test']
       } as QuizOption;
       const profileBefore = JSON.parse(JSON.stringify(mockProfile));
       const updatedProfile = service.updatePreferences(mockProfile, invalidOption);
       expect(updatedProfile).toEqual(profileBefore);
    });
  });

  describe('extractStyleProfileFromMovie', () => {
      it('should extract genres into narrativeStyles', () => {
          const profile = (service as any).extractStyleProfileFromMovie(mockMovie1);
          expect(profile.narrativeStyles['action']).toBe(1);
          expect(profile.narrativeStyles['adventure']).toBe(1);
      });

      it('should extract keywords into themes', () => {
          const movieWithKeywords = { ...mockMovie1, keywords: [{ id: 10, name: 'Superhero' }, { id: 20, name: 'based on comic' }] };
          const profile = (service as any).extractStyleProfileFromMovie(movieWithKeywords);
          expect(profile.themes['superhero']).toBe(1);
          expect(profile.themes['based on comic']).toBe(1);
      });

      it('should extract release year into eras', () => {
          const profile = (service as any).extractStyleProfileFromMovie(mockMovie1); 
          expect(profile.eras['2020s']).toBe(1);
      });

      it('should extract specific keywords into visualStyles', () => {
          const movieWithVisualKeywords = { ...mockMovie2, keywords: [{ id: 30, name: 'black and white' }, { id: 40, name: 'noir' }] };
          const profile = (service as any).extractStyleProfileFromMovie(movieWithVisualKeywords);
          expect(profile.visualStyles['monochromatic']).toBe(2); 
      });

       it('should handle movies with missing data gracefully', () => {
          const minimalMovie: Movie = { id: 99, title: 'Minimal', release_date: '', genres: [], vote_average: 0, vote_count: 0, original_language: '', overview: '', poster_path: null, keywords: [] }; 
          const profile = (service as any).extractStyleProfileFromMovie(minimalMovie);
          expect(profile.narrativeStyles).toEqual({});
          expect(profile.themes).toEqual({});
          expect(profile.eras).toEqual({});
          expect(profile.visualStyles).toEqual({});
       });
  });

  describe('calculateMovieScore', () => {
    const mockMovieForScore: Movie = {
        id: 101, title: 'Sci-Fi Adventure', release_date: '1995-06-15', 
        genres: [{ id: 878, name: 'Science Fiction' }, { id: 12, name: 'Adventure' }], 
        vote_average: 8.0, vote_count: 2000, original_language: 'en', 
        keywords: [{ id: 878, name: 'sci-fi' }, { id: 100, name: 'space opera' }], 
        poster_path: null, 
        overview: '',
    };
    let scoreProfile: DirectorPreferenceProfile;

    beforeEach(() => {
        scoreProfile = service.initializePreferenceProfile(); 
    });

    it('should score correctly based on multiple matching preferences', () => {
        scoreProfile.visualStyles = { 'sci-fi': 2, 'surreal': 1 }; 
        scoreProfile.narrativeStyles = { 'adventure': 1 }; 
        scoreProfile.themes = { 'space opera': 3, 'dystopian': 1 }; 
        scoreProfile.eras = { '1990s': 1, '1970s': 2 }; 

        const extractedMovieProfile: Partial<DirectorPreferenceProfile> = {
            visualStyles: { 'sci-fi': 1 }, 
            narrativeStyles: { 'science fiction': 1, 'adventure': 1 }, 
            themes: { 'space opera': 1 }, 
            eras: { '1990s': 1 } 
        };
        vi.spyOn(service as any, 'extractStyleProfileFromMovie').mockReturnValue(extractedMovieProfile);

        const score = (service as any).calculateMovieScore(mockMovieForScore, scoreProfile);

        expect(score).toBeCloseTo(8.0);

        vi.restoreAllMocks();
    });

    it('should score higher for movies matching preferred styles', () => {
        scoreProfile.visualStyles = { 'colorful': 1 };
        scoreProfile.narrativeStyles = { 'drama': 1 };
        scoreProfile.eras = { '1990s': 1 };

        vi.spyOn(service as any, 'extractStyleProfileFromMovie').mockReturnValue({ 
            visualStyles: { 'colorful': 1 }, 
            narrativeStyles: { 'drama': 1 }, 
            themes: {}, 
            eras: { '1990s': 1 } 
        });

        const score = (service as any).calculateMovieScore(mockMovieForScore, scoreProfile);

        expect(score).toBeCloseTo(3.5);

        vi.restoreAllMocks();
    });

    it('should calculate score as 0 when no preferences match', () => {
        scoreProfile.visualStyles = { 'minimalist': 1 };
        scoreProfile.narrativeStyles = { 'thriller': 1 };
        scoreProfile.themes = { 'romance': 1 };
        scoreProfile.eras = { '1980s': 1 };

        vi.spyOn(service as any, 'extractStyleProfileFromMovie').mockReturnValue({ 
            visualStyles: { 'sci-fi': 1 }, 
            narrativeStyles: { 'adventure': 1 }, 
            themes: { 'space opera': 1 }, 
            eras: { '1990s': 1 } 
        });

        const score = (service as any).calculateMovieScore(mockMovieForScore, scoreProfile);

        expect(score).toBeCloseTo(0);

        vi.restoreAllMocks();
    });

    it('should handle movies with invalid release dates gracefully', () => {
        const movieWithBadDate: Movie = { ...mockMovieForScore, id: 102, release_date: 'invalid-date', overview:'', poster_path:null, keywords: [{ id: 878, name: 'sci-fi' }, { id: 100, name: 'space opera' }] }; 
        scoreProfile.eras = { '1990s': 1 };
        scoreProfile.narrativeStyles = { 'adventure': 1 }; 
        scoreProfile.themes = { 'space opera': 2 }; 

        const extractedBadDateProfile: Partial<DirectorPreferenceProfile> = {
            visualStyles: { 'sci-fi': 1 }, 
            narrativeStyles: { 'science fiction': 1, 'adventure': 1 }, 
            themes: { 'space opera': 1 }, 
            eras: {} 
        };
        vi.spyOn(service as any, 'extractStyleProfileFromMovie').mockReturnValue(extractedBadDateProfile);

        const score = (service as any).calculateMovieScore(movieWithBadDate, scoreProfile);

        expect(score).toBeCloseTo(3.5);

        vi.restoreAllMocks();
    });

  });

  describe('findMatchingMovies', () => {
    it('should return an empty array if moviePool is empty', () => {
      const matches = service.findMatchingMovies(mockProfile, []);
      expect(matches).toEqual([]); 
    });

    it('should return sorted movies based on score', () => {
        const mockCalculateScoreSorted = (movie: Movie, _profile: DirectorPreferenceProfile): number => {
          if (movie.id === mockMovie1.id) return 5;
          if (movie.id === mockMovie2.id) return 10;
          return 0;
        };
        vi.spyOn(service as any, 'calculateMovieScore').mockImplementation(mockCalculateScoreSorted as any);

        const moviePool = [
          {...mockMovie1, keywords: []}, 
          {...mockMovie2, keywords: [{ id: 1, name: 'space' }, { id: 2, name: 'future' }]} 
        ];
        const matches = service.findMatchingMovies(mockProfile, moviePool);

        expect(matches.length).toBe(2);
        expect(matches[0].movie.id).toBe(mockMovie2.id);
        expect(matches[0].score).toBe(10);
        expect(matches[1].movie.id).toBe(mockMovie1.id);
        expect(matches[1].score).toBe(5);

        vi.restoreAllMocks();
    });

    it('should limit results to the specified count', () => {
        vi.spyOn(service as any, 'calculateMovieScore').mockReturnValue(1);
        const moviePool = [
            {...mockMovie1, keywords: []}, 
            {...mockMovie2, keywords: [{ id: 1, name: 'space' }, { id: 2, name: 'future' }]}, 
            {...mockMovie1, id: 3, title:'Movie 3', overview:'', poster_path:null, keywords: []} 
        ];
        const matches = service.findMatchingMovies(mockProfile, moviePool, 2);
        expect(matches.length).toBe(2);
        vi.restoreAllMocks();
    });

     it('should filter out movies with zero score', () => {
        const mockCalculateScoreZero = (movie: Movie, _profile: DirectorPreferenceProfile): number => {
          if (movie.id === mockMovie1.id) return 5;
          if (movie.id === mockMovie2.id) return 0; 
          return 0;
        };
        vi.spyOn(service as any, 'calculateMovieScore').mockImplementation(mockCalculateScoreZero as any);

        const moviePool = [
          {...mockMovie1, keywords: []}, 
          {...mockMovie2, keywords: [{ id: 1, name: 'space' }, { id: 2, name: 'future' }]} 
        ];
        const matches = service.findMatchingMovies(mockProfile, moviePool);

        expect(matches.length).toBe(1);
        expect(matches[0].movie.id).toBe(mockMovie1.id);
        vi.restoreAllMocks();
     });
  });

});
