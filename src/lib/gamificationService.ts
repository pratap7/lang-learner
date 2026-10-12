export interface BadgeItem {
  id: string;
  code: string;
  title: string;
  titleDe: string;
  description: string;
  category: "streak" | "vocabulary" | "grammar" | "exam" | "special";
  iconName: string;
  xpBonus: number;
  unlocked: boolean;
  unlockedAt?: string;
  progressCurrent?: number;
  progressTarget?: number;
}

export interface UserLevelInfo {
  levelNumber: number;
  title: string;
  titleDe: string;
  currentXp: number;
  xpInLevel: number;
  xpNeededForNext: number;
  levelProgressPct: number;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  streak: number;
  level: string;
  isCurrentUser?: boolean;
}

const STORAGE_XP_KEY = "deutschpfad_user_xp_v1";
const STORAGE_BADGES_KEY = "deutschpfad_badges_v1";
const STORAGE_OPT_IN_KEY = "deutschpfad_leaderboard_opt_in";

/* ─────────────────────────────────────────────────────────────────────────────
   24 CURATED CEFR BADGES
───────────────────────────────────────────────────────────────────────────── */
export const ALL_BADGES: BadgeItem[] = [
  // Streaks
  {
    id: "b-first-step",
    code: "first_lesson",
    title: "First Step",
    titleDe: "Erster Schritt",
    description: "Completed your first interactive German lesson.",
    category: "special",
    iconName: "Compass",
    xpBonus: 50,
    unlocked: true,
    unlockedAt: "2026-10-08T10:00:00Z",
  },
  {
    id: "b-streak-3",
    code: "streak_3",
    title: "Spark Starter",
    titleDe: "Feuereifer (3 Tage)",
    description: "Maintained a 3-day continuous daily practice streak.",
    category: "streak",
    iconName: "Flame",
    xpBonus: 75,
    unlocked: true,
    unlockedAt: "2026-10-10T18:00:00Z",
  },
  {
    id: "b-streak-7",
    code: "streak_7",
    title: "Flame Master",
    titleDe: "Flammenmeister (7 Tage)",
    description: "Maintained a 7-day continuous daily streak without a pause.",
    category: "streak",
    iconName: "Flame",
    xpBonus: 150,
    unlocked: true,
    unlockedAt: "2026-10-12T09:00:00Z",
  },
  {
    id: "b-streak-14",
    code: "streak_14",
    title: "Steadfast Habit",
    titleDe: "Ausdauer-Profi (14 Tage)",
    description: "Studied two uninterrupted weeks.",
    category: "streak",
    iconName: "ShieldCheck",
    xpBonus: 250,
    unlocked: false,
    progressCurrent: 7,
    progressTarget: 14,
  },
  {
    id: "b-streak-30",
    code: "streak_30",
    title: "Unstoppable",
    titleDe: "Unaufhaltsam (30 Tage)",
    description: "Kept a 30-day streak alive through discipline.",
    category: "streak",
    iconName: "Award",
    xpBonus: 500,
    unlocked: false,
    progressCurrent: 7,
    progressTarget: 30,
  },
  {
    id: "b-freeze-shield",
    code: "freeze_shield",
    title: "Ice Shield",
    titleDe: "Eisschild Ausgerüstet",
    description: "Equipped a streak freeze to shield your momentum.",
    category: "streak",
    iconName: "Shield",
    xpBonus: 50,
    unlocked: true,
    unlockedAt: "2026-10-11T12:00:00Z",
  },

  // Vocabulary & Flashcards
  {
    id: "b-words-25",
    code: "words_25",
    title: "Word Collector",
    titleDe: "Wortschatz-Starter (25 Wörter)",
    description: "Added and reviewed 25 German words in flashcards.",
    category: "vocabulary",
    iconName: "BookOpen",
    xpBonus: 50,
    unlocked: true,
    unlockedAt: "2026-10-09T14:00:00Z",
  },
  {
    id: "b-words-100",
    code: "words_100",
    title: "Centurion of Words",
    titleDe: "Wortakrobat (100 Wörter)",
    description: "Learned and reviewed 100 German vocabulary items.",
    category: "vocabulary",
    iconName: "Layers",
    xpBonus: 200,
    unlocked: true,
    unlockedAt: "2026-10-11T16:00:00Z",
  },
  {
    id: "b-words-250",
    code: "words_250",
    title: "Lexicon Architect",
    titleDe: "Wortlexikon (250 Wörter)",
    description: "Mastered 250 words with the SM-2 spaced repetition algorithm.",
    category: "vocabulary",
    iconName: "BookOpen",
    xpBonus: 350,
    unlocked: false,
    progressCurrent: 142,
    progressTarget: 250,
  },
  {
    id: "b-gender-guru",
    code: "gender_guru",
    title: "Gender Guru",
    titleDe: "Artikel-König (der/die/das)",
    description: "Correctly identified 20 noun genders in a row without a mistake.",
    category: "vocabulary",
    iconName: "Sparkles",
    xpBonus: 100,
    unlocked: true,
    unlockedAt: "2026-10-10T19:30:00Z",
  },
  {
    id: "b-my-words",
    code: "my_words_10",
    title: "Curator",
    titleDe: "Eigenes Wörterbuch (10 Wörter)",
    description: "Saved 10 custom words from lessons into 'My Words'.",
    category: "vocabulary",
    iconName: "Bookmark",
    xpBonus: 75,
    unlocked: false,
    progressCurrent: 4,
    progressTarget: 10,
  },

  // Grammar & Mistakes
  {
    id: "b-case-master",
    code: "case_master",
    title: "Case Master",
    titleDe: "Kasus-Meister (Dativ & Akkusativ)",
    description: "Completed case declension drills with 100% accuracy.",
    category: "grammar",
    iconName: "Zap",
    xpBonus: 150,
    unlocked: true,
    unlockedAt: "2026-10-11T20:10:00Z",
  },
  {
    id: "b-verb-hero",
    code: "verb_hero",
    title: "Separable Sorter",
    titleDe: "Trennbare Verben Bezwinger",
    description: "Mastered 15 separable prefix verbs in subordinate and main clauses.",
    category: "grammar",
    iconName: "RotateCcw",
    xpBonus: 100,
    unlocked: false,
    progressCurrent: 9,
    progressTarget: 15,
  },
  {
    id: "b-mistake-slayer",
    code: "mistake_slayer",
    title: "Mistake Slayer",
    titleDe: "Fehler-Bezwinger (5 Gelöst)",
    description: "Re-practiced and resolved 5 mistakes in the Mistake Notebook.",
    category: "grammar",
    iconName: "ShieldCheck",
    xpBonus: 120,
    unlocked: true,
    unlockedAt: "2026-10-12T11:00:00Z",
  },
  {
    id: "b-syntax-sharp",
    code: "syntax_sharp",
    title: "Syntax Sharp",
    titleDe: "Wortstellung-Virtuose",
    description: "Assembled 10 complex German sentences without word order errors.",
    category: "grammar",
    iconName: "CheckCircle2",
    xpBonus: 100,
    unlocked: false,
    progressCurrent: 6,
    progressTarget: 10,
  },

  // Exams & Tests
  {
    id: "b-placement-done",
    code: "placement_done",
    title: "Diagnostic Pioneer",
    titleDe: "Einstufungs-Profi",
    description: "Completed the 25-question adaptive CEFR placement assessment.",
    category: "exam",
    iconName: "Compass",
    xpBonus: 100,
    unlocked: true,
    unlockedAt: "2026-10-12T13:00:00Z",
  },
  {
    id: "b-quiz-70",
    code: "quiz_pass",
    title: "Quiz Graduate",
    titleDe: "Einheit Bestanden (70%+)",
    description: "Scored 70% or higher on a unit assessment quiz.",
    category: "exam",
    iconName: "Award",
    xpBonus: 75,
    unlocked: true,
    unlockedAt: "2026-10-10T15:00:00Z",
  },
  {
    id: "b-quiz-perfect",
    code: "quiz_perfect",
    title: "Perfectionist",
    titleDe: "Volle Punktzahl (100% Quiz)",
    description: "Achieved a flawless 10/10 score on any unit quiz.",
    category: "exam",
    iconName: "Sparkles",
    xpBonus: 150,
    unlocked: false,
    progressCurrent: 9,
    progressTarget: 10,
  },
  {
    id: "b-first-mock",
    code: "first_mock",
    title: "First Mock Exam",
    titleDe: "Prüfungspionier (Erster Modelltest)",
    description: "Completed your first timed Goethe/telc format simulation.",
    category: "exam",
    iconName: "Clock",
    xpBonus: 200,
    unlocked: true,
    unlockedAt: "2026-10-12T14:30:00Z",
  },
  {
    id: "b-mock-ace",
    code: "mock_ace",
    title: "Mock Ace",
    titleDe: "Prüfungsass (90%+)",
    description: "Scored 90% or higher on a complete timed CEFR simulation.",
    category: "exam",
    iconName: "Award",
    xpBonus: 350,
    unlocked: false,
    progressCurrent: 82,
    progressTarget: 90,
  },

  // Modalities & Habits
  {
    id: "b-listening-pro",
    code: "listening_pro",
    title: "Golden Ear",
    titleDe: "Goldenes Ohr",
    description: "Completed 10 listening comprehension tasks with perfect accuracy.",
    category: "special",
    iconName: "Headphones",
    xpBonus: 100,
    unlocked: false,
    progressCurrent: 4,
    progressTarget: 10,
  },
  {
    id: "b-speaking-star",
    code: "speaking_star",
    title: "Voice of Berlin",
    titleDe: "Sprachgenie (Sprechübungen)",
    description: "Recorded and spoke 5 German oral responses via speech recognition.",
    category: "special",
    iconName: "Mic",
    xpBonus: 120,
    unlocked: false,
    progressCurrent: 2,
    progressTarget: 5,
  },
  {
    id: "b-early-bird",
    code: "early_bird",
    title: "Early Bird",
    titleDe: "Frühaufsteher",
    description: "Completed a German study session before 08:00 AM.",
    category: "special",
    iconName: "Sparkles",
    xpBonus: 80,
    unlocked: true,
    unlockedAt: "2026-10-11T07:15:00Z",
  },
  {
    id: "b-night-owl",
    code: "night_owl",
    title: "Night Owl",
    titleDe: "Nachteule",
    description: "Finished a German lesson after 21:00 PM.",
    category: "special",
    iconName: "Sparkles",
    xpBonus: 80,
    unlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   LEVELS & XP FORMULA
───────────────────────────────────────────────────────────────────────────── */
const LEVEL_TITLES = [
  { level: 1, title: "Beginner", titleDe: "Sprach-Neuling" },
  { level: 2, title: "Explorer", titleDe: "Entdecker" },
  { level: 3, title: "Apprentice", titleDe: "Sprachschüler" },
  { level: 5, title: "Rising Star", titleDe: "Aufstrebender Lerner" },
  { level: 7, title: "Word Crafter", titleDe: "Wortgestalter" },
  { level: 10, title: "Dedicated Learner", titleDe: "Sprachbegeisterter" },
  { level: 15, title: "Vocabulary Virtuoso", titleDe: "Wortschatz-Meister" },
  { level: 20, title: "Grammar Tactician", titleDe: "Grammatik-Könner" },
  { level: 25, title: "Fluency Pilgrim", titleDe: "Fließend-Wanderer" },
  { level: 30, title: "German Virtuoso", titleDe: "Deutsch-Virtuose" },
  { level: 40, title: "Near-Native Scholar", titleDe: "Akzentfrei-Pionier" },
  { level: 50, title: "Language Legend", titleDe: "Sprachlegende" },
];

export function getLevelInfoFromXp(xp: number): UserLevelInfo {
  // Level N requires: 150 * N * (N - 1) / 2 XP
  let level = 1;
  let accumulated = 0;

  while (true) {
    const xpForThisLevel = level * 120;
    if (xp < accumulated + xpForThisLevel) {
      const xpInLevel = xp - accumulated;
      const pct = Math.min(100, Math.round((xpInLevel / xpForThisLevel) * 100));

      const matchedTitle = [...LEVEL_TITLES].reverse().find((t) => level >= t.level) || LEVEL_TITLES[0];

      return {
        levelNumber: level,
        title: matchedTitle.title,
        titleDe: matchedTitle.titleDe,
        currentXp: xp,
        xpInLevel,
        xpNeededForNext: xpForThisLevel - xpInLevel,
        levelProgressPct: pct,
      };
    }
    accumulated += xpForThisLevel;
    level++;
  }
}

export function getUserTotalXp(): number {
  if (typeof window === "undefined") return 680;
  try {
    const stored = localStorage.getItem(STORAGE_XP_KEY);
    return stored ? Number(stored) : 680; // Baseline demo XP
  } catch {
    return 680;
  }
}

export function addXp(amount: number): { nextXp: number; leveledUp: boolean; nextLevel: UserLevelInfo } {
  const current = getUserTotalXp();
  const beforeLevel = getLevelInfoFromXp(current);
  const nextXp = current + amount;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_XP_KEY, String(nextXp));
  }

  const nextLevel = getLevelInfoFromXp(nextXp);
  const leveledUp = nextLevel.levelNumber > beforeLevel.levelNumber;

  return { nextXp, leveledUp, nextLevel };
}

export function getUserBadges(): BadgeItem[] {
  if (typeof window === "undefined") return ALL_BADGES;
  try {
    const raw = localStorage.getItem(STORAGE_BADGES_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_BADGES_KEY, JSON.stringify(ALL_BADGES));
      return ALL_BADGES;
    }
    return JSON.parse(raw);
  } catch {
    return ALL_BADGES;
  }
}

export function unlockBadge(badgeId: string): BadgeItem | null {
  const badges = getUserBadges();
  const idx = badges.findIndex((b) => b.id === badgeId || b.code === badgeId);

  if (idx >= 0 && !badges[idx].unlocked) {
    badges[idx].unlocked = true;
    badges[idx].unlockedAt = new Date().toISOString();
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_BADGES_KEY, JSON.stringify(badges));
    }
    addXp(badges[idx].xpBonus);
    return badges[idx];
  }
  return null;
}

/* ─────────────────────────────────────────────────────────────────────────────
   LEADERBOARDS (OPT-IN)
───────────────────────────────────────────────────────────────────────────── */
export function isLeaderboardOptedIn(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(STORAGE_OPT_IN_KEY) !== "false";
}

export function setLeaderboardOptIn(optIn: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_OPT_IN_KEY, String(optIn));
}

export const SEEDED_LEADERBOARD: LeaderboardUser[] = [
  { id: "u-1", rank: 1, name: "Sophie M.", avatar: "👩🏼", xp: 3420, streak: 42, level: "B1" },
  { id: "u-2", rank: 2, name: "Maximilian K.", avatar: "👨🏻", xp: 3150, streak: 35, level: "A2" },
  { id: "u-3", rank: 3, name: "Elena R.", avatar: "👩🏽", xp: 2890, streak: 28, level: "B1" },
  { id: "u-4", rank: 4, name: "Lucas Chen", avatar: "👨🏻‍💻", xp: 2640, streak: 21, level: "A2" },
  { id: "u-5", rank: 5, name: "Sara Al-Mansoor", avatar: "🧕🏽", xp: 2310, streak: 19, level: "A1" },
  { id: "u-6", rank: 6, name: "Matteo Rossi", avatar: "👨🏽", xp: 2100, streak: 15, level: "A2" },
  { id: "u-7", rank: 7, name: "You (Alex S.)", avatar: "🇩🇪", xp: 1850, streak: 7, level: "A1", isCurrentUser: true },
  { id: "u-8", rank: 8, name: "Priya Sharma", avatar: "👩🏾", xp: 1720, streak: 12, level: "A1" },
  { id: "u-9", rank: 9, name: "Jonas Weber", avatar: "👱🏼‍♂️", xp: 1580, streak: 8, level: "A1" },
  { id: "u-10", rank: 10, name: "Chloe Dubois", avatar: "👩🏻", xp: 1450, streak: 6, level: "A1" },
];

export function getWeeklyLeaderboard(): LeaderboardUser[] {
  const currentXp = getUserTotalXp();
  return SEEDED_LEADERBOARD.map((u) => {
    if (u.isCurrentUser) {
      return { ...u, xp: Math.max(u.xp, currentXp) };
    }
    return u;
  }).sort((a, b) => b.xp - a.xp).map((u, i) => ({ ...u, rank: i + 1 }));
}
