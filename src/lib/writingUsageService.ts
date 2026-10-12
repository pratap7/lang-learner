export type UserSubscriptionPlan = "free" | "pro" | "unlimited";

export interface WritingUsageRecord {
  userId: string;
  plan: UserSubscriptionPlan;
  monthlySubmissionCap: number;
  submissionsUsedThisMonth: number;
  submissionsRemaining: number;
  isLimitReached: boolean;
  cycleResetDate: string; // YYYY-MM-DD
}

export const WRITING_PLAN_LIMITS: Record<
  UserSubscriptionPlan,
  { submissionCap: number; label: string }
> = {
  free: { submissionCap: 5, label: "Free Plan (5 essays/month)" },
  pro: { submissionCap: 30, label: "Pro Plan (30 essays/month)" },
  unlimited: { submissionCap: 150, label: "Unlimited Tier (150 essays/month)" },
};

const STORAGE_WRITING_USAGE_KEY = "deutschpfad_writing_usage_v1";

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonthFirstDate(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString().split("T")[0];
}

export function getUserWritingUsage(
  userId: string = "demo-user",
  plan: UserSubscriptionPlan = "free"
): WritingUsageRecord {
  const cap = WRITING_PLAN_LIMITS[plan]?.submissionCap ?? 5;
  const cycleResetDate = getNextMonthFirstDate();
  const monthKey = getMonthKey();

  let submissionsUsed = 1; // Default seed for interactive demonstration

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(`${STORAGE_WRITING_USAGE_KEY}_${userId}_${monthKey}`);
      if (raw !== null) {
        submissionsUsed = Number(raw) || 0;
      }
    } catch {}
  }

  const submissionsRemaining = Math.max(0, cap - submissionsUsed);
  const isLimitReached = submissionsRemaining <= 0;

  return {
    userId,
    plan,
    monthlySubmissionCap: cap,
    submissionsUsedThisMonth: submissionsUsed,
    submissionsRemaining,
    isLimitReached,
    cycleResetDate,
  };
}

export function recordWritingSubmission(
  userId: string = "demo-user",
  plan: UserSubscriptionPlan = "free"
): WritingUsageRecord {
  const current = getUserWritingUsage(userId, plan);
  const monthKey = getMonthKey();
  const nextUsed = Math.min(current.monthlySubmissionCap, current.submissionsUsedThisMonth + 1);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_WRITING_USAGE_KEY}_${userId}_${monthKey}`, String(nextUsed));
    } catch {}
  }

  const submissionsRemaining = Math.max(0, current.monthlySubmissionCap - nextUsed);
  return {
    ...current,
    submissionsUsedThisMonth: nextUsed,
    submissionsRemaining,
    isLimitReached: submissionsRemaining <= 0,
  };
}
