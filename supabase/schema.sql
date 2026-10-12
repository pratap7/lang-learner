-- ==============================================================================
-- DeutschPfad: Complete PostgreSQL Schema for Supabase with RLS
-- ==============================================================================
-- Author: DeutschPfad Architecture Team
-- Database: PostgreSQL 15+ (Supabase)
-- Domain: German Language Learning Platform (CEFR A1–C2)
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. ENUMS AND CUSTOM DOMAIN TYPES
-- ==============================================================================

DO $$ BEGIN
    CREATE TYPE learning_reason_type AS ENUM (
        'travel', 'work', 'study', 'exam', 'migration', 'hobby'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cefr_code AS ENUM (
        'a1', 'a2', 'b1', 'b2', 'c1', 'c2'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE lesson_type AS ENUM (
        'vocabulary', 'grammar', 'dialogue', 'reading', 'culture', 'review'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE exercise_type AS ENUM (
        'multiple_choice',
        'fill_blank',
        'translate',
        'matching',
        'speech_listen',
        'listening',
        'speaking',
        'word_order',
        'article_gender',
        'writing_task'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE skill_tag_type AS ENUM (
        'reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE german_article AS ENUM (
        'der', 'die', 'das'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE test_type_enum AS ENUM (
        'placement', 'unit_quiz', 'level_exam', 'mock_goethe', 'mock_telc'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE progress_status AS ENUM (
        'not_started', 'in_progress', 'completed'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE badge_category AS ENUM (
        'onboarding', 'streak', 'vocabulary', 'grammar', 'test', 'mastery'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE xp_source AS ENUM (
        'lesson', 'exercise', 'flashcard', 'streak_bonus', 'test', 'badge', 'placement'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE daily_task_type AS ENUM (
        'complete_lesson', 'review_cards', 'earn_xp', 'practice_pronunciation', 'perfect_exercise'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ==============================================================================
-- 2. CORE USER PROFILES & SETTINGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    learning_reason learning_reason_type DEFAULT 'work',
    current_level cefr_code DEFAULT 'a1',
    target_level cefr_code DEFAULT 'b1',
    daily_study_minutes INTEGER DEFAULT 20 CHECK (daily_study_minutes IN (10, 20, 30, 60)),
    onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
    streak_count INTEGER DEFAULT 0 NOT NULL,
    xp_points INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- User learning goals table (multiple target milestones or specific exam targets)
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    target_level cefr_code NOT NULL DEFAULT 'b1',
    target_exam_name TEXT,               -- e.g. 'Goethe-Zertifikat B1', 'telc Deutsch B2'
    target_exam_date DATE,
    daily_study_minutes INTEGER DEFAULT 20 NOT NULL,
    primary_motivation learning_reason_type DEFAULT 'work',
    target_completion_date DATE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 3. COURSE HIERARCHY & CURRICULUM CONTENT (Read-only for learners)
-- ==============================================================================

-- 3.1 CEFR Levels (A1 to C2)
CREATE TABLE IF NOT EXISTS public.levels (
    code cefr_code PRIMARY KEY,
    order_index INTEGER NOT NULL UNIQUE,
    title TEXT NOT NULL,                  -- e.g. 'A1 · Beginner'
    title_de TEXT NOT NULL,               -- e.g. 'A1 · Anfänger'
    description TEXT NOT NULL,
    cefr_guided_hours INTEGER NOT NULL,  -- e.g. 80, 150, 300
    official_exam_name TEXT NOT NULL,    -- e.g. 'Goethe-Zertifikat A1: Start Deutsch 1'
    color_hex TEXT NOT NULL,             -- e.g. '#10b981'
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3.2 Units within each Level
CREATE TABLE IF NOT EXISTS public.units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_code cefr_code NOT NULL REFERENCES public.levels(code) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,                  -- e.g. 'Greetings & Introductions'
    title_de TEXT NOT NULL,               -- e.g. 'Begrüßung & Kennenlernen'
    description TEXT,
    cefr_topic TEXT,                     -- e.g. 'Everyday Social Contacts'
    icon_name TEXT DEFAULT 'BookOpen',
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(level_code, order_index)
);

-- 3.3 Lessons within each Unit
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,                  -- e.g. 'Articles: Der, Die, Das'
    title_de TEXT NOT NULL,               -- e.g. 'Bestimmte Artikel'
    type lesson_type NOT NULL DEFAULT 'vocabulary',
    summary TEXT,
    xp_reward INTEGER DEFAULT 20 NOT NULL,
    est_minutes INTEGER DEFAULT 15 NOT NULL,
    is_free_tier BOOLEAN DEFAULT TRUE NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(unit_id, order_index)
);

-- 3.4 Interactive Exercises within each Lesson
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    type exercise_type NOT NULL,
    prompt TEXT NOT NULL,                 -- Instruction in English
    prompt_de TEXT,                      -- German stimulus or dialogue snippet
    options JSONB,                       -- Array of options: ["der", "die", "das"] or matching pairs
    answer JSONB NOT NULL,               -- Correct answer format (string, array of strings, or key-value)
    explanation TEXT NOT NULL,           -- Detailed pedagogical explanation in English
    grammar_tip TEXT,                    -- Optional rule pill
    audio_url TEXT,                      -- Native pronunciation audio file
    skill_tag skill_tag_type NOT NULL DEFAULT 'vocabulary',
    xp_points INTEGER DEFAULT 5 NOT NULL,
    difficulty_rating NUMERIC(2,1) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(lesson_id, order_index)
);

-- 3.5 Vocabulary Flashcards (for Spaced Repetition System)
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    level_code cefr_code NOT NULL REFERENCES public.levels(code) ON DELETE RESTRICT,
    german TEXT NOT NULL,                -- e.g. 'Bahnhof'
    english TEXT NOT NULL,               -- e.g. 'train station'
    article german_article,              -- 'der', 'die', or 'das' (NULL for verbs/adjectives)
    plural TEXT,                         -- e.g. 'die Bahnhöfe'
    ipa TEXT,                            -- e.g. '/ˈbaːnˌhoːf/'
    part_of_speech TEXT DEFAULT 'noun',  -- 'noun', 'verb', 'adj', 'adv', 'phrase'
    example_de TEXT NOT NULL,            -- e.g. 'Wo ist der nächste Bahnhof?'
    example_en TEXT NOT NULL,            -- e.g. 'Where is the nearest train station?'
    audio_url TEXT,                      -- Audio pronounciation link
    grammar_note TEXT,                   -- e.g. 'Takes masculine article der; compound noun with -hof'
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- 4. USER PROGRESSION, ATTEMPTS & SRS
-- ==============================================================================

-- 4.1 Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status progress_status DEFAULT 'not_started' NOT NULL,
    score_pct NUMERIC(5,2) DEFAULT 0.00,
    completed_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, lesson_id)
);

-- 4.2 Exercise Attempts (Granular analytics per user response)
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    user_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4.3 Spaced Repetition System (SRS Reviews based on SM-2 Algorithm)
CREATE TABLE IF NOT EXISTS public.srs_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    ease_factor NUMERIC(4,2) DEFAULT 2.50 NOT NULL CHECK (ease_factor >= 1.30),
    interval_days INTEGER DEFAULT 0 NOT NULL,
    repetitions INTEGER DEFAULT 0 NOT NULL,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_reviewed_at TIMESTAMPTZ,
    last_rating INTEGER CHECK (last_rating BETWEEN 1 AND 4), -- 1: Again, 2: Hard, 3: Good, 4: Easy
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, flashcard_id)
);

-- 4.4 User Mistakes Repository (Error notebook for targeted review)
CREATE TABLE IF NOT EXISTS public.mistakes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE,
    flashcard_id UUID REFERENCES public.flashcards(id) ON DELETE CASCADE,
    mistake_type TEXT NOT NULL CHECK (mistake_type IN ('exercise', 'flashcard')),
    mistake_count INTEGER DEFAULT 1 NOT NULL,
    last_mistake_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_at TIMESTAMPTZ,
    user_notes TEXT,
    CONSTRAINT chk_mistake_target CHECK (
        (exercise_id IS NOT NULL AND flashcard_id IS NULL) OR
        (exercise_id IS NULL AND flashcard_id IS NOT NULL)
    ),
    UNIQUE(user_id, exercise_id, flashcard_id)
);

-- ==============================================================================
-- 5. DAILY ENGAGEMENT, HABITS, STREAKS & GAMIFICATION
-- ==============================================================================

-- 5.1 Streaks Ledger
CREATE TABLE IF NOT EXISTS public.streaks (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    longest_streak INTEGER DEFAULT 0 NOT NULL,
    last_activity_date DATE,
    freeze_credits INTEGER DEFAULT 1 NOT NULL, -- Streak protection shields
    last_freeze_used_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5.2 XP Events Ledger (Auditable transaction history of points earned)
CREATE TABLE IF NOT EXISTS public.xp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    source_type xp_source NOT NULL,
    source_id UUID,                     -- Reference to lesson_id, test_id, badge_id, etc.
    metadata JSONB,                     -- Optional details (e.g. { "bonus": "first_try" })
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5.3 Daily Quests / Tasks
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    task_date DATE DEFAULT CURRENT_DATE NOT NULL,
    task_type daily_task_type NOT NULL,
    target_count INTEGER NOT NULL,       -- e.g. 1 lesson, 15 cards, 50 XP
    current_count INTEGER DEFAULT 0 NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    xp_reward INTEGER DEFAULT 15 NOT NULL,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, task_date, task_type)
);

-- 5.4 Badges Catalog
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,          -- e.g. 'streak_7', 'a1_master', 'srs_100'
    title TEXT NOT NULL,                -- e.g. 'Streak Starter'
    title_de TEXT NOT NULL,             -- e.g. 'Erster Schritt'
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL DEFAULT 'Award',
    category badge_category NOT NULL DEFAULT 'mastery',
    xp_bonus INTEGER DEFAULT 50 NOT NULL,
    requirement_type TEXT NOT NULL,     -- e.g. 'streak_days', 'lessons_completed', 'cards_reviewed'
    requirement_value INTEGER NOT NULL, -- e.g. 7, 36, 100
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5.5 User Badges Unlocks
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- ==============================================================================
-- 6. TESTS, EVALUATIONS & MOCK EXAMS
-- ==============================================================================

-- 6.1 Formal Tests (Placement Diagnostics, Unit Quizzes, Mock Goethe Exams)
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_code cefr_code REFERENCES public.levels(code) ON DELETE RESTRICT,
    title TEXT NOT NULL,                -- e.g. 'Adaptive Placement Diagnostic'
    slug TEXT NOT NULL UNIQUE,
    test_type test_type_enum NOT NULL DEFAULT 'unit_quiz',
    time_limit_minutes INTEGER DEFAULT 45,
    passing_score_pct INTEGER DEFAULT 60 NOT NULL,
    total_points INTEGER DEFAULT 100 NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6.2 Test Questions
CREATE TABLE IF NOT EXISTS public.test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    section skill_tag_type NOT NULL DEFAULT 'reading',
    points INTEGER DEFAULT 5 NOT NULL,
    prompt TEXT NOT NULL,
    prompt_de TEXT,
    audio_url TEXT,
    options JSONB,
    correct_answer JSONB NOT NULL,
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(test_id, question_order)
);

-- 6.3 Test Attempts
CREATE TABLE IF NOT EXISTS public.test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
    score_pct NUMERIC(5,2),
    total_points_earned INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER
);

-- 6.4 Test Answers
CREATE TABLE IF NOT EXISTS public.test_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES public.test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.test_questions(id) ON DELETE CASCADE,
    user_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(attempt_id, question_id)
);

-- ==============================================================================
-- 7. PERFORMANCE INDEXES
-- ==============================================================================

-- User Lookups & Foreign Keys
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_level ON public.user_profiles(current_level);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id) WHERE is_active = TRUE;

-- Content Query Performance
CREATE INDEX IF NOT EXISTS idx_units_level_order ON public.units(level_code, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_unit_order ON public.lessons(unit_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_order ON public.exercises(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_flashcards_unit_level ON public.flashcards(unit_id, level_code);
CREATE INDEX IF NOT EXISTS idx_flashcards_lesson_id ON public.flashcards(lesson_id);

-- Learning Activity & SRS Performance
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_lesson ON public.lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_status ON public.lesson_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_ex ON public.exercise_attempts(user_id, exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_created ON public.exercise_attempts(created_at DESC);

-- Spaced Repetition: Fetch cards due for review today efficiently
CREATE INDEX IF NOT EXISTS idx_srs_reviews_due ON public.srs_reviews(user_id, due_date);
CREATE INDEX IF NOT EXISTS idx_srs_reviews_flashcard ON public.srs_reviews(flashcard_id);

-- Mistakes & Review notebook
CREATE INDEX IF NOT EXISTS idx_mistakes_user_resolved ON public.mistakes(user_id, resolved);

-- Engagement, Badges & Streaks
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_date ON public.daily_tasks(user_id, task_date);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_created ON public.xp_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

-- Tests and Attempts
CREATE INDEX IF NOT EXISTS idx_tests_level_type ON public.tests(level_code, test_type);
CREATE INDEX IF NOT EXISTS idx_test_questions_test_order ON public.test_questions(test_id, question_order);
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_test ON public.test_attempts(user_id, test_id);
CREATE INDEX IF NOT EXISTS idx_test_answers_attempt ON public.test_answers(attempt_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across every single table
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srs_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_answers ENABLE ROW LEVEL SECURITY;

-- 8.1 PUBLIC CONTENT TABLES: Read-only for learners (anon + authenticated)
-- Levels
CREATE POLICY "Public levels are readable by everyone" ON public.levels
    FOR SELECT USING (is_published = TRUE);

-- Units
CREATE POLICY "Public units are readable by everyone" ON public.units
    FOR SELECT USING (is_published = TRUE);

-- Lessons
CREATE POLICY "Public lessons are readable by everyone" ON public.lessons
    FOR SELECT USING (is_published = TRUE);

-- Exercises
CREATE POLICY "Exercises are readable by authenticated learners" ON public.exercises
    FOR SELECT USING (true);

-- Flashcards
CREATE POLICY "Flashcards are readable by learners" ON public.flashcards
    FOR SELECT USING (true);

-- Badges Catalog
CREATE POLICY "Badges catalog is readable by everyone" ON public.badges
    FOR SELECT USING (true);

-- Tests
CREATE POLICY "Tests are readable by everyone" ON public.tests
    FOR SELECT USING (is_published = TRUE);

-- Test Questions
CREATE POLICY "Test questions are readable by authenticated users" ON public.test_questions
    FOR SELECT USING (true);

-- 8.2 USER ISOLATION TABLES: Strict auth.uid() = user_id enforcement

-- user_profiles
CREATE POLICY "User can read own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "User can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "User can delete own profile" ON public.user_profiles
    FOR DELETE USING (auth.uid() = id);

-- goals
CREATE POLICY "User can manage own goals" ON public.goals
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- lesson_progress
CREATE POLICY "User can view own lesson progress" ON public.lesson_progress
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can record own lesson progress" ON public.lesson_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own lesson progress" ON public.lesson_progress
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- exercise_attempts
CREATE POLICY "User can view own exercise attempts" ON public.exercise_attempts
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can log own exercise attempts" ON public.exercise_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- srs_reviews
CREATE POLICY "User can view own SRS cards" ON public.srs_reviews
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can initialize SRS cards" ON public.srs_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own SRS ratings" ON public.srs_reviews
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- mistakes
CREATE POLICY "User can manage own error notebook" ON public.mistakes
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- streaks
CREATE POLICY "User can view and update own streaks" ON public.streaks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- xp_events
CREATE POLICY "User can view own XP history" ON public.xp_events
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can record earned XP" ON public.xp_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- daily_tasks
CREATE POLICY "User can view and track daily tasks" ON public.daily_tasks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_badges
CREATE POLICY "User can view own unlocked badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User can earn badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- test_attempts
CREATE POLICY "User can view and manage test attempts" ON public.test_attempts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- test_answers (Checked via attempt's user_id relation)
CREATE POLICY "User can view own test answers" ON public.test_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.test_attempts
            WHERE test_attempts.id = test_answers.attempt_id
            AND test_attempts.user_id = auth.uid()
        )
    );
CREATE POLICY "User can submit test answers" ON public.test_answers
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.test_attempts
            WHERE test_attempts.id = test_answers.attempt_id
            AND test_attempts.user_id = auth.uid()
        )
    );

-- ==============================================================================
-- 9. STORED PROCEDURES, FUNCTIONS & AUTOMATIC TRIGGERS
-- ==============================================================================

-- 9.1 Generic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger across mutable tables
DROP TRIGGER IF EXISTS tr_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER tr_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_goals_updated_at ON public.goals;
CREATE TRIGGER tr_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_units_updated_at ON public.units;
CREATE TRIGGER tr_units_updated_at
    BEFORE UPDATE ON public.units
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_lessons_updated_at ON public.lessons;
CREATE TRIGGER tr_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_exercises_updated_at ON public.exercises;
CREATE TRIGGER tr_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_flashcards_updated_at ON public.flashcards;
CREATE TRIGGER tr_flashcards_updated_at
    BEFORE UPDATE ON public.flashcards
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_srs_reviews_updated_at ON public.srs_reviews;
CREATE TRIGGER tr_srs_reviews_updated_at
    BEFORE UPDATE ON public.srs_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_streaks_updated_at ON public.streaks;
CREATE TRIGGER tr_streaks_updated_at
    BEFORE UPDATE ON public.streaks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_tests_updated_at ON public.tests;
CREATE TRIGGER tr_tests_updated_at
    BEFORE UPDATE ON public.tests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9.2 Auto-provision user profile and streak record when signed up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- 1. Create Profile
    INSERT INTO public.user_profiles (
        id,
        full_name,
        avatar_url,
        onboarding_completed,
        streak_count,
        xp_points
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        FALSE,
        0,
        0
    )
    ON CONFLICT (id) DO NOTHING;

    -- 2. Initialize Streaks Record
    INSERT INTO public.streaks (
        user_id,
        current_streak,
        longest_streak,
        last_activity_date,
        freeze_credits
    )
    VALUES (
        NEW.id,
        0,
        0,
        NULL,
        1
    )
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9.3 Spaced Repetition (SM-2 Algorithm) Calculation Helper
-- Rating scale: 1 = Again (failed), 2 = Hard, 3 = Good, 4 = Easy
CREATE OR REPLACE FUNCTION public.calculate_srs_next_review(
    p_ease_factor NUMERIC,
    p_interval_days INTEGER,
    p_repetitions INTEGER,
    p_rating INTEGER
)
RETURNS TABLE (
    new_ease_factor NUMERIC,
    new_interval_days INTEGER,
    new_repetitions INTEGER,
    new_due_date DATE
) AS $$
DECLARE
    v_ease NUMERIC := p_ease_factor;
    v_interval INTEGER := p_interval_days;
    v_reps INTEGER := p_repetitions;
BEGIN
    IF p_rating < 2 THEN
        -- Card failed: reset repetitions and schedule for immediate tomorrow review
        v_reps := 0;
        v_interval := 1;
    ELSE
        -- Successful recall
        IF v_reps = 0 THEN
            v_interval := 1;
        ELSIF v_reps = 1 THEN
            v_interval := 6;
        ELSE
            v_interval := ROUND(v_interval * v_ease);
        END IF;

        v_reps := v_reps + 1;

        -- Update Ease Factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
        -- Mapping p_rating (2..4) to standard SuperMemo grade (3..5)
        v_ease := v_ease + (0.1 - (5 - (p_rating + 1)) * (0.08 + (5 - (p_rating + 1)) * 0.02));
        IF v_ease < 1.30 THEN
            v_ease := 1.30;
        END IF;
    END IF;

    RETURN QUERY SELECT
        ROUND(v_ease, 2),
        v_interval,
        v_reps,
        (CURRENT_DATE + v_interval * INTERVAL '1 day')::DATE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 9.4 Atomically award XP and sync user_profiles.xp_points
CREATE OR REPLACE FUNCTION public.award_user_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_source xp_source,
    p_source_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_new_xp INTEGER;
BEGIN
    -- Record in transaction ledger
    INSERT INTO public.xp_events (user_id, amount, source_type, source_id, metadata)
    VALUES (p_user_id, p_amount, p_source, p_source_id, p_metadata);

    -- Update aggregate profile total
    UPDATE public.user_profiles
    SET xp_points = xp_points + p_amount
    WHERE id = p_user_id
    RETURNING xp_points INTO v_new_xp;

    RETURN v_new_xp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9.5 Record Daily Activity & Maintain Streak Consistency
CREATE OR REPLACE FUNCTION public.record_user_daily_activity(
    p_user_id UUID
)
RETURNS TABLE (
    current_streak INTEGER,
    streak_extended BOOLEAN
) AS $$
DECLARE
    v_last_date DATE;
    v_cur_streak INTEGER;
    v_longest INTEGER;
    v_extended BOOLEAN := FALSE;
BEGIN
    SELECT last_activity_date, streaks.current_streak, longest_streak
    INTO v_last_date, v_cur_streak, v_longest
    FROM public.streaks
    WHERE user_id = p_user_id;

    IF v_last_date IS NULL THEN
        -- First active day
        v_cur_streak := 1;
        v_longest := 1;
        v_extended := TRUE;
    ELSIF v_last_date = CURRENT_DATE THEN
        -- Already active today, streak maintained
        v_extended := FALSE;
    ELSIF v_last_date = CURRENT_DATE - 1 THEN
        -- Consecutive day
        v_cur_streak := v_cur_streak + 1;
        IF v_cur_streak > v_longest THEN
            v_longest := v_cur_streak;
        END IF;
        v_extended := TRUE;
    ELSE
        -- Streak broken
        v_cur_streak := 1;
        v_extended := TRUE;
    END IF;

    -- Update streak ledger
    UPDATE public.streaks
    SET current_streak = v_cur_streak,
        longest_streak = v_longest,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Sync to user_profiles
    UPDATE public.user_profiles
    SET streak_count = v_cur_streak
    WHERE id = p_user_id;

    RETURN QUERY SELECT v_cur_streak, v_extended;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
