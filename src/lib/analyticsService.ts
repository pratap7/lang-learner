/**
 * DeutschPfad Client Analytics Service
 * Tracks onboarding transitions, user events, drop-offs, and conversions.
 */

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp: string;
}

const STORAGE_ANALYTICS_KEY = "deutschpfad_analytics_events";

export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  const event: AnalyticsEvent = {
    eventName,
    properties,
    timestamp,
  };

  if (typeof window !== "undefined") {
    // 1. Console log in development for observability
    if (process.env.NODE_ENV !== "production") {
      console.log(`📊 [Analytics] ${eventName}`, properties || {});
    }

    // 2. Dispatch custom DOM event for any analytics listeners/plugins
    window.dispatchEvent(
      new CustomEvent("deutschpfad:analytics", {
        detail: event,
      })
    );

    // 3. Persist to local event log for diagnostics
    try {
      const raw = localStorage.getItem(STORAGE_ANALYTICS_KEY);
      const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
      list.push(event);
      // Keep last 100 events
      if (list.length > 100) list.shift();
      localStorage.setItem(STORAGE_ANALYTICS_KEY, JSON.stringify(list));
    } catch {}
  }
}

export function trackOnboardingStep(
  stepName:
    | "goal_selection"
    | "level_check_started"
    | "question_answered"
    | "level_check_skipped"
    | "level_check_completed"
    | "mini_lesson_started"
    | "word_learned"
    | "mini_lesson_completed"
    | "plan_revealed"
    | "signup_prompt_viewed"
    | "signup_completed"
    | "guest_continue",
  properties?: Record<string, any>
): void {
  trackEvent(`onboarding_${stepName}`, properties);
}
