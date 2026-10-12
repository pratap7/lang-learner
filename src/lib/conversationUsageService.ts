export type UserSubscriptionPlan = "free" | "pro" | "unlimited";

export interface ConversationUsageRecord {
  userId: string;
  plan: UserSubscriptionPlan;
  monthlyMinutesCap: number;
  minutesUsedThisMonth: number;
  minutesRemaining: number;
  isLimitReached: boolean;
  cycleResetDate: string; // YYYY-MM-DD
}

export interface SessionCostLog {
  id: string;
  userId: string;
  scenarioId: string;
  durationSeconds: number;
  turnsCount: number;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  timestamp: string;
}

export const PLAN_LIMITS: Record<UserSubscriptionPlan, { minutesCap: number; label: string }> = {
  free: { minutesCap: 15, label: "Free Plan (15 min/month)" },
  pro: { minutesCap: 120, label: "Pro Plan (120 min/month)" },
  unlimited: { minutesCap: 600, label: "Unlimited Tier (600 min/month)" },
};

// Estimated LLM pricing per 1 million tokens (e.g., standard lightweight instruction model)
const COST_PER_1M_PROMPT_TOKENS = 0.15; // $0.15 / 1M
const COST_PER_1M_COMPLETION_TOKENS = 0.60; // $0.60 / 1M

const STORAGE_USAGE_KEY = "deutschpfad_ai_convo_usage_v1";
const STORAGE_LOGS_KEY = "deutschpfad_ai_convo_logs_v1";

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonthFirstDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split("T")[0];
}

export function getUserConversationUsage(
  userId: string = "demo-user",
  plan: UserSubscriptionPlan = "free"
): ConversationUsageRecord {
  const cap = PLAN_LIMITS[plan]?.minutesCap ?? 15;
  const cycleResetDate = getNextMonthFirstDate();
  const monthKey = getMonthKey();

  let minutesUsed = 3; // Baseline default demo minutes used

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`${STORAGE_USAGE_KEY}_${userId}_${monthKey}`);
      if (raw) {
        minutesUsed = Number(raw) || 0;
      }
    } catch {
      // Fallback
    }
  }

  const minutesRemaining = Math.max(0, cap - minutesUsed);
  const isLimitReached = minutesRemaining <= 0;

  return {
    userId,
    plan,
    monthlyMinutesCap: cap,
    minutesUsedThisMonth: minutesUsed,
    minutesRemaining,
    isLimitReached,
    cycleResetDate,
  };
}

export function recordConversationUsage(
  userId: string = "demo-user",
  minutesToAdd: number,
  plan: UserSubscriptionPlan = "free"
): ConversationUsageRecord {
  const current = getUserConversationUsage(userId, plan);
  const monthKey = getMonthKey();
  const nextUsed = Math.min(current.monthlyMinutesCap, current.minutesUsedThisMonth + minutesToAdd);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_USAGE_KEY}_${userId}_${monthKey}`, String(nextUsed));
    } catch {}
  }

  const minutesRemaining = Math.max(0, current.monthlyMinutesCap - nextUsed);
  return {
    ...current,
    minutesUsedThisMonth: nextUsed,
    minutesRemaining,
    isLimitReached: minutesRemaining <= 0,
  };
}

/**
 * Calculates token counts and cost estimation for session telemetry.
 */
export function calculateAndLogSessionCost(params: {
  userId: string;
  scenarioId: string;
  durationSeconds: number;
  userMessagesText: string[];
  aiMessagesText: string[];
}): SessionCostLog {
  const { userId, scenarioId, durationSeconds, userMessagesText, aiMessagesText } = params;

  // Approximate tokens ~ 1 word = 1.3 tokens
  const totalUserWords = userMessagesText.join(" ").split(/\s+/).filter(Boolean).length;
  const totalAiWords = aiMessagesText.join(" ").split(/\s+/).filter(Boolean).length;

  const estimatedPromptTokens = Math.max(80, Math.round(totalUserWords * 1.4) + 250); // including system instructions
  const estimatedCompletionTokens = Math.max(30, Math.round(totalAiWords * 1.4));
  const totalTokens = estimatedPromptTokens + estimatedCompletionTokens;

  const promptCost = (estimatedPromptTokens / 1_000_000) * COST_PER_1M_PROMPT_TOKENS;
  const completionCost = (estimatedCompletionTokens / 1_000_000) * COST_PER_1M_COMPLETION_TOKENS;
  const estimatedCostUsd = Number((promptCost + completionCost).toFixed(6));

  const logEntry: SessionCostLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId,
    scenarioId,
    durationSeconds,
    turnsCount: userMessagesText.length,
    estimatedPromptTokens,
    estimatedCompletionTokens,
    totalTokens,
    estimatedCostUsd,
    timestamp: new Date().toISOString(),
  };

  // Server & client console logging for monitoring
  console.info(
    `[AI Conversation Metrics] User: ${userId} | Scenario: ${scenarioId} | Duration: ${durationSeconds}s | Tokens: ${totalTokens} | Est. Cost: $${estimatedCostUsd.toFixed(6)}`
  );

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_LOGS_KEY);
      const logs: SessionCostLog[] = raw ? JSON.parse(raw) : [];
      logs.unshift(logEntry);
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 50)));
    } catch {}
  }

  return logEntry;
}
