# DeutschPfad Production Launch Checklist

Before launching DeutschPfad to public learners, complete and verify each item in this operational checklist.

---

## 1. Quality Assurance & Core User Journey
- [ ] **Sign-up & Onboarding**:
  - [ ] New user signup creates profile and initializes default streak with 1 freeze shield.
  - [ ] Onboarding questions save learning reason, target CEFR band, daily minutes, and target exam date.
  - [ ] Welcome XP (+50 XP) and "First Step" milestone badge unlock properly.
- [ ] **Course Roadmap & Player**:
  - [ ] All levels (A1 to C2) render with completion rings and lock/unlock indicators.
  - [ ] Step-by-step lesson player displays progress bar, vocabulary audio, grammar tables with gender colors (blue/pink/green), dialogue, and cultural notes.
  - [ ] "Mark complete" button awards XP, persists lesson state, and updates daily task count.
- [ ] **Exercise Engine**:
  - [ ] All 10 exercise modalities functional: Multiple Choice, Fill-in-the-Blank, Matching Pairs, Sentence Reordering, Translation, Listening Comprehension, Speech Recording (Web Speech API), Article Selection, Short Writing.
  - [ ] Instant pedagogical explanations render for correct and incorrect answers.
  - [ ] Erroneous answers are saved into the Mistake Notebook.
- [ ] **Spaced Repetition Flashcards (SM-2)**:
  - [ ] Flashcards flip cleanly on 3D axis with keyboard shortcut support (Space).
  - [ ] Again / Hard / Good / Easy ratings update next review date and interval.
  - [ ] Due cards queue accurately tracks cards due on the dashboard.
- [ ] **Testing & Diagnostics**:
  - [ ] Adaptive Placement Test adjusts difficulty according to consecutive responses.
  - [ ] Unit quizzes require 70% passing score.
  - [ ] Full timed mock exams display timer countdown, section navigation, question flagging, and confirm-before-submit modal.
  - [ ] Results page renders radar skill chart, question review breakdown, and weak-topic recommendations.
- [ ] **Gamification & Social**:
  - [ ] 24 milestone badges track progress and award bonus XP.
  - [ ] Level completion certificates (A1–C2) generate with user's editable name, verification code, and print/download to PDF.
  - [ ] Weekly leaderboard respects opt-in/opt-out privacy settings.
  - [ ] Confetti cannons trigger upon milestone completions.

---

## 2. Security, RLS & Compliance
- [ ] **Row Level Security**:
  - [ ] RLS enabled on all 20 public database tables in Supabase.
  - [ ] Authenticated users can only read/write their own profiles, progress, and test answers (`auth.uid() = user_id`).
  - [ ] Public curriculum tables are restricted to read-only (`is_published = TRUE`).
- [ ] **Credentials & Secrets**:
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` is strictly absent from all client bundles and git commits.
  - [ ] Only `NEXT_PUBLIC_` variables exposed to frontend runtime.
  - [ ] `.env.local` is added to `.gitignore`.
- [ ] **Input Sanitization**:
  - [ ] User names, certificate inputs, and written responses sanitized against XSS.

---

## 3. Performance & Web Vitals (Lighthouse)
- [ ] **Next.js Turbopack Build**: `npm run build` succeeds with zero errors across all static and partial prerendered routes.
- [ ] **Bundle Size**: Tree-shaking verified; Lucide icons and Recharts imported selectively.
- [ ] **Typography**: Next.js Google Fonts (`Inter`, `Fraunces`) configured with `display: swap`.
- [ ] **Image Optimization**: SVG vectors and optimized WebP images used throughout.
- [ ] **Core Web Vitals**:
  - [ ] Largest Contentful Paint (LCP) < 2.0s.
  - [ ] Cumulative Layout Shift (CLS) < 0.05.
  - [ ] First Input Delay / Interaction to Next Paint (INP) < 100ms.

---

## 4. Accessibility (a11y) & UX Polish
- [ ] **Semantic Structure**: Proper heading hierarchy (`h1`, `h2`, `h3`) on every page with a single `h1`.
- [ ] **Accessible Controls**: All buttons and icon-only triggers have descriptive `aria-label` or text equivalents.
- [ ] **Color Contrast**: Compliant contrast ratios across both light mode and dark mode surfaces.
- [ ] **Keyboard Navigation**:
  - [ ] Full navigation accessible via <kbd>Tab</kbd> and <kbd>Enter</kbd>.
  - [ ] Global shortcut modal accessible via <kbd>?</kbd>.
  - [ ] Flashcard SM-2 review supports <kbd>Space</kbd> and <kbd>1</kbd>–<kbd>4</kbd>.
- [ ] **Loading & Error States**:
  - [ ] Skeleton loaders display during asynchronous loads.
  - [ ] Reusable EmptyState component renders gracefully when data is absent.
  - [ ] Route-level and global error boundaries provide bilingual fallback and reload buttons.

---

## 5. PWA & Offline Readiness
- [ ] **Web App Manifest**: Valid `manifest.json` configured with standalone mode, theme color `#6366f1`, and maskable icons.
- [ ] **Service Worker**: `sw.js` caches shell routes, lessons (`/lesson/*`), and flashcard assets.
- [ ] **Offline Resilience**: Offline notification badge appears when disconnected; cached lessons remain interactive.
- [ ] **Install Prompt**: Gentle PWA install banner displays on supported mobile and desktop browsers.

---

## 6. Automated Testing Verification
- [ ] Run full test suite:
  ```bash
  npm test
  ```
- [ ] Confirm all 29 tests pass:
  - [x] SM-2 Spaced Repetition Algorithm (`sm2.test.ts`)
  - [x] Streak Calculation & Freeze Shield (`streak.test.ts`)
  - [x] Test Scoring & Adaptive Placement (`scoring.test.ts`)
  - [x] End-to-End User Journey: Signup → Onboarding → Lesson → Quiz (`e2e-flow.test.ts`)
