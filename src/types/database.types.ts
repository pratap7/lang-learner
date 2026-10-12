export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LearningReason =
  | 'travel'
  | 'work'
  | 'study'
  | 'exam'
  | 'migration'
  | 'hobby';

export type CefrLevel =
  | 'beginner'
  | 'intermediate'
  | 'not_sure'
  | 'a1'
  | 'a2'
  | 'b1'
  | 'b2'
  | 'c1'
  | 'c2';

export type DailyStudyMinutes = 10 | 20 | 30 | 60;

export type LessonType = 'vocabulary' | 'grammar' | 'dialogue' | 'reading' | 'culture' | 'review';

export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'fill_in_the_blank'
  | 'translate'
  | 'matching'
  | 'matching_pairs'
  | 'speech_listen'
  | 'listening'
  | 'speaking'
  | 'word_order'
  | 'sentence_reordering'
  | 'article_gender'
  | 'article_selection'
  | 'writing_task';

export type SkillTag = 'reading' | 'writing' | 'listening' | 'speaking' | 'grammar' | 'vocabulary';

export type GermanArticle = 'der' | 'die' | 'das';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export type TestType = 'placement' | 'unit_quiz' | 'level_exam' | 'mock_goethe' | 'mock_telc';

export type BadgeCategory = 'onboarding' | 'streak' | 'vocabulary' | 'grammar' | 'test' | 'mastery';

export type XpSource = 'lesson' | 'exercise' | 'flashcard' | 'streak_bonus' | 'test' | 'badge' | 'placement';

export type DailyTaskType = 'complete_lesson' | 'review_cards' | 'earn_xp' | 'practice_pronunciation' | 'perfect_exercise';

/* ─── Domain Models ───────────────────────────────────────────────────────── */

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  learning_reason: LearningReason | null;
  current_level: CefrLevel | null;
  target_level: CefrLevel | null;
  target_exam_date: string | null;
  daily_study_minutes: DailyStudyMinutes;
  onboarding_completed: boolean;
  streak_count: number;
  xp_points: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  target_level: CefrLevel;
  target_exam_name: string | null;
  target_exam_date: string | null;
  daily_study_minutes: DailyStudyMinutes;
  primary_motivation: LearningReason;
  target_completion_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Level {
  code: string;
  order_index: number;
  title: string;
  title_de: string;
  description: string;
  cefr_guided_hours: number;
  official_exam_name: string;
  color_hex: string;
  is_published: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  level_code: string;
  order_index: number;
  slug: string;
  title: string;
  title_de: string;
  description: string | null;
  cefr_topic: string | null;
  icon_name: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  order_index: number;
  slug: string;
  title: string;
  title_de: string;
  type: LessonType;
  summary: string | null;
  xp_reward: number;
  est_minutes: number;
  is_free_tier: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  order_index: number;
  type: ExerciseType;
  prompt: string;
  prompt_de: string | null;
  options: Json | null;
  answer: Json;
  explanation: string;
  grammar_tip: string | null;
  audio_url: string | null;
  skill_tag: SkillTag;
  xp_points: number;
  difficulty_rating: number;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  unit_id: string;
  lesson_id: string | null;
  level_code: string;
  german: string;
  english: string;
  article: GermanArticle | null;
  plural: string | null;
  ipa: string | null;
  part_of_speech: string;
  example_de: string;
  example_en: string;
  audio_url: string | null;
  grammar_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score_pct: number;
  completed_at: string | null;
  last_accessed_at: string;
}

export interface ExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  lesson_id: string | null;
  user_answer: Json;
  is_correct: boolean;
  time_spent_seconds: number;
  created_at: string;
}

export interface SrsReview {
  id: string;
  user_id: string;
  flashcard_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: string;
  last_reviewed_at: string | null;
  last_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface Mistake {
  id: string;
  user_id: string;
  exercise_id: string | null;
  flashcard_id: string | null;
  mistake_type: 'exercise' | 'flashcard';
  mistake_count: number;
  last_mistake_at: string;
  resolved: boolean;
  resolved_at: string | null;
  user_notes: string | null;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  freeze_credits: number;
  last_freeze_used_at: string | null;
  updated_at: string;
}

export interface XpEvent {
  id: string;
  user_id: string;
  amount: number;
  source_type: XpSource;
  source_id: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface DailyTask {
  id: string;
  user_id: string;
  task_date: string;
  task_type: DailyTaskType;
  target_count: number;
  current_count: number;
  is_completed: boolean;
  xp_reward: number;
  completed_at: string | null;
  created_at: string;
}

export interface Badge {
  id: string;
  code: string;
  title: string;
  title_de: string;
  description: string;
  icon_name: string;
  category: BadgeCategory;
  xp_bonus: number;
  requirement_type: string;
  requirement_value: number;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  unlocked_at: string;
}

export interface Test {
  id: string;
  level_code: string | null;
  title: string;
  slug: string;
  test_type: TestType;
  time_limit_minutes: number;
  passing_score_pct: number;
  total_points: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestQuestion {
  id: string;
  test_id: string;
  question_order: number;
  section: SkillTag;
  points: number;
  prompt: string;
  prompt_de: string | null;
  audio_url: string | null;
  options: Json | null;
  correct_answer: Json;
  explanation: string | null;
  created_at: string;
}

export interface TestAttempt {
  id: string;
  user_id: string;
  test_id: string;
  score_pct: number | null;
  total_points_earned: number;
  passed: boolean;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
}

export interface TestAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  user_answer: Json;
  is_correct: boolean;
  points_awarded: number;
  created_at: string;
}

/* ─── Supabase Client Database Generic Schema ────────────────────────────── */

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          learning_reason: LearningReason | null;
          current_level: CefrLevel | null;
          target_level: CefrLevel | null;
          target_exam_date: string | null;
          daily_study_minutes: DailyStudyMinutes;
          onboarding_completed: boolean;
          streak_count: number;
          xp_points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          learning_reason?: LearningReason | null;
          current_level?: CefrLevel | null;
          target_level?: CefrLevel | null;
          target_exam_date?: string | null;
          daily_study_minutes?: DailyStudyMinutes;
          onboarding_completed?: boolean;
          streak_count?: number;
          xp_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          learning_reason?: LearningReason | null;
          current_level?: CefrLevel | null;
          target_level?: CefrLevel | null;
          target_exam_date?: string | null;
          daily_study_minutes?: DailyStudyMinutes;
          onboarding_completed?: boolean;
          streak_count?: number;
          xp_points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      learning_reason_type: LearningReason;
      cefr_level_type: CefrLevel;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
