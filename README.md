# DeutschPfad (German Path) 🇩🇪 🇦🇹 🇨🇭

> **Master German from A1 to C2** through structured CEFR curricula, interactive exercise engines, spaced-repetition flashcards, adaptive diagnostic mock tests, and gamified daily habits.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-emerald?style=flat&logo=supabase)](https://supabase.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-29%20Passing-brightgreen?style=flat)]()
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Cached-indigo?style=flat)]()

---

## Table of Contents
1. [Core Features](#core-features)
2. [Technology Stack](#technology-stack)
3. [Architecture & Project Structure](#architecture--project-structure)
4. [Local Development Setup](#local-development-setup)
5. [Automated Testing Suite](#automated-testing-suite)
6. [Security & Row Level Security (RLS)](#security--row-level-security-rls)
7. [Deployment (Vercel + Supabase)](#deployment-vercel--supabase)
8. [Documentation Links](#documentation-links)

---

## Core Features

### 1. CEFR Curriculum & Course Roadmap (`/courses`, `/courses/[level]`)
- Comprehensive coverage across all 6 CEFR bands: **A1, A2, B1, B2, C1, and C2**.
- Visual vertical roadmap with completed, in-progress, and locked nodes.
- Circular progress indicators and personalized "Recommended for you" pathways.

### 2. Deep Interactive Lesson Player (`/lesson/[id]`)
- Multi-step lesson player featuring:
  - **Vocabulary Studio**: Authentic pronunciation, article highlighting (*der / die / das*), and IPA phonetic guides.
  - **Grammar Explanations**: Systematic grammar tables, color-coded genders, and common beginner mistakes.
  - **Dialogue Scenarios**: Realistic conversational dialogues with speaker avatars and line-by-line audio playback.
  - **Cultural Notes**: Deep cultural insights and practical etiquette tips for Germany, Austria, and Switzerland.
  - Next/Previous navigation, bookmarking, and instant XP completion rewards.

### 3. Multi-Modal Exercise Engine (`/practice`)
Supports 10 rich pedagogical modalities:
1. **Multiple Choice** (Single and multi-select)
2. **Article Selection** (*der / die / das* with gender color feedback)
3. **Fill-in-the-Blank** (Typed input and word bank chips)
4. **Matching Pairs** (Interactive German-English connection matrix)
5. **Sentence Reordering** (Verb-second V2 ordering drills)
6. **Translation** (Typed German/English with tolerant grading)
7. **Listening Comprehension** (Web Speech audio stimulus + comprehension check)
8. **Speaking Practice** (Speech recognition recording via Web Speech API)
9. **Short Writing Task** (Email/invitation composition with criteria rubrics)
10. **Mistake Review Drills** (Auto-saved errors reviewed until mastered)

### 4. SM-2 Spaced Repetition Flashcards (`/flashcards`)
- Authentic implementation of the SuperMemo SM-2 algorithm.
- 3D card flip animation, audio pronunciation, and example sentences.
- 4-tier grading: *Again*, *Hard*, *Good*, and *Easy* dynamically updating interval days and ease factors.
- Pre-built curriculum decks plus a custom **"My Words"** deck where learners save words directly from lessons.
- Due cards queue integrated into the dashboard.

### 5. Daily Task Engine & Streak Discipline (`/dashboard`, `/goals`)
- **Daily Task Generator**: Generates 4–6 personalized tasks daily based on the learner's committed daily study minutes.
- **Streak Protection**: Consecutive day tracking, midnight countdowns, and equipped **Streak Freeze** shields protecting against missed days.
- **Activity Visualizer**: 7-day bar chart and 12-week GitHub-style consistency matrix.
- **Goal Trajectory**: Target exam date pacing calculation showing "On Track" or "Behind Target" with projected completion date.

### 6. Diagnostic Testing & Goethe/telc Mock Exams (`/tests`)
- **Adaptive Placement Test**: 25-question dynamic assessment adjusting difficulty from A1 to C1 based on consecutive responses.
- **Unit Quizzes**: 10-question checkpoint quizzes with 70% pass criteria.
- **Full Timed Mock Exams**: Modeled after official Goethe and telc exams (Reading, Listening, Grammar & Vocabulary, Writing, Speaking) with timer countdown, section navigation, question flagging, and auto-submit dialogs.
- **Comprehensive Results Page**: Total score, skill radar chart, question review explanations, and "Retake weak areas" shortcuts.

### 7. Learning Analytics & Mistake Notebook (`/progress`, `/mistakes`)
- CEFR level completion percentages and skill radar charts.
- Study-time weekly trends and historical test score trajectories.
- **Fehlerheft (Mistake Notebook)**: Automatically groups errors by grammar topic (e.g. *Dativ vs. Akkusativ*, *Trennbare Verben*) with a one-click **"Practice these"** customized quiz generator.

### 8. Gamification & UX Polish (`/badges`, `/leaderboard`)
- **XP & 50 Ranks**: Progression curve from *Level 1 (Sprach-Neuling)* to *Level 50 (Sprachlegende)*.
- **24 Milestone Badges**: Streaks, vocabulary volume, grammar mastery, and exam accomplishments.
- **Downloadable Level Completion Certificates**: Official PDF certificates (A1–C2) with dynamic user name, accreditation verification code, seal, and print/save-to-PDF formatting.
- **Opt-In Leaderboard**: Weekly league podium respecting learner privacy with opt-in controls.
- **UX Polish**: Shimmering skeleton loaders, empty states, route error boundaries, and floating toast notifications.

### 9. Accessibility, Dark Mode & Offline PWA
- **Dark Mode**: Persistent dark/light theme switch stored in `localStorage` and applied to root `html`.
- **Keyboard Shortcuts**: Global shortcut cheatsheet accessible via <kbd>?</kbd> (<kbd>Space</kbd> for flashcards, <kbd>1</kbd>–<kbd>4</kbd> for SM-2 ratings, <kbd>A</kbd>–<kbd>D</kbd> for exercises).
- **Progressive Web App (PWA)**: Web app manifest and service worker caching core assets, courses, lessons, and flashcards for offline learning on flights or trains.

---

## Technology Stack

| Domain | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router + Turbopack)](https://nextjs.org/) |
| **Frontend Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling & Design System** | Tailwind CSS v4 + Curated CSS Variables & Glassmorphism |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL 15 + Row Level Security) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) & Canvas Confetti |
| **Charts** | [Recharts](https://recharts.org/) (Radar, Bar, Line charts) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Audio & Speech** | Native Web Speech API (Synthesis & Recognition) |
| **Testing** | Node.js Test Runner (`node:test` + `node:assert/strict`) |

---

## Architecture & Project Structure

```
deutsch-pfad/
├── docs/                           # Documentation, Runbooks & Audits
│   ├── DEPLOYMENT_GUIDE.md         # Vercel & Supabase deployment steps
│   ├── LAUNCH_CHECKLIST.md         # Pre-launch verification checklist
│   └── SECURITY_RLS_AUDIT.md       # RLS and rate limiting security report
├── public/                         # Public static assets & PWA files
│   ├── manifest.json               # Web App Manifest
│   ├── sw.js                       # Service Worker (offline lesson caching)
│   ├── icon-192.svg / icon-512.svg # Brand vector icons
├── src/
│   ├── app/                        # Next.js App Router routes & layouts
│   │   ├── courses/                # /courses and /courses/[level]
│   │   ├── lesson/[id]/            # /lesson/[id] interactive lesson player
│   │   ├── flashcards/             # /flashcards SRS review studio
│   │   ├── practice/               # /practice 10-modality exercise lab
│   │   ├── dashboard/              # /dashboard daily habit command center
│   │   ├── goals/                  # /goals exam pacing configuration
│   │   ├── progress/               # /progress analytics & mistake notebook
│   │   ├── tests/                  # /tests placement, quiz, mock exam player
│   │   ├── badges/                 # /badges 24 achievement gallery & certs
│   │   ├── leaderboard/            # /leaderboard opt-in weekly league
│   │   ├── error.tsx               # Route segment error boundary
│   │   ├── global-error.tsx        # Critical application crash fallback
│   │   └── layout.tsx              # Root layout with fonts, PWA & shortcuts
│   ├── components/                 # Modular React components
│   │   ├── courses/                # Roadmap & level cards
│   │   ├── dashboard/              # Daily tasks, streak flame, heatmaps
│   │   ├── exercise/               # ExerciseEngine (10 modalities)
│   │   ├── flashcards/             # FlashcardStudio (3D flip + SM-2)
│   │   ├── gamification/           # Badges, Leaderboard, Certificates
│   │   ├── lesson/                 # LessonPlayer (Vocab, Grammar, Dialogue)
│   │   ├── pwa/                    # PwaRegister & offline alert
│   │   └── ui/                     # Button, Badge, Modal, Toast, Skeleton, EmptyState
│   ├── data/                       # Authoring JSON schemas & course modules
│   │   ├── courses/                # A1 Unit 3 full curriculum JSON
│   │   └── exercises/              # Exercise authoring schema & sample sets
│   ├── lib/                        # Business logic, services & test suites
│   │   ├── __tests__/              # Unit and E2E test files
│   │   │   ├── sm2.test.ts         # SM-2 algorithm tests
│   │   │   ├── streak.test.ts      # Streak calculation & freeze tests
│   │   │   ├── scoring.test.ts     # Scoring & adaptive placement tests
│   │   │   └── e2e-flow.test.ts    # E2E signup -> onboarding -> lesson -> quiz
│   │   ├── courseData.ts           # CEFR course curriculum definitions
│   │   ├── dailyTaskService.ts     # Dynamic daily task generator
│   │   ├── flashcardService.ts     # SRS decks management
│   │   ├── gamificationService.ts  # XP curve, 24 badges, leaderboard
│   │   ├── scoringLogic.ts         # Pure exam scoring & adaptive calculation
│   │   ├── sm2.ts                  # Pure SM-2 spaced repetition engine
│   │   ├── streakService.ts        # Pure streak engine & freeze shields
│   │   └── testingService.ts       # Mock tests, question banks, history
├── supabase/                       # PostgreSQL migrations & seeds
│   ├── schema.sql                  # Complete schema with 20+ RLS policies
│   ├── seed.sql                    # Initial curriculum & question seed
│   └── course_content_seed.json    # JSON content seed
├── .env.example                    # Documented environment variables
└── package.json                    # Project metadata & npm test scripts
```

---

## Local Development Setup

### Prerequisites
- Node.js 20+ (Node.js 22+ recommended)
- npm 10+

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/deutsch-pfad.git
   cd deutsch-pfad
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Supabase credentials (optional for UI exploration; dummy fallbacks allow local offline preview).

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Testing Suite

The project includes an ultra-fast automated test suite running on the native Node.js test runner (`node:test`):

```bash
# Run all 29 unit and end-to-end tests
npm test

# Run individual test suites
npm run test:sm2       # SM-2 spaced repetition algorithm tests
npm run test:streak    # Streak calculation & freeze shield tests
npm run test:scoring   # Adaptive placement & unit quiz scoring tests
npm run test:e2e       # Full Signup -> Onboarding -> Lesson -> Quiz E2E journey
```

All 29 tests execute in **< 150ms** with zero external test runner overhead.

---

## Security & Row Level Security (RLS)

- **PostgreSQL Row Level Security (RLS)**: Enforced across all 20+ database tables in [`supabase/schema.sql`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/supabase/schema.sql).
- **User Isolation**: Student data (test answers, mistake notebooks, streaks, XP events, flashcard intervals) strictly constrained by `auth.uid() = user_id`.
- **Public Content**: Curriculum units, lessons, and exercises are strictly read-only (`is_published = TRUE`).
- **Secret Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is restricted to server migrations and omitted from client code.
- Read the complete audit report in [`docs/SECURITY_RLS_AUDIT.md`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/docs/SECURITY_RLS_AUDIT.md).

---

## Deployment (Vercel + Supabase)

DeutschPfad is optimized for zero-config edge deployment on Vercel paired with Supabase.

1. Provision a PostgreSQL instance on [Supabase](https://supabase.com/).
2. Run [`supabase/schema.sql`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/supabase/schema.sql) and [`supabase/seed.sql`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/supabase/seed.sql) in the Supabase SQL Editor.
3. Import the repository into [Vercel](https://vercel.com/) and configure the environment variables from `.env.example`.
4. Deploy and verify with the [Launch Checklist](docs/LAUNCH_CHECKLIST.md).

For step-by-step instructions, see [`docs/DEPLOYMENT_GUIDE.md`](file:///Users/gauravpratap/Official/Dev/LearnGerman/deutsch-pfad/docs/DEPLOYMENT_GUIDE.md).

---

## Documentation Links

- 📖 [Deployment Runbook (Vercel + Supabase)](docs/DEPLOYMENT_GUIDE.md)
- 🛡️ [Security, RLS & Rate Limiting Audit](docs/SECURITY_RLS_AUDIT.md)
- 🚀 [Production Launch Checklist](docs/LAUNCH_CHECKLIST.md)
- 🧩 [Exercise Authoring Specification](src/data/exercises/exercise-authoring-schema.json)
- 📚 [A1 Unit 3 Course Content JSON](src/data/courses/a1-unit3-food-cafe.json)

---

## License
Private educational project. All rights reserved.
