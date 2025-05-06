import type { Movie } from '../types/tmdb';
import type { QuizOption } from './quizService';

export interface DirectorPreferenceProfile {
  visualStyles: { [style: string]: number };
  narrativeStyles: { [style: string]: number };
  themes: { [style: string]: number };
  eras?: { [era: string]: number };
}

export interface MovieScore {
  movie: Movie;
  score: number;
}

export class MovieRecommendationService {
  // Style categories for organization
  private readonly VISUAL_STYLES = [
    'noir', 'minimalist', 'vibrant', 'surreal', 'gritty', 'stylized', 
    'colorful', 'dark', 'bright', 'animated', 'monochrome', 'saturated',
    'desaturated', 'high-contrast', 'low-contrast', 'dreamy', 'realistic',
    'hand-drawn', 'stop-motion', 'claymation', 'rotoscope', 'cgi'
  ];

  private readonly NARRATIVE_STYLES = [
    'non-linear', 'documentary', 'experimental', 'slow-burn', 'fast-paced',
    'dialogue-driven', 'action-driven', 'character-study', 'ensemble',
    'mockumentary', 'found-footage', 'anthology', 'episodic', 'vignette',
    'stream-of-consciousness', 'unreliable-narrator', 'meta', 'breaking-fourth-wall'
  ];

  private readonly THEMES = [
    'action', 'adventure', 'comedy', 'crime', 'drama', 'fantasy', 'historical',
    'horror', 'mystery', 'romance', 'sci-fi', 'thriller', 'war', 'western',
    'coming-of-age', 'dystopian', 'existential', 'family', 'friendship', 'identity',
    'justice', 'loss', 'love', 'power', 'redemption', 'revenge', 'survival',
    'technology', 'time', 'tragedy', 'transformation', 'violence', 'supernatural',
    'psychological', 'political', 'philosophical', 'musical', 'sports'
  ];

  // Related styles for fuzzy matching
  private readonly STYLE_RELATIONSHIPS: Record<string, string[]> = {
    // Visual styles relationships
    'dark': ['noir', 'gritty', 'desaturated', 'low-contrast'],
    'bright': ['vibrant', 'colorful', 'saturated', 'high-contrast'],
    'stylized': ['surreal', 'animated', 'dreamy', 'hand-drawn', 'stop-motion', 'claymation'],
    'realistic': ['gritty', 'documentary', 'found-footage'],
    
    // Narrative styles relationships
    'fast-paced': ['action-driven', 'thriller', 'adventure'],
    'slow-burn': ['character-study', 'drama', 'psychological'],
    'experimental': ['non-linear', 'surreal', 'stream-of-consciousness', 'meta'],
    
    // Theme relationships
    'action': ['adventure', 'thriller', 'war', 'fast-paced'],
    'drama': ['character-study', 'psychological', 'tragedy'],
    'comedy': ['mockumentary', 'breaking-fourth-wall'],
    'thriller': ['mystery', 'crime', 'psychological', 'suspense'],
    'horror': ['supernatural', 'psychological', 'suspense', 'dark'],
    'sci-fi': ['dystopian', 'technology', 'futuristic', 'space'],
    'romance': ['love', 'drama', 'comedy'],
    'mystery': ['crime', 'thriller', 'suspense', 'detective'],
    'fantasy': ['supernatural', 'magical', 'adventure'],
    'historical': ['period', 'war', 'biography', 'epic'],
  };
  initializePreferenceProfile(): DirectorPreferenceProfile {
    return {
      visualStyles: {},
      narrativeStyles: {},
      themes: {},
      eras: {},
    };
  }

  updatePreferences(
    currentProfile: DirectorPreferenceProfile | null,
    selectedOption: QuizOption,
  ): DirectorPreferenceProfile {
    const profile = currentProfile || this.initializePreferenceProfile();
    const { preferenceKey, styleKeywords } = selectedOption;

    if (!(preferenceKey in profile) || !profile[preferenceKey]) {
      console.warn(`Invalid or uninitialized preference key: ${preferenceKey}`);
      return profile;
    }

    const category = profile[preferenceKey];

    styleKeywords.forEach((keyword: string) => {
      const currentScore = category[keyword] || 0;
      category[keyword] = currentScore + 1;
    });

    return profile;
  }

  findMatchingMovies(
    preferenceProfile: DirectorPreferenceProfile,
    moviePool?: Movie[],
    count = 10
  ): MovieScore[] {
    console.log('[findMatchingMovies] Received User Profile:', JSON.stringify(preferenceProfile, null, 2));
    console.log(`[findMatchingMovies] Received ${moviePool?.length} movies to process.`);

    if (!moviePool || moviePool.length === 0) {
      console.warn(
        'No movie pool provided to findMatchingMovies. Returning empty array. '
        + 'Need to implement movie fetching/selection based on preferences.'
      );
      return [];
    }

    const scoredMovies: MovieScore[] = moviePool
      .map(movie => ({
        movie: movie,
        score: this.calculateMovieScore(movie, preferenceProfile),
      }))
      // .filter(ms => ms.score > 0); // Removed this strict filter

    scoredMovies.sort((a, b) => b.score - a.score);

    if (moviePool.length < 20) { // Avoid excessive logging for large lists
      scoredMovies.forEach(ms => console.log(`[findMatchingMovies] Movie: ${ms.movie.title}, Score: ${ms.score.toFixed(2)}`));
    }

    return scoredMovies.slice(0, count);
  }

  private calculateMovieScore(
    movie: Movie,
    preferenceProfile: DirectorPreferenceProfile
  ): number {
    console.log('\n--- Calculating Score ---');
    console.log('[calculateMovieScore] User Profile:', JSON.stringify(preferenceProfile, null, 2));

    const movieProfile = this.extractStyleProfileFromMovie(movie);
    console.log('[calculateMovieScore] Movie Profile:', JSON.stringify(movieProfile, null, 2));

    let score = 0;
    let debugLog = '';
    
    // Enhanced weights with more nuance
    const weights = {
      // Core style categories
      visualStyles: 1.8,    // Increased visual style importance
      narrativeStyles: 1.6, // Increased narrative style importance
      themes: 1.4,         // Increased theme importance
      eras: 0.6,           // Slight increase for era matching
      
      // Match types
      directMatch: 1.0,    // Full weight for direct matches
      relatedMatch: 0.6,   // Increased weight for related matches
      partialMatch: 0.4,   // New: partial text matching
      
      // Quality factors
      ratingFactor: 0.3,    // Increased from 0.2
      popularityFactor: 0.2, // New: factor for popular but not necessarily highest-rated films
      recencyFactor: 0.15,   // New: slight boost for newer films
      keywordRelevance: 1.2  // New: weight for keyword relevance
    };

    const preferenceKeys = Object.keys(preferenceProfile) as (keyof DirectorPreferenceProfile)[];
    let matchCount = 0; // Track how many matches we find

    // 1. Core style matching with enhanced scoring
    preferenceKeys.forEach(prefKey => {
      const userStyles = preferenceProfile[prefKey];
      const movieStyles = movieProfile[prefKey];
      const categoryWeight = weights[prefKey];

      if (userStyles && movieStyles) {
        // Calculate total preference weight for this category for normalization
        const totalUserWeight = Object.values(userStyles).reduce((sum, val) => sum + val, 0);
        
        Object.keys(userStyles).forEach(style => {
          const userPreferenceStrength = userStyles[style] / Math.max(1, totalUserWeight);
          
          // Direct match - same style exists in both profiles
          if (movieStyles[style]) {
            const styleScore = userPreferenceStrength * categoryWeight * weights.directMatch * movieStyles[style];
            score += styleScore;
            matchCount++;
            debugLog += `${prefKey} Direct Match: ${style} (+${styleScore.toFixed(2)})\n`;
          } 
          // Fuzzy match - look for related styles
          else if (prefKey !== 'eras') { // Don't do fuzzy matching for eras
            const relatedStyles = this.STYLE_RELATIONSHIPS[style] || [];
            let foundRelatedMatch = false;
            
            relatedStyles.forEach(relatedStyle => {
              if (movieStyles[relatedStyle]) {
                const relatedScore = userPreferenceStrength * categoryWeight * weights.relatedMatch * movieStyles[relatedStyle];
                score += relatedScore;
                matchCount++;
                foundRelatedMatch = true;
                debugLog += `${prefKey} Related Match: ${style} → ${relatedStyle} (+${relatedScore.toFixed(2)})\n`;
              }
            });
            
            // If no direct or related match, try partial text matching
            if (!foundRelatedMatch) {
              Object.keys(movieStyles).forEach(movieStyle => {
                // Check if the user style is contained within the movie style or vice versa
                if (movieStyle.includes(style) || style.includes(movieStyle)) {
                  const partialScore = userPreferenceStrength * categoryWeight * weights.partialMatch * movieStyles[movieStyle];
                  score += partialScore;
                  matchCount++;
                  debugLog += `${prefKey} Partial Text Match: ${style} ≈ ${movieStyle} (+${partialScore.toFixed(2)})\n`;
                }
              });
            }
          }
        });
      }
    });

    // 2. Apply quality and relevance factors
    
    // Rating boost - higher for exceptionally well-rated movies
    if (movie.vote_average > 0) {
      // Exponential scaling to reward higher ratings more
      const ratingBoost = weights.ratingFactor * Math.pow((movie.vote_average / 10), 2) * Math.min(1, movie.vote_count / 1000);
      score += ratingBoost;
      debugLog += `Rating Quality: ${movie.vote_average}/10 with ${movie.vote_count} votes (+${ratingBoost.toFixed(2)})\n`;
    }
    
    // Cultural diversity factor - subtly influence scores based on language and style preferences
    const worldCinemaKeywords = [
      'french-new-wave', 'art-film', 'european', 'italian-neorealism', 'social-realism',
      'japanese-cinema', 'contemplative', 'asian', 'korean-cinema', 'genre-bending',
      'bollywood', 'musical', 'indian', 'latin-american', 'magical-realism', 'political',
      'scandinavian', 'minimalist', 'naturalistic', 'hong-kong', 'action', 'kinetic'
    ];
    
    // Count how many world cinema style keywords are in the user's preferences
    let worldCinemaKeywordCount = 0;
    Object.keys(preferenceProfile).forEach(prefKey => {
      const prefSection = preferenceProfile[prefKey as keyof DirectorPreferenceProfile];
      if (prefSection) {
        Object.keys(prefSection).forEach(style => {
          if (worldCinemaKeywords.includes(style)) {
            worldCinemaKeywordCount += prefSection[style];
          }
        });
      }
    });
    
    // Apply a subtle language diversity factor
    if (movie.original_language && movie.original_language !== 'en') {
      // Scale the boost based on how many world cinema keywords were selected
      // This makes the effect more subtle and proportional to user preferences
      const diversityFactor = Math.min(1.0, worldCinemaKeywordCount * 0.1); // Cap at 1.0
      const languageDiversityBoost = 0.8 * diversityFactor;
      
      if (languageDiversityBoost > 0) {
        score += languageDiversityBoost;
        debugLog += `Cultural Diversity: ${movie.original_language} (+${languageDiversityBoost.toFixed(2)})\n`;
      }
    }
    
    // Popularity boost - helps include some mainstream films people might recognize
    // but with diminishing returns to avoid overwhelming with just blockbusters
    if (movie.popularity) {
      // If user has world cinema preferences, reduce the popularity boost
      const popularityFactor = worldCinemaKeywordCount > 0 
        ? weights.popularityFactor * (1 - Math.min(0.5, worldCinemaKeywordCount * 0.05)) // Reduce by up to 50% based on world cinema preference
        : weights.popularityFactor;
      
      const popularityBoost = popularityFactor * Math.min(1, Math.log10(movie.popularity) / 2);
      score += popularityBoost;
      debugLog += `Popularity Boost: ${movie.popularity.toFixed(1)} (+${popularityBoost.toFixed(2)})\n`;
    }
    
    // Recency factor - slight boost for newer films
    if (movie.release_date) {
      const releaseYear = new Date(movie.release_date).getFullYear();
      const currentYear = new Date().getFullYear();
      const yearDiff = Math.max(0, Math.min(20, currentYear - releaseYear)); // Cap at 20 years
      const recencyBoost = weights.recencyFactor * (1 - (yearDiff / 20));
      score += recencyBoost;
      debugLog += `Recency: ${releaseYear} (+${recencyBoost.toFixed(2)})\n`;
    }
    
    // 3. Apply match count adjustment to avoid high scores from just one category
    const categoryCount = preferenceKeys.length;
    const matchDiversity = Math.min(1, matchCount / (categoryCount * 2)); // Expect at least 2 matches per category for full score
    const diversityMultiplier = 0.7 + (0.3 * matchDiversity); // Range from 0.7 to 1.0
    
    // Apply the diversity multiplier
    score *= diversityMultiplier;
    debugLog += `Match Diversity: ${matchCount} matches across ${categoryCount} categories (x${diversityMultiplier.toFixed(2)})\n`;

    console.log('[calculateMovieScore] Debug Log:\n' + debugLog);
    console.log(`[calculateMovieScore] Final Score: ${score.toFixed(2)}`);
    console.log('---------------------------\n');
    return score;
  }

  private keywordStyleMap: { [keyword: string]: { category: keyof DirectorPreferenceProfile; style: string } } = {
    // Visual styles
    'film noir': { category: 'visualStyles', style: 'noir' },
    'noir': { category: 'visualStyles', style: 'noir' },
    'black and white': { category: 'visualStyles', style: 'monochrome' },
    'monochrome': { category: 'visualStyles', style: 'monochrome' },
    'dark': { category: 'visualStyles', style: 'dark' },
    'gritty': { category: 'visualStyles', style: 'gritty' },
    'stylized': { category: 'visualStyles', style: 'stylized' },
    'vibrant': { category: 'visualStyles', style: 'vibrant' },
    'colorful': { category: 'visualStyles', style: 'colorful' },
    'surreal': { category: 'visualStyles', style: 'surreal' },
    'dreamy': { category: 'visualStyles', style: 'dreamy' },
    'minimalist': { category: 'visualStyles', style: 'minimalist' },
    'animation': { category: 'visualStyles', style: 'animated' },
    'animated': { category: 'visualStyles', style: 'animated' },
    'stop motion': { category: 'visualStyles', style: 'stop-motion' },
    'claymation': { category: 'visualStyles', style: 'claymation' },
    'hand-drawn': { category: 'visualStyles', style: 'hand-drawn' },
    'cgi': { category: 'visualStyles', style: 'cgi' },
    'computer animation': { category: 'visualStyles', style: 'cgi' },
    'realistic': { category: 'visualStyles', style: 'realistic' },
    'high contrast': { category: 'visualStyles', style: 'high-contrast' },
    'low contrast': { category: 'visualStyles', style: 'low-contrast' },
    'saturated': { category: 'visualStyles', style: 'saturated' },
    'desaturated': { category: 'visualStyles', style: 'desaturated' },
    
    // Narrative styles
    'non-linear': { category: 'narrativeStyles', style: 'non-linear' },
    'non linear': { category: 'narrativeStyles', style: 'non-linear' },
    'nonlinear': { category: 'narrativeStyles', style: 'non-linear' },
    'documentary': { category: 'narrativeStyles', style: 'documentary' },
    'mockumentary': { category: 'narrativeStyles', style: 'mockumentary' },
    'found footage': { category: 'narrativeStyles', style: 'found-footage' },
    'experimental': { category: 'narrativeStyles', style: 'experimental' },
    'avant garde': { category: 'narrativeStyles', style: 'experimental' },
    'slow burn': { category: 'narrativeStyles', style: 'slow-burn' },
    'slow-burn': { category: 'narrativeStyles', style: 'slow-burn' },
    'fast paced': { category: 'narrativeStyles', style: 'fast-paced' },
    'fast-paced': { category: 'narrativeStyles', style: 'fast-paced' },
    'dialogue driven': { category: 'narrativeStyles', style: 'dialogue-driven' },
    'dialogue-driven': { category: 'narrativeStyles', style: 'dialogue-driven' },
    'action driven': { category: 'narrativeStyles', style: 'action-driven' },
    'action-driven': { category: 'narrativeStyles', style: 'action-driven' },
    'character study': { category: 'narrativeStyles', style: 'character-study' },
    'character-study': { category: 'narrativeStyles', style: 'character-study' },
    'ensemble': { category: 'narrativeStyles', style: 'ensemble' },
    'ensemble cast': { category: 'narrativeStyles', style: 'ensemble' },
    'anthology': { category: 'narrativeStyles', style: 'anthology' },
    'episodic': { category: 'narrativeStyles', style: 'episodic' },
    'vignette': { category: 'narrativeStyles', style: 'vignette' },
    'stream of consciousness': { category: 'narrativeStyles', style: 'stream-of-consciousness' },
    'unreliable narrator': { category: 'narrativeStyles', style: 'unreliable-narrator' },
    'meta': { category: 'narrativeStyles', style: 'meta' },
    'breaking the fourth wall': { category: 'narrativeStyles', style: 'breaking-fourth-wall' },
    'fourth wall': { category: 'narrativeStyles', style: 'breaking-fourth-wall' },
    
    // Themes
    'action': { category: 'themes', style: 'action' },
    'adventure': { category: 'themes', style: 'adventure' },
    'comedy': { category: 'themes', style: 'comedy' },
    'crime': { category: 'themes', style: 'crime' },
    'drama': { category: 'themes', style: 'drama' },
    'fantasy': { category: 'themes', style: 'fantasy' },
    'historical': { category: 'themes', style: 'historical' },
    'history': { category: 'themes', style: 'historical' },
    'horror': { category: 'themes', style: 'horror' },
    'mystery': { category: 'themes', style: 'mystery' },
    'romance': { category: 'themes', style: 'romance' },
    'romantic': { category: 'themes', style: 'romance' },
    'sci-fi': { category: 'themes', style: 'sci-fi' },
    'science fiction': { category: 'themes', style: 'sci-fi' },
    'thriller': { category: 'themes', style: 'thriller' },
    'war': { category: 'themes', style: 'war' },
    'western': { category: 'themes', style: 'western' },
    'coming of age': { category: 'themes', style: 'coming-of-age' },
    'coming-of-age': { category: 'themes', style: 'coming-of-age' },
    'dystopian': { category: 'themes', style: 'dystopian' },
    'dystopia': { category: 'themes', style: 'dystopian' },
    'existential': { category: 'themes', style: 'existential' },
    'existentialism': { category: 'themes', style: 'existential' },
    'family': { category: 'themes', style: 'family' },
    'friendship': { category: 'themes', style: 'friendship' },
    'identity': { category: 'themes', style: 'identity' },
    'justice': { category: 'themes', style: 'justice' },
    'loss': { category: 'themes', style: 'loss' },
    'love': { category: 'themes', style: 'love' },
    'power': { category: 'themes', style: 'power' },
    'redemption': { category: 'themes', style: 'redemption' },
    'revenge': { category: 'themes', style: 'revenge' },
    'survival': { category: 'themes', style: 'survival' },
    'technology': { category: 'themes', style: 'technology' },
    'time': { category: 'themes', style: 'time' },
    'tragedy': { category: 'themes', style: 'tragedy' },
    'transformation': { category: 'themes', style: 'transformation' },
    'violence': { category: 'themes', style: 'violence' },
    'supernatural': { category: 'themes', style: 'supernatural' },
    'psychological': { category: 'themes', style: 'psychological' },
    'political': { category: 'themes', style: 'political' },
    'philosophical': { category: 'themes', style: 'philosophical' },
    'musical': { category: 'themes', style: 'musical' },
    'sports': { category: 'themes', style: 'sports' },
    'suspense': { category: 'themes', style: 'thriller' },
    'detective': { category: 'themes', style: 'mystery' },
    'space': { category: 'themes', style: 'sci-fi' },
    'futuristic': { category: 'themes', style: 'sci-fi' },
    'alien': { category: 'themes', style: 'sci-fi' },
    'monster': { category: 'themes', style: 'horror' },
    'ghost': { category: 'themes', style: 'supernatural' },
    'zombie': { category: 'themes', style: 'horror' },
    'vampire': { category: 'themes', style: 'supernatural' },
    'superhero': { category: 'themes', style: 'action' },
    'spy': { category: 'themes', style: 'thriller' },
    'heist': { category: 'themes', style: 'crime' },
    'murder': { category: 'themes', style: 'crime' },
    'police': { category: 'themes', style: 'crime' },
    'military': { category: 'themes', style: 'war' },
    'post-apocalyptic': { category: 'themes', style: 'dystopian' },
    'apocalypse': { category: 'themes', style: 'dystopian' },
    'biography': { category: 'themes', style: 'historical' },
    'based on true story': { category: 'themes', style: 'historical' },
    'period': { category: 'themes', style: 'historical' },
    'period piece': { category: 'themes', style: 'historical' },
    'epic': { category: 'themes', style: 'historical' },
    'magical': { category: 'themes', style: 'fantasy' },
    'magic': { category: 'themes', style: 'fantasy' },
    'space opera': { category: 'themes', style: 'sci-fi' },
  };

  private genreStyleMap: { [genreId: number]: { category: keyof DirectorPreferenceProfile; style: string } } = {
    28: { category: 'themes', style: 'action' }, // Action
    12: { category: 'themes', style: 'adventure' }, // Adventure
    16: { category: 'visualStyles', style: 'animated' }, // Animation
    35: { category: 'themes', style: 'comedy' }, // Comedy
    80: { category: 'themes', style: 'crime' }, // Crime
    99: { category: 'narrativeStyles', style: 'documentary' }, // Documentary
    18: { category: 'themes', style: 'drama' }, // Drama
    10751: { category: 'themes', style: 'family' }, // Family
    14: { category: 'themes', style: 'fantasy' }, // Fantasy
    36: { category: 'themes', style: 'historical' }, // History
    27: { category: 'themes', style: 'horror' }, // Horror
    10402: { category: 'themes', style: 'musical' }, // Music
    9648: { category: 'themes', style: 'mystery' }, // Mystery
    10749: { category: 'themes', style: 'romance' }, // Romance
    878: { category: 'themes', style: 'sci-fi' }, // Science Fiction
    10770: { category: 'themes', style: 'tv-movie' }, // TV Movie
    53: { category: 'themes', style: 'thriller' }, // Thriller
    10752: { category: 'themes', style: 'war' }, // War
    37: { category: 'themes', style: 'western' }, // Western
  };

  extractStyleProfileFromMovie(movie: Movie): DirectorPreferenceProfile {
    console.log(`[extractStyleProfileFromMovie] Processing Movie: ${movie.title} (ID: ${movie.id})`);

    const profile: DirectorPreferenceProfile = {
      visualStyles: {},
      narrativeStyles: {},
      themes: {},
      eras: {}
    };

    // 1. Extract Era from Release Date
    if (movie.release_date) {
      const year = parseInt(movie.release_date.substring(0, 4), 10);
      if (!isNaN(year)) {
        const decade = Math.floor(year / 10) * 10;
        profile.eras = profile.eras || {};
        profile.eras[`${decade}s`] = 1;
      }
    }

    // 2. Extract Styles from Genres
    // Use movie.genres which is an array of {id, name} objects
    movie.genres?.forEach((genre: { id: number; name: string }) => {
      const mapping = this.genreStyleMap[genre.id];
      if (mapping) {
        const { category, style } = mapping;
        if (profile[category]) { // Ensure category exists
           profile[category][style] = (profile[category][style] || 0) + 0.7; // Increased weight for genre match
        }
      }
      
      // Also map genre names directly to themes when possible
      const genreLower = genre.name.toLowerCase();
      if (this.THEMES.includes(genreLower)) {
        profile.themes[genreLower] = (profile.themes[genreLower] || 0) + 0.8;
      }
    });

    // 3. Extract Styles from Keywords (Assuming movie.keywords is populated)
    if (Array.isArray(movie.keywords)) {
      movie.keywords.forEach((keyword: { id: number; name: string }) => {
        const keywordLower = keyword.name.toLowerCase();
        const mapping = this.keywordStyleMap[keywordLower];
        if (mapping) {
          const { category, style } = mapping;
          if (profile[category]) { // Ensure category exists
             profile[category][style] = (profile[category][style] || 0) + 1.2; // Increased weight for keyword match
          }
        } else {
          // Try to match with our style categories directly
          if (this.VISUAL_STYLES.includes(keywordLower)) {
            profile.visualStyles[keywordLower] = (profile.visualStyles[keywordLower] || 0) + 1;
          } else if (this.NARRATIVE_STYLES.includes(keywordLower)) {
            profile.narrativeStyles[keywordLower] = (profile.narrativeStyles[keywordLower] || 0) + 1;
          } else if (this.THEMES.includes(keywordLower)) {
            profile.themes[keywordLower] = (profile.themes[keywordLower] || 0) + 1;
          }
          
          // Optional: Log unmapped keywords for future improvement
          // console.log(`[extractStyleProfileFromMovie] Unmapped keyword: ${keyword.name}`);
        }
      });
    }
    
    // 4. Extract styles from title and overview
    const textToAnalyze = `${movie.title} ${movie.overview}`.toLowerCase();
    
    // Check for visual styles in text
    this.VISUAL_STYLES.forEach(style => {
      if (textToAnalyze.includes(style)) {
        profile.visualStyles[style] = (profile.visualStyles[style] || 0) + 0.3;
      }
    });
    
    // Check for narrative styles in text
    this.NARRATIVE_STYLES.forEach(style => {
      if (textToAnalyze.includes(style)) {
        profile.narrativeStyles[style] = (profile.narrativeStyles[style] || 0) + 0.3;
      }
    });
    
    // Check for themes in text
    this.THEMES.forEach(theme => {
      if (textToAnalyze.includes(theme)) {
        profile.themes[theme] = (profile.themes[theme] || 0) + 0.3;
      }
    });

    console.log('[extractStyleProfileFromMovie] Extracted Profile:', JSON.stringify(profile, null, 2));
    return profile;
  }

  normalizePreferenceScores(profile: DirectorPreferenceProfile): DirectorPreferenceProfile {
    Object.keys(profile).forEach(key => {
      const prefKey = key as keyof DirectorPreferenceProfile;
      if (prefKey === 'eras') return;

      const category = profile[prefKey];
      if (!category || typeof category !== 'object' || Array.isArray(category)) return;

      const totalScore = Object.values(category).reduce((sum, score) => sum + (score || 0), 0);

      if (totalScore > 0) {
        Object.keys(category).forEach((style: string) => {
          category[style] = (category[style] || 0) / totalScore;
        });
      }
    });
    return profile;
  }
}