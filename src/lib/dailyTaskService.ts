import { DailyTaskType } from "@/types/database.types";
import { getUnresolvedMistakes } from "@/lib/mistakesService";
import { playSuccessChime } from "@/lib/soundEffects";
import { getUserMasteryProfile, getAdaptiveNextLessonRecommendation } from "./adaptiveMasteryService";

export interface GeneratedDailyTask {
  id: string;
  category: "lesson" | "flashcard" | "grammar" | "listening" | "mistakes" | "speaking" | "writing";
  title: string;
  titleDe: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
  completedAt?: string;
  actionUrl: string;
  actionLabel: string;
  iconName: "book" | "cards" | "target" | "headphones" | "alert" | "mic" | "edit";
  badgeText?: string;
}

export interface DailyTaskState {
  date: string; // YYYY-MM-DD
  dailyMinutesBudget: number;
  tasks: GeneratedDailyTask[];
  totalXpEarnedToday: number;
  completedCount: number;
}

const STORAGE_KEY = "deutschpfad_daily_tasks";

export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function generateDailyTasks(dailyMinutes: number = 20): GeneratedDailyTask[] {
  const unresolvedMistakesCount = typeof window !== "undefined" ? getUnresolvedMistakes().length : 2;
  const profile = typeof window !== "undefined" ? getUserMasteryProfile("demo-user", "A1") : null;
  const nextLessonRec = profile ? getAdaptiveNextLessonRecommendation(profile) : null;
  const highestFrictionTopic = profile?.weaknesses[0] || profile?.developing[0];

  // Curated templates configured dynamically to match the user's minutes budget
  const isCompact = dailyMinutes <= 15;
  const isExtended = dailyMinutes >= 45;

  const tasks: GeneratedDailyTask[] = [
    // 1. Adaptive Core Lesson or Remedial Drill
    {
      id: "task-lesson-1",
      category: "lesson",
      title: nextLessonRec?.title || "Complete Core Lesson",
      titleDe: nextLessonRec?.titleDe || "Lektion 1: Greetings & Politeness",
      description: nextLessonRec?.reason || "Learn essential formal greetings, German etiquette, and pronunciation with audio.",
      estimatedMinutes: isCompact ? 6 : isExtended ? 15 : 8,
      xpReward: isExtended ? 35 : (nextLessonRec?.xpReward || 25),
      isCompleted: false,
      actionUrl: nextLessonRec?.actionUrl || "/lesson/a1-u1-l1",
      actionLabel: nextLessonRec?.actionLabel || "Start Lesson",
      iconName: "book",
      badgeText: nextLessonRec?.badgeText || "Core Path",
    },

    // 2. Flashcard Review (Due Cards)
    {
      id: "task-flashcards-1",
      category: "flashcard",
      title: "SRS Spaced Repetition Review",
      titleDe: "Wortschatz-Karten",
      description: "Review due German flashcards with SM-2 spaced repetition and gender color coding.",
      estimatedMinutes: isCompact ? 3 : isExtended ? 10 : 5,
      xpReward: 20,
      isCompleted: false,
      actionUrl: "/flashcards",
      actionLabel: "Review Cards",
      iconName: "cards",
      badgeText: "Due Today",
    },

    // 3. Adaptive Grammar Drill targeted at the user's lowest-mastery topic
    {
      id: "task-grammar-1",
      category: "grammar",
      title: highestFrictionTopic
        ? `Adaptive Drill: ${highestFrictionTopic.topicName}`
        : "Grammar Drill: der / die / das",
      titleDe: highestFrictionTopic
        ? `Gezielte Festigung: ${highestFrictionTopic.topicName}`
        : "Artikel & Kasus Training",
      description: highestFrictionTopic
        ? `Your current mastery is ${highestFrictionTopic.masteryScore}%. Targeted practice now will eliminate friction in this topic.`
        : "Practice article gender selection and verb conjugation rules.",
      estimatedMinutes: isCompact ? 3 : isExtended ? 10 : 5,
      xpReward: 15,
      isCompleted: false,
      actionUrl: "/practice",
      actionLabel: "Start Drill",
      iconName: "target",
      badgeText: highestFrictionTopic ? `${highestFrictionTopic.masteryScore}% Mastery` : "A1 Grammar",
    },

    // 4. Listening Exercise
    {
      id: "task-listening-1",
      category: "listening",
      title: "Audio Listening Comprehension",
      titleDe: "Hörverstehen im Café",
      description: "Listen to native German spoken dialogue and answer comprehension questions.",
      estimatedMinutes: isCompact ? 3 : isExtended ? 8 : 4,
      xpReward: 15,
      isCompleted: false,
      actionUrl: "/practice",
      actionLabel: "Listen Now",
      iconName: "headphones",
      badgeText: "de-DE Audio",
    },
  ];

  // 5. Mistakes Review Set (if user has mistakes or when study time allows)
  if (unresolvedMistakesCount > 0 || isExtended || dailyMinutes >= 20) {
    tasks.push({
      id: "task-mistakes-1",
      category: "mistakes",
      title: highestFrictionTopic ? `Mistake Clearance: ${highestFrictionTopic.topicName}` : "Mistakes Notebook Clearance",
      titleDe: "Fehler-Wiederholung",
      description: `Target and resolve past mistakes (${unresolvedMistakesCount || 3} items awaiting review in weak areas).`,
      estimatedMinutes: isCompact ? 2 : isExtended ? 8 : 4,
      xpReward: 20,
      isCompleted: false,
      actionUrl: "/mistakes",
      actionLabel: "Clear Mistakes",
      iconName: "alert",
      badgeText: `${unresolvedMistakesCount || 3} Missed`,
    });
  }

  // 6. Speaking or Writing 5-Minute Task
  const isSpeakingDay = new Date().getDate() % 2 === 0;
  tasks.push({
    id: "task-speaking-writing-1",
    category: isSpeakingDay ? "speaking" : "writing",
    title: isSpeakingDay ? "5-Minute Speaking Practice" : "5-Minute Written Production",
    titleDe: isSpeakingDay ? "Sprechübung mit Mikrofon" : "Kurzer Schreibtext",
    description: isSpeakingDay
      ? "Record German phrases aloud via Web Speech API and get instant pronunciation accuracy."
      : "Write a 3-sentence self-introduction and verify vocabulary keywords.",
    estimatedMinutes: 5,
    xpReward: 25,
    isCompleted: false,
    actionUrl: "/practice",
    actionLabel: isSpeakingDay ? "Record Voice" : "Write Text",
    iconName: isSpeakingDay ? "mic" : "edit",
    badgeText: isSpeakingDay ? "Speech Lab" : "Writing Lab",
  });

  return tasks;
}

export function getDailyTasks(dailyMinutesBudget: number = 20): DailyTaskState {
  const today = getTodayKey();

  if (typeof window === "undefined") {
    return {
      date: today,
      dailyMinutesBudget,
      tasks: generateDailyTasks(dailyMinutesBudget),
      totalXpEarnedToday: 0,
      completedCount: 0,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const state: DailyTaskState = JSON.parse(raw);
      // If it's still today, return cached state
      if (state.date === today && state.tasks && state.tasks.length > 0) {
        return state;
      }
    }
  } catch {}

  // Generate fresh tasks for today
  const newTasks = generateDailyTasks(dailyMinutesBudget);
  const newState: DailyTaskState = {
    date: today,
    dailyMinutesBudget,
    tasks: newTasks,
    totalXpEarnedToday: 0,
    completedCount: 0,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  } catch {}

  return newState;
}

export function toggleTaskCompletion(taskId: string): DailyTaskState {
  const current = getDailyTasks();
  let xpDelta = 0;

  const updatedTasks = current.tasks.map((task) => {
    if (task.id === taskId) {
      const nextCompleted = !task.isCompleted;
      xpDelta = nextCompleted ? task.xpReward : -task.xpReward;
      if (nextCompleted) {
        playSuccessChime();
      }
      return {
        ...task,
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined,
      };
    }
    return task;
  });

  const completedCount = updatedTasks.filter((t) => t.isCompleted).length;
  const totalXpEarnedToday = Math.max(0, current.totalXpEarnedToday + xpDelta);

  const nextState: DailyTaskState = {
    ...current,
    tasks: updatedTasks,
    completedCount,
    totalXpEarnedToday,
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));

      // Also increment user XP in profile if completed
      if (xpDelta > 0) {
        const profileRaw = localStorage.getItem("deutschpfad_user_profile");
        if (profileRaw) {
          const profile = JSON.parse(profileRaw);
          profile.xp_points = (profile.xp_points || 0) + xpDelta;
          localStorage.setItem("deutschpfad_user_profile", JSON.stringify(profile));
        }
      }
    } catch {}
  }

  return nextState;
}
