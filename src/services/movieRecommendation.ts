import { Movie, DirectorDetails } from '../types/tmdb';

export interface DirectorPreferenceProfile {
  visualStyles: { [key: string]: number };
  narrativeStyles: { [key: string]: number };
  eras: { [key: string]: number };
  themes: { [key: string]: number };
  favoredDirectors: Set<number>;
}

export interface MovieScore {
  movie: Movie;
  score: number;
  matchReasons: string[];
}

export class MovieRecommendationService {
  private readonly QUESTION_TYPE_MAPPINGS = {
    'visual_style': 'visualStyles',
    'visual_tone': 'visualStyles',
    'cultural_approach': 'themes',
    'time_structure': 'narrativeStyles',
    'sound_approach': 'themes',
    'character_approach': 'narrativeStyles',
    'era': 'eras',  // Added this
  } as const;

  updatePreferences(
    currentPreferences: DirectorPreferenceProfile | null,
    answer: any,
    questionType: string
  ): DirectorPreferenceProfile {
    const preferences = currentPreferences || this.initializePreferenceProfile();
    
    // Update based on director if present
    if (answer.director) {
      preferences.favoredDirectors.add(answer.director.id);
      
      const firstMovie = answer.director.directed_movies[answer.director.directed_movies.length - 1];
      if (firstMovie) {
        const era = this.getEraFromYear(new Date(firstMovie.release_date).getFullYear());
        preferences.eras[era] = (preferences.eras[era] || 0) + 1;
      }
    }

    // Update based on directorial style preferences
    if (answer.directorialStyle) {
      const preferenceCategory = this.QUESTION_TYPE_MAPPINGS[questionType as keyof typeof this.QUESTION_TYPE_MAPPINGS];
      
      if (preferenceCategory) {
        answer.directorialStyle.forEach((style: string) => {
          preferences[preferenceCategory][style] = (preferences[preferenceCategory][style] || 0) + 1;
        });
      }

      // Handle special cases
      if (questionType === 'cultural_approach') {
        answer.directorialStyle.forEach((style: string) => {
          if (style === 'genre_blending') {
            preferences.narrativeStyles[style] = (preferences.narrativeStyles[style] || 0) + 1;
          }
        });
      }
    }

    return preferences;
  }

  findMatchingMovies(
    allDirectors: DirectorDetails[],
    preferences: DirectorPreferenceProfile,
    count: number = 8
  ): MovieScore[] {
    // Get all movies from all directors
    const allMovies = allDirectors.flatMap(d => d.directed_movies);
    
    // Score each movie
    const scoredMovies = allMovies.map(movie => 
      this.calculateMovieScore(movie, allDirectors, preferences)
    );

    // Sort by score and return top matches
    return scoredMovies
      .sort((a, b) => b.score - a.score)
      .slice(0, count);
  }
  private initializePreferenceProfile(): DirectorPreferenceProfile {
    return {
      visualStyles: {},
      narrativeStyles: {},
      eras: {},
      themes: {},
      favoredDirectors: new Set()
    };
  }

  private calculateMovieScore(
    movie: Movie, 
    allDirectors: DirectorDetails[],
    preferences: DirectorPreferenceProfile
  ): MovieScore {
    let score = 0;
    const matchReasons: string[] = [];

    // Find the director of this movie
    const director = allDirectors.find(d => 
      d.directed_movies.some(m => m.id === movie.id)
    );

    if (director) {
      // Check if it's by a favored director
      if (preferences.favoredDirectors.has(director.id)) {
        score += 1;
        matchReasons.push(`Directed by ${director.name}, whose style you appreciate`);
      }

      // Check era preference
      const movieYear = new Date(movie.release_date).getFullYear();
      const era = this.getEraFromYear(movieYear);
      if (preferences.eras[era]) {
        score += preferences.eras[era] * 0.5;
        matchReasons.push(`From the ${era}, a period you showed interest in`);
      }

      // Match visual and narrative styles based on genres
      const styleScore = this.calculateStyleScore(movie, preferences);
      score += styleScore.score;
      matchReasons.push(...styleScore.reasons);
    }

    // Quality bonus
    if (movie.vote_average >= 7.5 && movie.vote_count > 500) {
      score += 1;
      matchReasons.push('Highly acclaimed by audiences and critics');
    }

    // Diversity bonus (avoid recommending too similar movies)
    if (!this.hasCommonGenres(movie, matchReasons)) {
      score += 0.5;
      matchReasons.push('Offers a fresh perspective in your recommendations');
    }

    return {
      movie,
      score,
      matchReasons: [...new Set(matchReasons)]
    };
  }
  private getEraFromYear(year: number): string {
    if (year < 1970) return 'Classic Era';
    if (year < 1990) return 'New Hollywood';
    if (year < 2010) return 'Modern';
    return 'Contemporary';
  }
  
  private hasCommonGenres(movie: Movie, existingReasons: string[]): boolean {
    const genreStrings = existingReasons.filter(r => r.includes('Features') || r.includes('strong'));
    const movieGenres = new Set(movie.genres.map(g => g.name.toLowerCase()));
    
    return genreStrings.some(reason => 
      Array.from(movieGenres).some(genre => 
        reason.toLowerCase().includes(genre.toLowerCase())
      )
    );
  }

private calculateStyleScore(
  movie: Movie,
  preferences: DirectorPreferenceProfile
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const genres = new Set(movie.genres.map(g => g.name));

  // Visual Style Preferences
  if (preferences.visualStyles) {
    // Symmetrical/Meticulous/Controlled
    if (preferences.visualStyles['symmetrical'] || 
        preferences.visualStyles['meticulous'] || 
        preferences.visualStyles['controlled']) {
      if ((genres.has('Drama') || genres.has('Animation')) && movie.vote_average >= 7.5) {
        score += 1.5;
        reasons.push('Features meticulous visual composition');
      }
    }

    // Naturalistic/Observational/Intimate
    if (preferences.visualStyles['naturalistic'] || 
        preferences.visualStyles['observational'] || 
        preferences.visualStyles['intimate']) {
      if (genres.has('Documentary') || (genres.has('Drama') && !genres.has('Fantasy'))) {
        score += 1.5;
        reasons.push('Uses naturalistic, observational style');
      }
    }

    // Poetic/Atmospheric/Ethereal
    if (preferences.visualStyles['poetic'] || 
        preferences.visualStyles['atmospheric'] || 
        preferences.visualStyles['ethereal']) {
      if (genres.has('Fantasy') || genres.has('Drama')) {
        score += 1.5;
        if (movie.vote_average >= 7.5) score += 0.5;
        reasons.push('Creates poetic, atmospheric visuals');
      }
    }

    // Kinetic/Dynamic/Innovative
    if (preferences.visualStyles['kinetic'] || 
        preferences.visualStyles['dynamic'] || 
        preferences.visualStyles['innovative']) {
      if (genres.has('Action') || genres.has('Thriller')) {
        score += 1.5;
        reasons.push('Features dynamic visual storytelling');
      }
    }

    // Vibrant/Saturated/Expressive
    if (preferences.visualStyles['vibrant'] || 
        preferences.visualStyles['saturated'] || 
        preferences.visualStyles['expressive']) {
      if (genres.has('Animation') || genres.has('Fantasy')) {
        score += 1.5;
        reasons.push('Rich, vibrant visual palette');
      }
    }

    // Noir/Contrast/Shadows
    if (preferences.visualStyles['noir'] || 
        preferences.visualStyles['contrast'] || 
        preferences.visualStyles['shadows']) {
      if (genres.has('Thriller') || genres.has('Crime')) {
        score += 1.5;
        if (genres.has('Film-Noir')) score += 1.0;
        reasons.push('Noir-influenced visual style');
      }
    }
  }

  // Narrative Style Preferences
  if (preferences.narrativeStyles) {
    // Nonlinear/Complex/Layered
    if (preferences.narrativeStyles['nonlinear'] || 
        preferences.narrativeStyles['complex'] || 
        preferences.narrativeStyles['layered']) {
      if (genres.has('Mystery') || genres.has('Thriller')) {
        score += 1.5;
        if (movie.genres.length >= 3) score += 0.5;
        reasons.push('Complex, layered narrative structure');
      }
    }

    // Real-time/Immediate/Intense
    if (preferences.narrativeStyles['real_time'] || 
        preferences.narrativeStyles['immediate'] || 
        preferences.narrativeStyles['intense']) {
      if (genres.has('Thriller') || genres.has('Crime')) {
        score += 1.5;
        reasons.push('Immediate, visceral storytelling');
      }
    }

    // Meditative/Contemplative/Slow
    if (preferences.narrativeStyles['meditative'] || 
        preferences.narrativeStyles['contemplative'] || 
        preferences.narrativeStyles['slow']) {
      if (genres.has('Drama') && movie.vote_average >= 7.0) {
        score += 1.5;
        if (!genres.has('Action')) score += 0.5;
        reasons.push('Takes a contemplative approach');
      }
    }

    // Genre-blending/Innovative/Hybrid
    if (preferences.narrativeStyles['genre_blending'] || 
        preferences.narrativeStyles['innovative'] || 
        preferences.narrativeStyles['hybrid']) {
      if (movie.genres.length >= 3) {
        score += 2.0;
        reasons.push('Creative genre fusion');
      }
    }
  }

  // Theme and Sound Preferences
  if (preferences.themes) {
    // Atmospheric/Ambient/Immersive
    if (preferences.themes['atmospheric'] || 
        preferences.themes['ambient'] || 
        preferences.themes['immersive']) {
      if (genres.has('Horror') || genres.has('Science Fiction')) {
        score += 1.5;
        reasons.push('Creates immersive atmosphere');
      }
    }

    // Musical/Scored/Emotional
    if (preferences.themes['musical'] || 
        preferences.themes['scored'] || 
        preferences.themes['emotional']) {
      if (genres.has('Musical') || genres.has('Drama')) {
        score += 1.5;
        if (genres.has('Musical')) score += 1.0;
        reasons.push('Features powerful musical elements');
      }
    }

    // Psychological/Complex/Internal
    if (preferences.themes['psychological'] || 
        preferences.themes['complex'] || 
        preferences.themes['internal']) {
      if (genres.has('Drama') && movie.vote_average >= 7.5) {
        score += 1.5;
        if (genres.has('Thriller')) score += 0.5;
        reasons.push('Deep psychological exploration');
      }
    }

    // Social/Humanist/Observational
    if (preferences.themes['social'] || 
        preferences.themes['humanist'] || 
        preferences.themes['observational']) {
      if (genres.has('Drama') || genres.has('Documentary')) {
        score += 1.5;
        reasons.push('Explores social themes and human experiences');
      }
    }
  }

  // Cultural/Regional weighting with tiered scoring
  if (movie.original_language) {
    const languageRegions = {
      // Tier 1: Major Film Industries
      ja: { name: 'Japanese', weight: 1.0 },
      ko: { name: 'Korean', weight: 1.0 },
      zh: { name: 'Chinese', weight: 1.0 },
      hi: { name: 'Indian', weight: 1.0 },
      fr: { name: 'French', weight: 1.0 },
      
      // Tier 2: Significant Film Industries
      es: { name: 'Spanish', weight: 0.75 },
      it: { name: 'Italian', weight: 0.75 },
      de: { name: 'German', weight: 0.75 },
      
      // Tier 3: Growing Film Industries
      pt: { name: 'Portuguese', weight: 0.5 },
      tr: { name: 'Turkish', weight: 0.5 },
      th: { name: 'Thai', weight: 0.5 },
      fa: { name: 'Persian', weight: 0.5 },
      ar: { name: 'Arabic', weight: 0.5 }
    };

    const region = languageRegions[movie.original_language as keyof typeof languageRegions];
    if (region) {
      score += region.weight;
      reasons.push(`${region.name} cinema`);
    }
  }

  // Quality thresholds with more granular scoring
  if (movie.vote_average >= 7.5 && movie.vote_count > 1000) {
    score += 0.75;
    reasons.push('Highly acclaimed by audiences');
  } else if (movie.vote_average >= 7.0 && movie.vote_count > 500) {
    score += 0.5;
    reasons.push('Well-received by audiences');
  } else if (movie.vote_average >= 6.5 && movie.vote_count > 300) {
    score += 0.25;
    reasons.push('Generally positive reception');
  }

  // Unique combination bonus
  if (score > 2 && reasons.length >= 3) {
    score += 0.5;
    reasons.push('Combines multiple elements you enjoy');
  }

  return { score, reasons: [...new Set(reasons)] };
}
}

export const movieRecommendationService = new MovieRecommendationService();