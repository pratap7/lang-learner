import { CefrLevel, SkillTag } from "./database.types";

export type ExerciseKind =
  | "multiple_choice"
  | "fill_in_the_blank"
  | "matching_pairs"
  | "sentence_reordering"
  | "translation"
  | "listening"
  | "speaking"
  | "article_selection"
  | "writing_task";

export interface BaseExercise {
  id: string;
  type: ExerciseKind;
  level: "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  skillTag: SkillTag;
  prompt: string;          // English instruction (e.g., "Select the correct formal greeting")
  promptDe?: string;        // Optional German context / stimuli
  explanation: string;      // Detailed pedagogical breakdown shown upon checking
  grammarTip?: string;      // Quick rule badge (e.g., "Capitalize formal 'Sie'")
  xpReward: number;         // Points awarded on first-pass correct answer (e.g., 10-25)
  difficulty: "beginner" | "intermediate" | "advanced";
}

/* 1. Multiple Choice */
export interface MultipleChoiceExercise extends BaseExercise {
  type: "multiple_choice";
  options: {
    id: string;
    text: string;
    translation?: string;
    isCorrect: boolean;
  }[];
}

/* 2. Fill In The Blank */
export interface FillInTheBlankExercise extends BaseExercise {
  type: "fill_in_the_blank";
  sentenceWithBlank: string; // e.g. "Guten Tag, wie ___ Sie?" (or use [blank] placeholder)
  correctAnswer: string | string[]; // Single or acceptable alternates (case-insensitive)
  wordBank?: string[];       // Clickable chips if bank mode
  hint?: string;
}

/* 3. Matching Pairs */
export interface MatchingPairsExercise extends BaseExercise {
  type: "matching_pairs";
  pairs: {
    id: string;
    german: string;
    english: string;
  }[];
}

/* 4. Sentence Reordering (Drag and Drop / Tap token order) */
export interface SentenceReorderingExercise extends BaseExercise {
  type: "sentence_reordering";
  scrambledTokens: string[]; // e.g. ["Ich", "heiße", "Lukas", "und", "komme", "aus", "Berlin"]
  correctSentence: string;   // "Ich heiße Lukas und komme aus Berlin"
  translationEn: string;     // English reference translation
}

/* 5. Translation (Typed input with German accents toolbar) */
export interface TranslationExercise extends BaseExercise {
  type: "translation";
  direction: "en_to_de" | "de_to_en";
  sourceSentence: string;
  acceptedTranslations: string[]; // List of valid German strings
  grammarCheckHints?: string[];
}

/* 6. Listening Comprehension */
export interface ListeningExercise extends BaseExercise {
  type: "listening";
  audioText: string;         // Spoken via Web Speech API 'de-DE'
  playbackRate?: number;     // 1.0 standard, 0.8 slow
  question: string;          // Question in English or German
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

/* 7. Speaking Practice (Web Speech API Recognition) */
export interface SpeakingExercise extends BaseExercise {
  type: "speaking";
  targetPhrase: string;      // The German phrase learner must say
  targetPhonetic?: string;   // e.g. "/ˌentsʃʊldɪɡʊŋ/"
  translationEn: string;
  minimumAccuracyPct?: number; // default 75%
}

/* 8. Article Selection (Der / Die / Das / Den / Dem) */
export interface ArticleSelectionExercise extends BaseExercise {
  type: "article_selection";
  noun: string;              // e.g. "Kaffee", "Milch", "Wasser"
  plural?: string;           // e.g. "die Kaffees"
  translationEn: string;     // e.g. "coffee"
  correctArticle: "der" | "die" | "das";
  caseType?: "nominative" | "accusative" | "dative";
  ruleExplanation: string;   // e.g. "Masculine beverage noun"
}

/* 9. Short Writing Task */
export interface WritingTaskExercise extends BaseExercise {
  type: "writing_task";
  writingPrompt: string;     // Contextual situation
  targetWordCount: { min: number; recommended: number };
  requiredKeywords: string[]; // Words learner must use
  rubrics: string[];         // Checklist criteria
  sampleModelAnswer: string;
}

export type Exercise =
  | MultipleChoiceExercise
  | FillInTheBlankExercise
  | MatchingPairsExercise
  | SentenceReorderingExercise
  | TranslationExercise
  | ListeningExercise
  | SpeakingExercise
  | ArticleSelectionExercise
  | WritingTaskExercise;

export interface MistakeRecord {
  id: string;
  exerciseId: string;
  exerciseType: ExerciseKind;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  reviewCount: number;
}

export interface SessionStats {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  xpEarned: number;
  heartsRemaining: number;
  accuracyPct: number;
  timeSpentSeconds: number;
  streakIncremented: boolean;
}
