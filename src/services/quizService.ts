import { DirectorDetails, Movie } from '../types/tmdb';

interface QuizQuestion {
  id: number;
  type: string;
  text: string;
  options: QuizOption[];
}

interface QuizOption {
  id: number;
  text: string;
  directorialStyle: string[];
  director?: DirectorDetails;
  movies?: Movie[];
}

/**
 * Define a base structure for question templates so that
 * you can easily add or remove categories or style sets.
 */
interface QuestionTemplate {
  type: string;
  text: string;
  styleOptions: Array<{
    style: string[];
    description: string;
  }>;
}

interface DirectorScore {
  director: DirectorDetails;
  score: number;
  region: string;
  matchedStyles: string[];
}

/**
 * A reusable array of question “templates” for easy extension and modification.
 */
const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    type: 'visual_style',
    text: 'Which approach to cinematography captivates you most?',
    styleOptions: [
      {
        style: ['symmetrical', 'meticulous', 'controlled'],
        description: 'Perfect symmetry and geometrically composed frames, where every element is meticulously placed.'
      },
      {
        style: ['naturalistic', 'observational', 'intimate'],
        description: 'Raw, intimate camera work that feels like you are witnessing real moments unfold.'
      },
      {
        style: ['poetic', 'atmospheric', 'ethereal'],
        description: 'Dreamy, atmospheric visuals where light and shadow tell their own story.'
      },
      {
        style: ['kinetic', 'dynamic', 'innovative'],
        description: 'Bold, innovative camera movements that make you feel part of the action.'
      }
    ]
  },
  {
    type: 'visual_tone',
    text: 'What kind of visual atmosphere draws you in?',
    styleOptions: [
      {
        style: ['vibrant', 'saturated', 'expressive'],
        description: 'Rich, bold colors that pop off the screen with emotional intensity.'
      },
      {
        style: ['noir', 'contrast', 'shadows'],
        description: 'High contrast images with deep shadows and striking silhouettes.'
      },
      {
        style: ['minimalist', 'muted', 'subtle'],
        description: 'Understated color palettes that create a contemplative mood.'
      },
      {
        style: ['neon', 'stylized', 'bold'],
        description: 'Neon-soaked scenes with striking color choices and stylized visuals.'
      }
    ]
  },
  {
    type: 'cultural_approach',
    text: 'Which storytelling tradition speaks to you?',
    styleOptions: [
      {
        style: ['metaphorical', 'layered', 'symbolic'],
        description: 'Narratives rich in metaphor and symbolism, where meaning unfolds gradually.'
      },
      {
        style: ['social', 'humanist', 'observational'],
        description: 'Intimate portraits of society that reveal universal human experiences.'
      },
      {
        style: ['genre_blending', 'innovative', 'hybrid'],
        description: 'Bold mixing of genres and cultural elements to create something unique.'
      },
      {
        style: ['classical', 'archetypal', 'mythological'],
        description: 'Stories drawing from classical traditions and mythological themes.'
      }
    ]
  },
  {
    type: 'time_structure',
    text: 'How do you prefer time to be handled in storytelling?',
    styleOptions: [
      {
        style: ['nonlinear', 'complex', 'layered'],
        description: 'Complex timelines that weave past and present together like a puzzle.'
      },
      {
        style: ['real_time', 'immediate', 'intense'],
        description: 'Stories that unfold in real-time with immediate, visceral impact.'
      },
      {
        style: ['meditative', 'contemplative', 'slow'],
        description: 'Deliberately paced narratives that give moments room to breathe.'
      },
      {
        style: ['rhythmic', 'dynamic', 'montage'],
        description: 'Dynamic editing that creates a rhythm between different timeframes.'
      }
    ]
  },
  {
    type: 'sound_approach',
    text: 'Which approach to sound and music resonates with you?',
    styleOptions: [
      {
        style: ['atmospheric', 'ambient', 'immersive'],
        description: 'Rich soundscapes where ambient noise builds an immersive world.'
      },
      {
        style: ['musical', 'scored', 'emotional'],
        description: 'Powerful musical scores that heighten emotional impact.'
      },
      {
        style: ['minimalist', 'naturalistic', 'subtle'],
        description: 'Subtle, natural sound design that enhances realism.'
      },
      {
        style: ['experimental', 'innovative', 'bold'],
        description: 'Bold sonic experiments that challenge traditional approaches.'
      }
    ]
  },
  {
    type: 'character_approach',
    text: 'How do you prefer characters to be developed?',
    styleOptions: [
      {
        style: ['psychological', 'complex', 'internal'],
        description: 'Deep psychological explorations of complex inner worlds.'
      },
      {
        style: ['ensemble', 'interconnected', 'social'],
        description: 'Rich ensemble casts where relationships drive the story.'
      },
      {
        style: ['archetypal', 'iconic', 'symbolic'],
        description: 'Iconic characters that embody larger themes or ideas.'
      },
      {
        style: ['naturalistic', 'authentic', 'observed'],
        description: 'Believable portrayals that feel like real people you might know.'
      }
    ]
  }
];

export class QuizService {
  /**
   * Generate a dynamic set of quiz questions using the provided directors.
   * @param directors a list of directors (with their filmographies)
   * @param questionCount how many questions to generate (default = 5)
   * @param optionCount how many options per question (default = 4)
   * @param avoidDirectorRepeats avoid reusing the same director across multiple questions? (default = true)
   */
  generateQuestions(
    directors: DirectorDetails[],
    questionCount = 5,
    optionCount = 4,
    avoidDirectorRepeats = true
  ): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    // Global set of used Director IDs (if we want to avoid repeats across the entire quiz)
    const usedDirectorIdsGlobal = new Set<number>();

    // 1. Create questions from the base config (QUESTION_TEMPLATES).
    //    Each template yields exactly 1 question.
    QUESTION_TEMPLATES.forEach((template) => {
      const question: QuizQuestion = {
        id: questions.length + 1,
        type: template.type,
        text: template.text,
        options: this.generateDirectorStyleOptions(
          directors,
          template.styleOptions,
          optionCount,
          avoidDirectorRepeats,
          usedDirectorIdsGlobal
        )
      };
      // If we actually ended up with zero valid options, skip adding the question
      if (question.options.length > 0) {
        questions.push(question);
      }
    });

    // 2. Dynamically add an "Era" question, if we have enough directors in each group
    const eraGroups = this.groupDirectorsByEra(directors);
    const eraQuestions = this.generateEraQuestions(
      eraGroups,
      optionCount,
      avoidDirectorRepeats,
      usedDirectorIdsGlobal
    );
    questions.push(...eraQuestions);

    // 3. Shuffle and slice to the requested questionCount
    const finalQuestions = this.shuffleArray(questions).slice(0, questionCount);

    return finalQuestions;
  }

  /**
   * Convert an array of style options (like [ { style: [...], description: '...' }, ... ])
   * into a set of QuizOptions, matched to appropriate directors.
   */
  private generateDirectorStyleOptions(
    directors: DirectorDetails[],
    styles: Array<{ style: string[], description: string }>,
    optionCount: number = 4,
    avoidDirectorRepeats: boolean = true,
    usedDirectorIdsGlobal: Set<number> = new Set()
): QuizOption[] {
    const options: QuizOption[] = [];

    for (const style of styles) {
        // Get matching directors using our improved matching function
        const matchedDirectors = this.findDirectorsMatchingStyle(
            directors, 
            style.style,
            usedDirectorIdsGlobal
        );

        if (matchedDirectors.length > 0) {
            // Take the highest scoring director that hasn't been used
            const selectedDirector = matchedDirectors[0].director;
            
            options.push({
                id: options.length + 1,
                text: style.description,
                directorialStyle: style.style,
                director: selectedDirector,
                movies: selectedDirector.directed_movies.slice(0, 2)
            });

            if (avoidDirectorRepeats) {
                usedDirectorIdsGlobal.add(selectedDirector.id);
            }
        }

        if (options.length >= optionCount) break;
    }

    return options;
}

  private getDirectorStyles(director: DirectorDetails): string[] {
    const styles: string[] = [];
    const movies = director.directed_movies;
    const genres = new Set(movies.flatMap(m => m.genres.map(g => g.name)));
    const avgRating = movies.reduce((sum, m) => sum + m.vote_average, 0) / movies.length;
    const hasHighRatings = avgRating >= 7.5;

    // Visual style indicators
    if (movies.some(m => m.runtime && m.runtime > 150)) styles.push('epic');
    if (genres.has('Documentary') || genres.has('Drama')) styles.push('naturalistic');
    if (genres.has('Fantasy') || genres.has('Science Fiction')) styles.push('stylized');
    if (hasHighRatings && genres.has('Drama')) styles.push('refined');

    // Narrative approaches
    if (movies.some(m => m.genres.length >= 3)) styles.push('genre_blending');
    if (genres.has('Thriller') || genres.has('Mystery')) styles.push('suspense');
    if (genres.has('Documentary')) styles.push('observational');
    if (hasHighRatings && movies.length >= 5) styles.push('auteur');

    // Technical preferences
    if (genres.has('Action')) styles.push('dynamic');
    if (genres.has('Animation')) styles.push('visual_innovation');
    
    return styles;
  }

  private areStylesComplementary(directorStyles: string[], questionStyles: string[]): boolean {
    const complementaryPairs = new Map([
      ['naturalistic', ['refined', 'observational']],
      ['stylized', ['epic', 'visual_innovation']],
      ['genre_blending', ['auteur', 'dynamic']],
      ['suspense', ['refined', 'dynamic']],
    ]);

    return directorStyles.some(ds => 
      questionStyles.some(qs => 
        complementaryPairs.get(ds)?.includes(qs) ||
        complementaryPairs.get(qs)?.includes(ds)
      )
    );
  }

  /**
   * Dynamically generate questions based on the directors' first notable film era.
   * If an era group has at least `optionCount` directors, create a question with up to that many directors.
   */
  private generateEraQuestions(
    eraGroups: { [key: string]: DirectorDetails[] },
    optionCount: number,
    avoidDirectorRepeats: boolean,
    usedDirectorIdsGlobal: Set<number>
  ): QuizQuestion[] {
    const eraQuestions: QuizQuestion[] = [];
    Object.entries(eraGroups).forEach(([era, groupDirectors]) => {
      // Filter out directors already used (if we're avoiding repeats)
      if (avoidDirectorRepeats) {
        groupDirectors = groupDirectors.filter(
          (dir) => !usedDirectorIdsGlobal.has(dir.id)
        );
      }

      if (groupDirectors.length >= optionCount) {
        // Example question for this era
        // We'll pick the top `optionCount` or fewer if we want
        const chosenDirectors = groupDirectors.slice(0, optionCount);

        eraQuestions.push({
          id: Math.floor(Math.random() * 10000),
          type: 'era',
          text: `Which ${era} director's approach interests you most?`,
          options: chosenDirectors.map((director, index) => {
            // Mark them as used (if avoiding repeats)
            if (avoidDirectorRepeats) {
              usedDirectorIdsGlobal.add(director.id);
            }
            return {
              id: index + 1,
              text: `${director.name} - Known for ${this.getNotableWorks(director)}`,
              directorialStyle: this.inferDirectorStyle(director),
              director: director,
              movies: director.directed_movies.slice(0, 2)
            };
          })
        });
      }
    });
    return eraQuestions;
  }

  /**
   * Find directors matching a given set of style tags.
   * This includes region-based and filmography-based heuristics.
   */
  private findDirectorsMatchingStyle(
    directors: DirectorDetails[],
    targetStyles: string[],
    excludeDirectorIds: Set<number> = new Set()
  ): DirectorScore[] {
    // First, group directors by region for diversity
    const regionalGroups = this.groupDirectorsByRegion(directors);
    
    // Score each director
    const scoredDirectors = Object.entries(regionalGroups).flatMap(([region, regionDirectors]) =>
      regionDirectors
        .filter(director => !excludeDirectorIds.has(director.id))
        .map(director => {
          const score = this.calculateDirectorStyleScore(director, targetStyles);
          return {
            director,
            score: score.score,
            region,
            matchedStyles: score.matchedStyles
          };
        })
    );
  
    // Sort by score but ensure regional diversity
    return this.diversifyDirectorSelection(scoredDirectors);
  }

  private calculateDirectorStyleScore(
    director: DirectorDetails,
    targetStyles: string[]
  ): { score: number; matchedStyles: string[] } {
    let score = 0;
    const matchedStyles: string[] = [];
    const directorGenres = new Set(
      director.directed_movies.flatMap(m => m.genres.map(g => g.name))
    );
  
    // Base metrics
    const avgRating = director.directed_movies.reduce((sum, m) => sum + m.vote_average, 0) / 
                     director.directed_movies.length || 0;
    const hasMultipleFilms = director.directed_movies.length >= 2;
    const hasHighRatings = avgRating >= 7.0;
    const hasRecognition = director.directed_movies.some(m => 
      m.vote_count >= 500 && m.vote_average >= 6.8
    );
  
    // Match each target style
    targetStyles.forEach(style => {
      switch (style) {
        // Visual Style
        case 'symmetrical':
        case 'meticulous':
        case 'controlled':
          if ((directorGenres.has('Drama') || directorGenres.has('Animation')) && hasHighRatings) {
            score += 2;
            matchedStyles.push(style);
          }
          break;
  
        case 'naturalistic':
        case 'observational':
        case 'intimate':
          if (directorGenres.has('Documentary') || 
              (directorGenres.has('Drama') && !directorGenres.has('Fantasy'))) {
            score += 2;
            matchedStyles.push(style);
          }
          break;
  
        case 'poetic':
        case 'atmospheric':
        case 'ethereal':
          if (directorGenres.has('Fantasy') || directorGenres.has('Drama')) {
            score += 2;
            if (hasHighRatings) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'kinetic':
        case 'dynamic':
        case 'innovative':
          if (directorGenres.has('Action') || directorGenres.has('Thriller')) {
            score += 2;
            if (director.directed_movies.some(m => m.vote_average >= 7.5)) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        // Visual Tone
        case 'vibrant':
        case 'saturated':
        case 'expressive':
          if (directorGenres.has('Animation') || directorGenres.has('Fantasy')) {
            score += 2;
            matchedStyles.push(style);
          }
          break;
  
        case 'noir':
        case 'contrast':
        case 'shadows':
          if (directorGenres.has('Thriller') || directorGenres.has('Crime')) {
            score += 2;
            if (directorGenres.has('Film-Noir')) score += 2;
            matchedStyles.push(style);
          }
          break;
  
        case 'minimalist':
        case 'muted':
        case 'subtle':
          if (directorGenres.has('Drama') && hasHighRatings) {
            score += 2;
            if (!directorGenres.has('Action')) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        // Cultural Approach
        case 'metaphorical':
        case 'layered':
        case 'symbolic':
          if (hasHighRatings && (directorGenres.has('Drama') || directorGenres.has('Art House'))) {
            score += 2;
            if (director.directed_movies.length >= 5) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'social':
        case 'humanist':
          if (directorGenres.has('Drama') || directorGenres.has('Documentary')) {
            score += 2;
            if (hasHighRatings) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'genre_blending':
        case 'hybrid':
          if (director.directed_movies.some(m => m.genres.length >= 3)) {
            score += 3;
            matchedStyles.push(style);
          }
          break;
  
        // Time Structure
        case 'nonlinear':
        case 'complex':
        case 'layered':
          if (hasHighRatings && (directorGenres.has('Mystery') || directorGenres.has('Thriller'))) {
            score += 2;
            if (director.directed_movies.some(m => m.genres.length >= 2)) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'real_time':
        case 'immediate':
        case 'intense':
          if (directorGenres.has('Thriller') || directorGenres.has('Action')) {
            score += 2;
            if (hasHighRatings) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'meditative':
        case 'contemplative':
        case 'slow':
          if (directorGenres.has('Drama') && hasHighRatings) {
            score += 2;
            if (!directorGenres.has('Action')) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        // Sound Approach
        case 'atmospheric':
        case 'ambient':
        case 'immersive':
          if (directorGenres.has('Horror') || directorGenres.has('Science Fiction')) {
            score += 2;
            if (hasHighRatings) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'musical':
        case 'scored':
        case 'emotional':
          if (directorGenres.has('Drama') || directorGenres.has('Musical')) {
            score += 2;
            if (directorGenres.has('Musical')) score += 2;
            matchedStyles.push(style);
          }
          break;
  
        // Character Development
        case 'psychological':
        case 'complex':
        case 'internal':
          if (directorGenres.has('Drama') && hasHighRatings) {
            score += 2;
            if (directorGenres.has('Thriller')) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'ensemble':
        case 'interconnected':
        case 'social':
          if (hasHighRatings && director.directed_movies.some(m => m.vote_average > 7.5)) {
            score += 2;
            if (directorGenres.has('Drama')) score += 1;
            matchedStyles.push(style);
          }
          break;
  
        case 'archetypal':
        case 'iconic':
        case 'symbolic':
          if (hasRecognition && hasHighRatings) {
            score += 2;
            if (directorGenres.has('Fantasy') || directorGenres.has('Science Fiction')) score += 1;
            matchedStyles.push(style);
          }
          break;
      }
    });
  
    // Recognition and consistency bonuses
    if (hasRecognition) score += 1;
    if (hasMultipleFilms && hasHighRatings) score += 1;
  
    return { score, matchedStyles };
  }
  
  private groupDirectorsByRegion(directors: DirectorDetails[]): { [key: string]: DirectorDetails[] } {
    return {
      eastAsia: directors.filter(d => 
        d.place_of_birth?.toLowerCase().match(/japan|korea|china|hong kong|taiwan/)
      ),
      southAsia: directors.filter(d => 
        d.place_of_birth?.toLowerCase().match(/india|pakistan|bangladesh|sri lanka/)
      ),
      latinAmerica: directors.filter(d => 
        d.place_of_birth?.toLowerCase().match(/mexico|brazil|argentina|chile|colombia|peru/)
      ),
      africa: directors.filter(d => 
        d.place_of_birth?.toLowerCase().match(/nigeria|south africa|senegal|kenya|egypt/)
      ),
      middleEast: directors.filter(d => 
        d.place_of_birth?.toLowerCase().match(/iran|turkey|lebanon|israel|uae/)
      ),
      europe: directors.filter(d => 
        d.place_of_birth?.toLowerCase().match(/france|italy|germany|spain|sweden|denmark/)
      ),
      other: directors.filter(d => 
        !d.place_of_birth || 
        d.place_of_birth.toLowerCase().match(/usa|uk|canada|australia/)
      )
    };
  }
  
  private diversifyDirectorSelection(scoredDirectors: DirectorScore[]): DirectorScore[] {
    const result: DirectorScore[] = [];
    const usedRegions = new Set<string>();
    
    // Get top directors from each region first
    ['eastAsia', 'southAsia', 'latinAmerica', 'africa', 'middleEast', 'europe', 'other'].forEach(region => {
      const regionDirectors = scoredDirectors
        .filter(d => d.region === region)
        .sort((a, b) => b.score - a.score);
      
      if (regionDirectors.length > 0) {
        result.push(regionDirectors[0]);
        usedRegions.add(region);
      }
    });
  
    // Fill remaining slots with highest scoring directors
    const remainingDirectors = scoredDirectors
      .filter(d => !result.some(selected => selected.director.id === d.director.id))
      .sort((a, b) => b.score - a.score);
  
    for (const director of remainingDirectors) {
      if (result.length >= 4) break;
      result.push(director);
    }
  
    return result;
  }
  
  private groupDirectorsByEra(directors: DirectorDetails[]): { [key: string]: DirectorDetails[] } {
    const groups: { [key: string]: DirectorDetails[] } = {
      'Global Cinema Classics (Pre-1970)': [],
      'New Waves & Movements (1970s-1980s)': [],
      'International Auteurs (1990s-2000s)': [],
      'Contemporary Visionaries (2010s-Present)': []
    };

    directors.forEach((director) => {
      const sortedMovies = [...director.directed_movies].sort((a, b) =>
        new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
      );

      const firstNotableMovie = sortedMovies.find((m) => m.vote_count >= 100);
      if (!firstNotableMovie) return;

      const firstMovieYear = new Date(firstNotableMovie.release_date).getFullYear();

      if (firstMovieYear < 1970) {
        groups['Global Cinema Classics (Pre-1970)'].push(director);
      } else if (firstMovieYear < 1990) {
        groups['New Waves & Movements (1970s-1980s)'].push(director);
      } else if (firstMovieYear < 2010) {
        groups['International Auteurs (1990s-2000s)'].push(director);
      } else {
        groups['Contemporary Visionaries (2010s-Present)'].push(director);
      }
    });

    return groups;
  }

  /**
   * Infer a set of broad stylistic descriptors for a director, based on their filmography.
   */
  private inferDirectorStyle(director: DirectorDetails): string[] {
    const styles: string[] = [];
    const movies = director.directed_movies;
    const genres = new Set(movies.flatMap(m => m.genres.map(g => g.name)));

    if (genres.has('Drama') && movies.some(m => m.vote_average >= 7.5)) {
      styles.push('character_driven');
    }
    if (genres.has('Science Fiction') || genres.has('Fantasy')) {
      styles.push('visionary');
    }
    if (genres.has('Thriller') || genres.has('Mystery')) {
      styles.push('suspense');
    }
    if (movies.some(m => m.genres.length >= 3)) {
      styles.push('genre_blending');
    }
    if (genres.has('Documentary') || (genres.has('Drama') && !genres.has('Fantasy'))) {
      styles.push('naturalistic');
    }
    if (
      genres.has('Animation') ||
      (genres.has('Fantasy') && movies.some(m => m.vote_average >= 7.5))
    ) {
      styles.push('visual_innovation');
    }

    return styles;
  }

  /**
   * Retrieve up to 2 top-rated movies from the director's filmography.
   */
  private getNotableWorks(director: DirectorDetails): string {
    const topMovies = director.directed_movies
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 2);
    return topMovies.map(m => m.title).join(', ');
  }

  /**
   * Utility to shuffle arrays randomly.
   */
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}

export const quizService = new QuizService();
