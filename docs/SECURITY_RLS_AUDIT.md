# Security, RLS & Rate Limiting Audit Report

**Project:** DeutschPfad (CEFR German Mastery Platform)  
**Date:** October 2026  
**Auditor:** DeutschPfad Security & Architecture Review  

---

## 1. Executive Summary
DeutschPfad implements a **defense-in-depth security model** combining PostgreSQL Row Level Security (RLS) via Supabase, client-side input validation, strict TypeScript typing contracts, and secure session state handling.

This audit evaluates:
1. **Row Level Security (RLS) policies** across 20+ database tables.
2. **Input validation** on auth, goal settings, test attempts, certificates, and user-generated text.
3. **Rate limiting & abuse prevention** for authentication, public endpoints, and test evaluations.

---

## 2. Row Level Security (RLS) Matrix Audit

| Table Name | RLS Enabled | Read Access Policy | Write / Update Policy | Audit Status & Assessment |
|---|---|---|---|---|
| `public.user_profiles` | ✅ Yes | `auth.uid() = id` | `auth.uid() = id` (INSERT/UPDATE/DELETE) | **Secure.** User data is isolated. *Note: Leaderboard uses aggregated queries or opt-in flags.* |
| `public.goals` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Only owner can view or edit daily study target and exam dates. |
| `public.levels` | ✅ Yes | `is_published = TRUE` | Admin only | **Secure.** Read-only public CEFR catalog. |
| `public.units` | ✅ Yes | `is_published = TRUE` | Admin only | **Secure.** Read-only curriculum units. |
| `public.lessons` | ✅ Yes | `is_published = TRUE` | Admin only | **Secure.** Read-only lessons. |
| `public.exercises` | ✅ Yes | Public / Authenticated | Admin only | **Secure.** Students cannot alter exercise answers. |
| `public.flashcards` | ✅ Yes | Public / Authenticated | Admin only | **Secure.** Seed decks are immutable by learners. |
| `public.lesson_progress` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Students cannot tamper with other students' completion status. |
| `public.exercise_attempts` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Attempt logs restricted to owner. |
| `public.srs_reviews` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** SM-2 interval and ease factors isolated per user. |
| `public.mistakes` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Personal Mistake Notebook strictly private. |
| `public.streaks` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Streak ledger and freeze inventory isolated. |
| `public.xp_events` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Transactional ledger immutable except by owner/system trigger. |
| `public.daily_tasks` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Daily task check-offs strictly scoped. |
| `public.badges` | ✅ Yes | Everyone (`true`) | Admin only | **Secure.** Global catalog read-only. |
| `public.user_badges` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Unlocked achievements isolated per student. |
| `public.tests` | ✅ Yes | `is_published = TRUE` | Admin only | **Secure.** Test definitions read-only. |
| `public.test_questions` | ✅ Yes | Authenticated users | Admin only | **Secure.** Questions read-only. |
| `public.test_attempts` | ✅ Yes | `auth.uid() = user_id` | `auth.uid() = user_id` | **Secure.** Exam scores strictly isolated. |
| `public.test_answers` | ✅ Yes | Correlated `test_attempts.user_id = auth.uid()` | Correlated `test_attempts.user_id = auth.uid()` | **Secure.** Answers verified against attempt ownership join. |

### RLS Findings & Recommendations
1. **Leaderboard Public Profiles**:
   - `user_profiles` RLS restricts reads to `auth.uid() = id`. For the opt-in weekly leaderboard, either expose a dedicated view:
     ```sql
     CREATE OR REPLACE VIEW public.leaderboard_public AS
     SELECT id, full_name, avatar_url, streak_count, xp_points
     FROM public.user_profiles
     WHERE leaderboard_opt_in = TRUE;
     ```
     or use a `SECURITY DEFINER` function `get_weekly_leaderboard()` so non-public profile details (emails, learning reasons) are never leaked.

---

## 3. Input Validation Audit

### A. Authentication & Sign-up
- **Email Validation**: Strict regex matching standard RFC 5322 format before dispatching to Supabase Auth.
- **Password Strength**: Minimum 8 characters enforced; rejects purely whitespace strings.
- **Sanitization**: Trimmed whitespace on emails and names to avoid whitespace spoofing.

### B. Goal Configuration (`/goals`)
- **Daily Minutes**: Bounded between `5` and `120` minutes. Default fallback provided for invalid integers.
- **Target Level**: Strictly constrained to CEFR codes (`a1`–`c2`).
- **Exam Date**: Validates that target exam dates are in the future; displays gentle warning if date is unrealistically close for higher CEFR bands.

### C. Certificate Generator (`LevelCertificateModal.tsx`)
- **Recipient Name**:
  - Sanitized on change; truncated to 60 characters to prevent certificate canvas overflow.
  - Rendered using React standard string interpolation (automatic HTML entity encoding prevents XSS).
- **Accreditation Code**: Generated using cryptographically random hashes (`crypto.randomUUID().slice(0, 8)`).

### D. Exercise Engine & Mock Tests
- **Multiple Choice / Article Selection**: Answers are received as typed integers (`number`) or discrete enum values (`"der" | "die" | "das"`).
- **Translation & Short Writing Tasks**:
  - Input strings normalized with `.trim().toLowerCase()`.
  - Punctuation stripped where appropriate for lenient grading.
  - Word count bounds checked against minimum criteria (`minWords`).

---

## 4. Rate Limiting & Denial-of-Service (DoS) Audit

### A. Authentication Endpoints
- **Supabase Auth Built-in Rate Limits**:
  - Sign-up / Sign-in: 30 requests per minute per IP.
  - Password Reset / Magic Links: 3 emails per hour per recipient.
  - Refresh Token Rotation: Prevents token replay attacks.

### B. Client Speech Synthesis & Recognition
- **Web Speech API**:
  - Executes directly inside the client browser runtime (SpeechSynthesis & SpeechRecognition).
  - Zero server load and zero per-token cost for audio playback or speech evaluation.
  - Audio canceled gracefully (`window.speechSynthesis.cancel()`) on unmount to prevent audio queue exhaustion.

### C. Recommendation for Production API Routes
If deploying custom Next.js API route handlers (e.g. `/api/generate-task` or `/api/verify-certificate`):
- Implement an **Upstash Redis / In-Memory Token Bucket** middleware:
  - 60 requests per minute for authenticated sessions.
  - 10 requests per minute for unauthenticated visitors.

---

## 5. Summary Checklist
- [x] RLS enabled on all 20 public database tables.
- [x] No `SERVICE_ROLE_KEY` referenced in client-side bundles.
- [x] User-scoped records validated with `auth.uid() = user_id`.
- [x] Input sanitization verified on forms and test submissions.
- [x] Native browser speech handling avoids external API rate exhaustion.
