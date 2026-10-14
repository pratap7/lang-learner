# DeutschPfad Product Analytics Event Taxonomy & Naming Convention

**Version:** 2026.1  
**Specification Owner:** Growth, Data & Engineering  
**Telemetry Stack:** PostHog (Product Analytics & Experiments) + Sentry (Error & Performance Monitoring)

---

## 1. Core Principles

1. **Object-Action Grammar**: All custom event names MUST follow lower_snake_case with `[object]_[action]` syntax (e.g., `lesson_completed`, `paywall_viewed`, `trial_started`).
2. **Never Use Past Tense Inconsistently**: Use past participle for completed milestones (`signup_completed`, `test_submitted`) and active present for continuous states (`paywall_viewed`, `audio_played`).
3. **Strict Zero-PII Policy**: NEVER send user passwords, payment card numbers (PAN/CVV), bank details, or unhashed personal identification in event properties. PostHog automatically hashes IP addresses under our GDPR configuration.
4. **Context Enrichment**: All client-side events automatically inherit standard device, platform, locale, and subscription traits through `getGlobalEventProperties()`.

---

## 2. Standard Global Properties (Injected on Every Event)

Every event sent through `trackEvent()` or `trackServerEvent()` automatically includes the following contextual properties:

| Property Name | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `user_id` | string \| null | Distinct Supabase UUID or anonymous client ID | `"usr-4091-a8f1"` |
| `platform` | string | Operating platform | `"web"`, `"pwa"`, `"mobile_ios"` |
| `locale` | string | Interface locale language | `"en"`, `"de"`, `"es"`, `"fr"` |
| `cefr_level` | string | Learner current CEFR tier | `"A1"`, `"A2"`, `"B1"`, `"B2"` |
| `subscription_plan` | string | Active billing tier | `"free"`, `"pro"`, `"pro_plus"` |
| `subscription_status` | string | Entitlement state | `"active"`, `"trialing"`, `"canceled"` |
| `app_version` | string | Current semver release tag | `"1.2.0"` |
| `environment` | string | Runtime environment | `"production"`, `"staging"`, `"preview"` |
| `timestamp` | string | ISO-8601 UTC timestamp | `"2026-10-14T14:30:00Z"` |

---

## 3. The 9 Funnel Milestone Events

These 9 events power the core conversion funnel from first touch to long-term retention:

```
[1. visit]
    │
    ▼
[2. signup]
    │
    ▼
[3. onboarding_completion]
    │
    ▼
[4. first_lesson_completed]
    │
    ▼
[5. day7_return]
    │
    ▼
[6. paywall_viewed]
    │
    ▼
[7. trial_started]
    │
    ▼
[8. paid_conversion]
    │
    ▼
[9. subscription_cancelled] (with win-back offer tracking)
```

### Event Specifications

#### 1. `visit`
- **When to fire:** User lands on any top-level marketing or web page.
- **Properties:**
  - `page_path`: string (e.g. `"/"`, `"/pricing"`, `"/stories"`)
  - `referrer`: string (e.g. `"https://google.com"`)
  - `utm_source`: string | null (e.g. `"newsletter"`, `"google_ads"`)
  - `utm_medium`: string | null (e.g. `"cpc"`, `"organic"`)
  - `utm_campaign`: string | null (e.g. `"goethe_a1_prep"`)

#### 2. `signup`
- **When to fire:** Account is successfully created in Supabase Auth.
- **Properties:**
  - `signup_method`: `"email_password"` | `"google"` | `"apple"`
  - `initial_cefr_selected`: `"A1"` | `"A2"` | `"B1"` | `"B2"` | `"not_sure"`
  - `daily_goal_minutes`: `10` | `20` | `30` | `60`

#### 3. `onboarding_completion`
- **When to fire:** User completes the interactive onboarding questionnaire and reveals personalized path.
- **Properties:**
  - `learning_reason`: `"travel"` | `"work"` | `"study"` | `"exam"` | `"migration"`
  - `study_time_selected`: number (e.g. `15`)
  - `placement_test_taken`: boolean
  - `placement_score`: number | null
  - `duration_seconds`: number

#### 4. `first_lesson_completed`
- **When to fire:** User finishes their very first exercise session or unit lesson.
- **Properties:**
  - `unit_id`: string (e.g. `"a1-u3-food-cafe"`)
  - `lesson_id`: string (e.g. `"polite-ordering-with-moechten"`)
  - `accuracy_percentage`: number (e.g. `92`)
  - `xp_earned`: number (e.g. `30`)
  - `duration_seconds`: number (e.g. `240`)

#### 5. `day7_return`
- **When to fire:** User completes an exercise, flashcard drill, or story on Day 7 (± 1 day) from signup date.
- **Properties:**
  - `streak_length`: number (e.g. `7`)
  - `total_xp`: number
  - `lessons_completed_count`: number

#### 6. `paywall_viewed`
- **When to fire:** A paywall is displayed, either contextually or via `/pricing`.
- **Properties:**
  - `paywall_trigger`: `"contextual_mock_test"` | `"ai_conversation_limit"` | `"pricing_nav"` | `"streak_freeze_prompt"`
  - `paywall_variant`: `"variant_soft_paywall"` | `"variant_hard_paywall"` | `"variant_b_fluency_outcome"`
  - `currency`: `"USD"` | `"EUR"` | `"GBP"` | `"INR"`
  - `displayed_price`: number

#### 7. `trial_started`
- **When to fire:** User signs up for the 7-day free trial on Pro or Pro Plus.
- **Properties:**
  - `plan_id`: `"pro"` | `"pro_plus"`
  - `billing_cycle`: `"monthly"` | `"annual"`
  - `trial_days`: `7`
  - `payment_gateway`: `"stripe"` | `"razorpay"` | `"paddle"`
  - `requires_payment_method`: boolean (`true`)

#### 8. `paid_conversion`
- **When to fire:** Trial successfully converts to paid, or customer purchases plan directly.
- **Properties:**
  - `plan_id`: `"pro"` | `"pro_plus"`
  - `billing_cycle`: `"monthly"` | `"annual"`
  - `amount`: number
  - `currency`: `"USD"` | `"EUR"` | `"GBP"` | `"INR"`
  - `is_annual`: boolean
  - `conversion_source`: `"trial_conversion"` | `"direct_checkout"` | `"win_back_reactivation"`

#### 9. `subscription_cancelled`
- **When to fire:** User completes the cancellation survey and confirms cancellation.
- **Properties:**
  - `cancellation_reason`: `"too_expensive"` | `"not_enough_time"` | `"achieved_goal"` | `"switching_tutor"`
  - `winback_offer_shown`: boolean (`true`)
  - `winback_offer_accepted`: boolean
  - `active_duration_days`: number
  - `plan_id`: string

---

## 4. A/B Testing & Feature Flag Experiments

PostHog feature flags manage experiment splits. The primary experiments running are:

1. **`pricing_page_experiment`**:
   - `control_feature_grid`: Standard 3-column tier comparison.
   - `variant_fluency_guarantee`: Outcome-focused with CEFR exam readiness pledge.
   - `variant_urgency_discount`: Annual 25% savings banner highlighted with countdown.
2. **`paywall_modal_experiment`**:
   - `variant_soft_paywall`: Emphasizes "Zero Charge Today — Cancel in 1 Tap".
   - `variant_hard_paywall`: Direct checkout with 30-day money-back guarantee badge.

---

## 5. Sentry Error & Crash Reporting Standards

- **Release Tag Format**: `deutschpfad@<version>` (e.g. `deutschpfad@1.2.0`).
- **Environment**: Automatically tagged as `production`, `preview` (PR deploy), or `development`.
- **Breadcrumb Taxonomy**:
  - `navigation`: Route path transitions.
  - `ui.click`: Button actions (e.g., `Start Lesson`, `Upgrade`).
  - `api`: Outgoing requests to `/api/*` with status code and round-trip time.
  - `audio.playback`: Audio synthesized or played via Web Audio API.
