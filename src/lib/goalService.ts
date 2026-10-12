import { CefrLevel, DailyStudyMinutes, Goal } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";

export interface GoalSettings {
  targetLevel: CefrLevel;
  currentLevel: CefrLevel;
  targetExamName: string;
  targetExamDate: string | null; // YYYY-MM-DD
  dailyMinutes: DailyStudyMinutes;
  primaryMotivation: string;
}

export interface GoalPacingCalculation {
  totalHoursRequired: number;
  completedHours: number;
  remainingHours: number;
  dailyMinutes: number;
  daysRemainingNeeded: number;
  projectedCompletionDate: string; // YYYY-MM-DD formatted
  examDate: string | null;
  status: "ahead" | "on_track" | "behind" | "no_exam_set";
  daysAheadOrBehind: number; // positive = days ahead, negative = days behind
  recommendedDailyMinutes: number;
  progressPct: number;
}

// CEFR Guided Learning Hours (Goethe-Institut & Cambridge standards)
export const CEFR_HOURS_MAP: Record<string, number> = {
  beginner: 0,
  a1: 80,
  a2: 150,
  b1: 300,
  b2: 450,
  c1: 650,
  c2: 850,
};

export const CEFR_EXAM_NAMES: Record<string, string> = {
  a1: "Goethe-Zertifikat A1: Start Deutsch 1",
  a2: "Goethe-Zertifikat A2 / telc Deutsch A2",
  b1: "Goethe-Zertifikat B1 / DTZ (Zuwanderer)",
  b2: "Goethe-Zertifikat B2 / TestDaF (TDN 3/4)",
  c1: "Goethe-Zertifikat C1 / telc C1 Hochschule",
  c2: "Goethe-Zertifikat C2: GDS",
};

const STORAGE_KEY = "deutschpfad_user_goals";

export const DEFAULT_GOAL: GoalSettings = {
  currentLevel: "beginner",
  targetLevel: "b1",
  targetExamName: "Goethe-Zertifikat B1 / DTZ (Zuwanderer)",
  targetExamDate: "2026-11-15",
  dailyMinutes: 20,
  primaryMotivation: "work",
};

export function getGoalSettings(): GoalSettings {
  if (typeof window === "undefined") return DEFAULT_GOAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_GOAL;
    return { ...DEFAULT_GOAL, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_GOAL;
  }
}

export async function saveGoalSettings(settings: GoalSettings): Promise<GoalSettings> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Also sync to user profile storage for consistency
    const profileRaw = localStorage.getItem("deutschpfad_user_profile");
    if (profileRaw) {
      try {
        const profile = JSON.parse(profileRaw);
        localStorage.setItem(
          "deutschpfad_user_profile",
          JSON.stringify({
            ...profile,
            target_level: settings.targetLevel,
            current_level: settings.currentLevel,
            target_exam_date: settings.targetExamDate,
            daily_study_minutes: settings.dailyMinutes,
          })
        );
      } catch {}
    }
  }

  // Attempt sync to Supabase if authenticated
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("user_profiles")
        .update({
          target_level: settings.targetLevel,
          current_level: settings.currentLevel,
          target_exam_date: settings.targetExamDate,
          daily_study_minutes: settings.dailyMinutes,
          learning_reason: settings.primaryMotivation as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
  } catch {
    // Non-blocking offline fallback
  }

  return settings;
}

export function calculateGoalPacing(settings: GoalSettings, completedHours: number = 24): GoalPacingCalculation {
  const targetCode = settings.targetLevel.toLowerCase();
  const currentCode = settings.currentLevel.toLowerCase();

  const targetHours = CEFR_HOURS_MAP[targetCode] || 150;
  const baseCurrentHours = CEFR_HOURS_MAP[currentCode] || 0;
  
  // Total hours from current start point to target
  const totalHoursRequired = Math.max(30, targetHours - baseCurrentHours);
  const remainingHours = Math.max(0, totalHoursRequired - completedHours);
  const progressPct = Math.min(100, Math.round((completedHours / totalHoursRequired) * 100));

  // Days needed based on daily minutes
  const dailyHours = settings.dailyMinutes / 60;
  const daysNeeded = Math.ceil(remainingHours / (dailyHours || 0.33));

  // Projected completion date
  const projected = new Date();
  projected.setDate(projected.getDate() + daysNeeded);
  const projectedStr = projected.toISOString().split("T")[0];

  let status: GoalPacingCalculation["status"] = "no_exam_set";
  let daysAheadOrBehind = 0;
  let recommendedDailyMinutes: number = settings.dailyMinutes;

  if (settings.targetExamDate) {
    const examDateObj = new Date(settings.targetExamDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysUntilExam = Math.max(1, Math.round((examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    daysAheadOrBehind = daysUntilExam - daysNeeded;

    if (daysAheadOrBehind >= 10) {
      status = "ahead";
    } else if (daysAheadOrBehind >= -5) {
      status = "on_track";
    } else {
      status = "behind";
    }

    // Calculate required daily minutes to finish exactly on exam date
    if (daysUntilExam > 0 && remainingHours > 0) {
      const requiredDailyHours = remainingHours / daysUntilExam;
      const rawMins = Math.round(requiredDailyHours * 60);
      recommendedDailyMinutes = Math.min(120, Math.max(15, Math.ceil(rawMins / 5) * 5));
    }
  }

  return {
    totalHoursRequired,
    completedHours,
    remainingHours,
    dailyMinutes: settings.dailyMinutes,
    daysRemainingNeeded: daysNeeded,
    projectedCompletionDate: projectedStr,
    examDate: settings.targetExamDate,
    status,
    daysAheadOrBehind,
    recommendedDailyMinutes,
    progressPct,
  };
}
