import { DirectorPreferenceProfile } from './movieRecommendation';

// Interfaces (ensure these match usage)
export interface QuizOption {
  id: number;
  text: string;
  preferenceKey: keyof Omit<DirectorPreferenceProfile, 'eras'>;
  styleKeywords: string[];
}

export interface QuizQuestion {
  id: number;
  type: string; // e.g., 'visualStyle', 'narrativeStyle', 'theme'
  text: string;
  options: QuizOption[];
}

// Define internal types used by the QuizService
interface QuestionTemplate {
  type: string;
  text: string;
  styleOptions: Array<{
    style: string[];
    description: string;
  }>;
}

/**
 * A reusable array of question “templates” for easy extension and modification.
 */
// Additional templates for more variety
const ADDITIONAL_QUESTION_TEMPLATES: QuestionTemplate[] = [
  // Note: World cinema preferences are now integrated into other questions rather than having a dedicated question
  // Film style questions
  {
    type: 'directing_style',
    text: 'Which filmmaking approach do you appreciate most?',
    styleOptions: [
      {
        style: ['auteur', 'personal', 'distinctive', 'french-new-wave'],
        description: 'Directors with a strong personal vision and distinctive stylistic signatures.'
      },
      {
        style: ['technical', 'precise', 'meticulous', 'asian'],
        description: 'Technical perfectionists who craft every frame with meticulous precision.'
      },
      {
        style: ['improvisational', 'spontaneous', 'naturalistic', 'italian-neorealism'],
        description: 'Filmmakers who embrace spontaneity and capture natural, unplanned moments.'
      },
      {
        style: ['collaborative', 'ensemble', 'actor-focused', 'european'],
        description: 'Directors who prioritize performances and collaborative creative processes.'
      },
      {
        style: ['innovative', 'experimental', 'boundary-pushing', 'korean-cinema'],
        description: 'Boundary-pushers who experiment with new techniques and approaches.'
      }
    ]
  },
  {
    type: 'pacing_preference',
    text: 'What kind of pacing do you prefer in films?',
    styleOptions: [
      {
        style: ['deliberate', 'contemplative', 'slow'],
        description: 'Slow, deliberate pacing that allows scenes to breathe and develop naturally.'
      },
      {
        style: ['balanced', 'rhythmic', 'measured'],
        description: 'Well-balanced pacing with a natural rhythm between action and reflection.'
      },
      {
        style: ['energetic', 'dynamic', 'fast'],
        description: 'Quick, energetic pacing that keeps the story moving forward constantly.'
      },
      {
        style: ['tension-building', 'suspenseful', 'escalating'],
        description: 'Gradually escalating tension that builds toward powerful climactic moments.'
      },
      {
        style: ['episodic', 'vignette', 'anthology'],
        description: 'Episodic structure with distinct segments or chapters that form a larger whole.'
      }
    ]
  },
  {
    type: 'dialogue_preference',
    text: 'What type of dialogue resonates with you most?',
    styleOptions: [
      {
        style: ['witty', 'clever', 'sharp'],
        description: 'Sharp, witty dialogue with clever wordplay and rapid exchanges.'
      },
      {
        style: ['naturalistic', 'authentic', 'realistic'],
        description: 'Naturalistic conversations that capture how people really speak.'
      },
      {
        style: ['minimal', 'visual', 'sparse'],
        description: 'Minimal dialogue that lets visuals and actions tell the story.'
      },
      {
        style: ['poetic', 'lyrical', 'philosophical'],
        description: 'Poetic, lyrical dialogue that explores deeper meanings and ideas.'
      },
      {
        style: ['stylized', 'distinctive', 'unique'],
        description: 'Highly stylized dialogue with distinctive rhythms and vocabulary.'
      }
    ]
  },
  {
    type: 'conflict_preference',
    text: 'What kind of conflict or tension draws you into a story?',
    styleOptions: [
      {
        style: ['internal', 'psychological', 'character'],
        description: 'Internal conflicts where characters struggle with their own nature or choices.'
      },
      {
        style: ['interpersonal', 'relationship', 'social'],
        description: 'Tensions between characters and their complex relationships.'
      },
      {
        style: ['societal', 'systemic', 'political'],
        description: 'Conflicts that explore larger social systems and political realities.'
      },
      {
        style: ['existential', 'philosophical', 'cosmic'],
        description: 'Existential struggles against larger forces or questions of meaning.'
      },
      {
        style: ['physical', 'survival', 'action'],
        description: 'Physical conflicts and survival scenarios with tangible stakes.'
      }
    ]
  },
  {
    type: 'ending_preference',
    text: 'What kind of ending tends to stay with you?',
    styleOptions: [
      {
        style: ['ambiguous', 'open-ended', 'interpretive'],
        description: 'Ambiguous endings that leave room for interpretation and discussion.'
      },
      {
        style: ['resolution', 'closure', 'satisfying'],
        description: 'Clear resolutions that provide a sense of closure and satisfaction.'
      },
      {
        style: ['twist', 'surprising', 'revelatory'],
        description: 'Surprising twists that recontextualize everything that came before.'
      },
      {
        style: ['emotional', 'cathartic', 'moving'],
        description: 'Emotional conclusions that provide catharsis and emotional impact.'
      },
      {
        style: ['cyclical', 'thematic', 'reflective'],
        description: 'Cyclical endings that reflect back on the beginning in meaningful ways.'
      }
    ]
  },
  {
    type: 'genre_preference',
    text: 'Which film genre do you find yourself drawn to most often?',
    styleOptions: [
      {
        style: ['sci-fi', 'futuristic', 'technological'],
        description: 'Science fiction that explores future technologies and their impact on humanity.'
      },
      {
        style: ['horror', 'suspense', 'psychological'],
        description: 'Horror and suspense that delves into fear and the darker aspects of human psychology.'
      },
      {
        style: ['drama', 'emotional', 'character-driven'],
        description: 'Character-driven dramas that explore complex human emotions and relationships.'
      },
      {
        style: ['comedy', 'humor', 'satire'],
        description: 'Comedies that make you laugh while often providing social commentary.'
      },
      {
        style: ['action', 'adventure', 'thrilling'],
        description: 'Action-packed adventures with excitement, stunts, and adrenaline.'
      },
      {
        style: ['fantasy', 'magical', 'imaginative'],
        description: 'Fantasy worlds filled with magic, mythical creatures, and extraordinary possibilities.'
      }
    ]
  },
  {
    type: 'narrative_preference',
    text: 'What kind of story structure appeals to you most?',
    styleOptions: [
      {
        style: ['hero-journey', 'transformation', 'quest'],
        description: 'Classic hero journey where a protagonist overcomes challenges and transforms.'
      },
      {
        style: ['ensemble', 'multiple-perspectives', 'interconnected'],
        description: 'Ensemble stories with multiple characters whose lives and stories intertwine.'
      },
      {
        style: ['mystery', 'puzzle', 'revelation'],
        description: 'Mysteries that gradually reveal their secrets, keeping you guessing until the end.'
      },
      {
        style: ['character-study', 'psychological', 'introspective'],
        description: 'Deep character studies that explore the inner workings of complex individuals.'
      },
      {
        style: ['episodic', 'anthology', 'vignette'],
        description: 'Episodic narratives that present a series of connected but distinct stories.'
      }
    ]
  },
  {
    type: 'thematic_interest',
    text: 'Which themes or subjects do you find most compelling in film?',
    styleOptions: [
      {
        style: ['existential', 'philosophical', 'meaning', 'french-new-wave', 'european'],
        description: 'Existential questions about the meaning of life and human existence.'
      },
      {
        style: ['social-justice', 'political', 'activism', 'latin-american', 'political'],
        description: 'Social and political issues that challenge the status quo and advocate for change.'
      },
      {
        style: ['identity', 'self-discovery', 'coming-of-age', 'japanese-cinema', 'contemplative'],
        description: 'Personal journeys of identity formation and self-discovery.'
      },
      {
        style: ['relationships', 'love', 'connection', 'bollywood', 'musical'],
        description: 'The complexities of human relationships, love, and interpersonal connections.'
      },
      {
        style: ['power', 'conflict', 'struggle', 'korean-cinema', 'social-realism'],
        description: 'Power dynamics, conflict, and the struggle against oppressive forces.'
      },
      {
        style: ['mortality', 'loss', 'grief', 'scandinavian', 'minimalist'],
        description: 'Confrontations with mortality, loss, and the process of grief.'
      }
    ]
  },
  {
    type: 'setting_preference',
    text: 'In what kind of setting or world do you prefer stories to unfold?',
    styleOptions: [
      {
        style: ['urban', 'city', 'metropolitan'],
        description: 'Bustling urban environments with their energy, diversity, and hidden corners.'
      },
      {
        style: ['rural', 'small-town', 'pastoral'],
        description: 'Small towns or rural settings where community and tradition shape lives.'
      },
      {
        style: ['historical', 'period', 'past'],
        description: 'Historical periods that transport you to different times and contexts.'
      },
      {
        style: ['futuristic', 'dystopian', 'utopian'],
        description: 'Future worlds that imagine what might become of human civilization.'
      },
      {
        style: ['fantastical', 'otherworldly', 'surreal'],
        description: 'Fantastical realms that operate by their own magical or surreal logic.'
      },
      {
        style: ['intimate', 'confined', 'minimalist'],
        description: 'Intimate, confined spaces where character dynamics intensify.'
      }
    ]
  },
  {
    type: 'emotional_response',
    text: 'What emotional experience do you value most when watching a film?',
    styleOptions: [
      {
        style: ['suspense', 'tension', 'anticipation'],
        description: 'The thrill of suspense and tension that keeps you on the edge of your seat.'
      },
      {
        style: ['catharsis', 'emotional-release', 'moving'],
        description: 'Emotional catharsis that allows you to process deep feelings through art.'
      },
      {
        style: ['intellectual', 'thought-provoking', 'challenging'],
        description: 'Intellectual stimulation that challenges your thinking and perspectives.'
      },
      {
        style: ['escapism', 'entertainment', 'fun'],
        description: 'Pure entertainment that provides escape and enjoyment.'
      },
      {
        style: ['inspiration', 'uplifting', 'hopeful'],
        description: 'Inspiration and hope that affirms positive human potential.'
      },
      {
        style: ['discomfort', 'provocative', 'unsettling'],
        description: 'Provocative discomfort that pushes boundaries and challenges comfort zones.'
      }
    ]
  }
];

const QUESTION_TEMPLATES: QuestionTemplate[] = [
  {
    type: 'visual_style',
    text: 'Which approach to cinematography captivates you most?',
    styleOptions: [
      {
        style: ['symmetrical', 'meticulous', 'controlled', 'japanese-cinema'],
        description: 'Perfect symmetry and geometrically composed frames, where every element is meticulously placed.'
      },
      {
        style: ['naturalistic', 'observational', 'intimate', 'scandinavian'],
        description: 'Raw, intimate camera work that feels like you are witnessing real moments unfold.'
      },
      {
        style: ['poetic', 'atmospheric', 'ethereal', 'asian'],
        description: 'Dreamy, atmospheric visuals where light and shadow tell their own story.'
      },
      {
        style: ['kinetic', 'dynamic', 'innovative', 'hong-kong'],
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
        style: ['metaphorical', 'layered', 'symbolic', 'latin-american', 'magical-realism'],
        description: 'Narratives rich in metaphor and symbolism, where meaning unfolds gradually.'
      },
      {
        style: ['social', 'humanist', 'observational', 'italian-neorealism', 'social-realism'],
        description: 'Intimate portraits of society that reveal universal human experiences.'
      },
      {
        style: ['genre_blending', 'innovative', 'hybrid', 'korean-cinema', 'genre-bending'],
        description: 'Bold mixing of genres and cultural elements to create something unique.'
      },
      {
        style: ['classical', 'archetypal', 'mythological', 'bollywood', 'indian'],
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

// Mapping from question template type to preference profile key
const TEMPLATE_TYPE_TO_PROFILE_KEY: Record<string, keyof Omit<DirectorPreferenceProfile, 'eras'>> = {
  // Original mappings
  'visual_style': 'visualStyles',
  'visual_tone': 'visualStyles',
  'cultural_approach': 'themes',
  'time_structure': 'narrativeStyles',
  'sound_approach': 'themes',
  'character_approach': 'narrativeStyles',
  
  // New mappings for additional templates
  'genre_preference': 'themes',
  'narrative_preference': 'narrativeStyles',
  'thematic_interest': 'themes',
  'setting_preference': 'visualStyles',
  'emotional_response': 'themes',
  'world_cinema_preference': 'themes', // World cinema preference added
  
  // Additional new mappings
  'directing_style': 'visualStyles',
  'pacing_preference': 'narrativeStyles',
  'dialogue_preference': 'narrativeStyles',
  'conflict_preference': 'themes',
  'ending_preference': 'narrativeStyles'
};

export class QuizService {
  /**
   * Generate a dynamic set of quiz questions based on abstract styles and themes.
   * @param questionCount how many questions to generate (default = 5)
   * @param optionCount how many options per question (default = 4)
   */
  generateQuestions(
    questionCount = 5,
    optionCount = 4,
  ): QuizQuestion[] {
    const questions: QuizQuestion[] = [];

    // 1. Combine original and additional templates
    const allTemplates = [...QUESTION_TEMPLATES, ...ADDITIONAL_QUESTION_TEMPLATES];
    
    // 2. Group templates by category to ensure balanced selection
    const visualTemplates = allTemplates.filter(t => 
      TEMPLATE_TYPE_TO_PROFILE_KEY[t.type] === 'visualStyles'
    );
    const narrativeTemplates = allTemplates.filter(t => 
      TEMPLATE_TYPE_TO_PROFILE_KEY[t.type] === 'narrativeStyles'
    );
    const themeTemplates = allTemplates.filter(t => 
      TEMPLATE_TYPE_TO_PROFILE_KEY[t.type] === 'themes'
    );
    
    // 3. Shuffle each category independently
    const shuffledVisual = this.shuffleArray(visualTemplates);
    const shuffledNarrative = this.shuffleArray(narrativeTemplates);
    const shuffledThemes = this.shuffleArray(themeTemplates);
    
    // 4. Calculate how many questions to take from each category
    // Ensure balanced representation with slight emphasis on themes
    const visualCount = Math.floor(questionCount * 0.3);
    const narrativeCount = Math.floor(questionCount * 0.3);
    const themeCount = questionCount - visualCount - narrativeCount;
    
    // 5. Take the calculated number from each category
    const selectedTemplates = [
      ...shuffledVisual.slice(0, visualCount),
      ...shuffledNarrative.slice(0, narrativeCount),
      ...shuffledThemes.slice(0, themeCount)
    ];
    
    // 6. Shuffle the final selection to mix up the categories
    const finalShuffledTemplates = this.shuffleArray(selectedTemplates);
    
    // 7. Generate questions from the balanced, shuffled templates
    for (const template of finalShuffledTemplates) {
      const preferenceKey = TEMPLATE_TYPE_TO_PROFILE_KEY[template.type];
      if (!preferenceKey) {
        console.warn(`No preference key mapping found for question template type: ${template.type}`);
        continue; // Skip this template if no mapping exists
      }

      // For each question, randomly select between 4-5 options to show
      const thisQuestionOptionCount = Math.random() > 0.5 ? optionCount : optionCount + 1;
      
      const question: QuizQuestion = {
        id: questions.length + 1,
        type: template.type,
        text: template.text,
        options: this.generateAbstractStyleOptions(
          template.styleOptions,
          preferenceKey,
          thisQuestionOptionCount
        )
      };
      
      // If we actually ended up with zero valid options, skip adding the question
      if (question.options.length > 0) {
        questions.push(question);
      }
    }

    // 3. Era Questions Removed - Was director-dependent

    // 4. No need to shuffle/slice questions array anymore, shuffling happened at template level
    // const finalQuestionCount = Math.min(questionCount, questions.length);
    // const finalQuestions = this.shuffleArray(questions).slice(0, finalQuestionCount);

    return questions; // Return the generated questions
  }

  /**
   * Generates QuizOptions directly from style definitions without directors.
   */
  private generateAbstractStyleOptions(
    styles: Array<{ style: string[], description: string }>,
    preferenceKey: keyof Omit<DirectorPreferenceProfile, 'eras'>,
    optionCount: number = 4
  ): QuizOption[] {
    const options: QuizOption[] = [];

    // Shuffle the styles to provide variety in options presented
    const shuffledStyles = this.shuffleArray(styles);

    for (const style of shuffledStyles) {
      if (options.length >= optionCount) break;

      options.push({
          id: options.length + 1,
          text: style.description,
          preferenceKey: preferenceKey,
          styleKeywords: style.style
      });
    }
    return options;
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
