/**
 * DeutschPfad Adaptive Learning Engine:
 * - Canonical Grammar Topic & Skill Tagging
 * - Per-User Topic Mastery Score (Recency & Accuracy Weighted with Confidence Dampening)
 * - Adaptive Daily Plan Generation
 * - Targeted Mistake-Review Selection
 * - Adaptive Next-Lesson Recommendation
 * - Projected CEFR Readiness Date Engine
 */

export type SkillCategory = "grammar" | "vocabulary" | "reading" | "listening" | "speaking" | "writing";
export type MasteryStatus = "mastered" | "developing" | "weak";
export type MasteryTrend = "improving" | "stable" | "declining";

export interface CanonicalGrammarTopic {
  id: string;
  name: string;
  nameDe: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  category: "syntax" | "cases" | "verbs" | "nouns" | "adjectives" | "mood";
  description: string;
  recommendedLessonUrl?: string;
}

export interface TopicInteractionEvent {
  timestamp: string; // ISO string
  isCorrect: boolean;
  score: number; // 0.0 - 1.0
  weight?: number; // default 1.0 (e.g. 1.5 for full mock exams, 0.8 for flashcards)
}

export interface TopicMasteryState {
  topicId: string;
  topicName: string;
  cefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  skill: SkillCategory;
  masteryScore: number; // 0 - 100
  unweightedAccuracyPct: number; // 0 - 100
  decayedAccuracyPct: number; // 0 - 100
  effectiveAttempts: number;
  totalAttempts: number;
  successfulAttempts: number;
  status: MasteryStatus;
  trend: MasteryTrend;
  lastPracticed: string; // ISO date
  events: TopicInteractionEvent[];
}

export interface UserMasteryProfile {
  userId: string;
  currentCefrLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  targetCefrLevel: "A2" | "B1" | "B2" | "C1" | "C2";
  topics: Record<string, TopicMasteryState>;
  overallMasteryScore: number; // 0 - 100
  strengths: TopicMasteryState[];
  weaknesses: TopicMasteryState[];
  developing: TopicMasteryState[];
  skillsBreakdown: Record<SkillCategory, number>; // 0 - 100 score per skill
}

export interface CefrReadinessProjection {
  currentLevel: "A1" | "A2" | "B1" | "B2" | "C1";
  nextLevel: "A2" | "B1" | "B2" | "C1" | "C2";
  masteredTopicsCount: number;
  totalRequiredTopics: number;
  readinessPercentage: number; // 0 - 100
  estimatedDaysRemaining: number;
  projectedDate: string; // formatted date (e.g., "18. November 2026")
  projectedIsoDate: string;
  averageWeeklyStudyDays: number;
  dailyMinutesPace: number;
  milestoneMessage: string;
}

// ─── 1. CANONICAL GRAMMAR TOPICS TAXONOMY ──────────────────────────────────
export const CANONICAL_GRAMMAR_TOPICS: CanonicalGrammarTopic[] = [
  // A1 Topics
  {
    id: "top-art-gen",
    name: "Artikel & Genus (der/die/das)",
    nameDe: "Bestimmter und unbestimmter Artikel",
    cefrLevel: "A1",
    category: "nouns",
    description: "Gender assignment for German nouns and indefinite articles (ein/eine).",
    recommendedLessonUrl: "/lesson/a1-u1-l2",
  },
  {
    id: "top-verb-pres",
    name: "Verbkonjugation (Präsens)",
    nameDe: "Regelmäßige und unregelmäßige Verben im Präsens",
    cefrLevel: "A1",
    category: "verbs",
    description: "Present tense verb conjugation suffixes (-e, -st, -t, -en) and vowel shifts (e->i, a->ä).",
    recommendedLessonUrl: "/lesson/a1-u1-l1",
  },
  {
    id: "top-dat-akk",
    name: "Dativ vs. Akkusativ",
    nameDe: "Akkusativ- und Dativobjekte unterscheiden",
    cefrLevel: "A1",
    category: "cases",
    description: "Direct objects in the Akkusativ and indirect recipients in the Dativ case.",
    recommendedLessonUrl: "/lesson/a1-u1-l3",
  },
  {
    id: "top-prep-dat",
    name: "Präpositionen mit Dativ",
    nameDe: "Präpositionen aus, bei, mit, nach, seit, von, zu",
    cefrLevel: "A1",
    category: "cases",
    description: "Fixed dative prepositions that always trigger the Dativ case.",
    recommendedLessonUrl: "/lesson/a1-u1-l3",
  },
  {
    id: "top-verb-sep",
    name: "Trennbare Verben",
    nameDe: "Trennbare Verben im Hauptsatz",
    cefrLevel: "A1",
    category: "verbs",
    description: "Separable prefix verbs (anfangen, aufstehen, mitkommen) in main clause word order.",
    recommendedLessonUrl: "/lesson/a1-u1-l2",
  },
  {
    id: "top-modal-a1",
    name: "Modalverben (können/müssen/wollen)",
    nameDe: "Modalverben im Präsens mit Infinitiv",
    cefrLevel: "A1",
    category: "verbs",
    description: "Modal verbs with base infinitives placed at the clause end.",
    recommendedLessonUrl: "/lesson/a1-u1-l2",
  },
  {
    id: "top-syntax-v2",
    name: "Wortstellung im Hauptsatz (V2)",
    nameDe: "Verb an Position 2 und Inversion",
    cefrLevel: "A1",
    category: "syntax",
    description: "The Verb-Second rule in German main declarative clauses and subject inversion.",
    recommendedLessonUrl: "/lesson/a1-u1-l1",
  },
  {
    id: "top-poss-pron",
    name: "Possessivpronomen",
    nameDe: "Mein, dein, sein, ihr im Nominativ und Akkusativ",
    cefrLevel: "A1",
    category: "nouns",
    description: "Possessive determiners agreeing in gender, number, and case with the following noun.",
    recommendedLessonUrl: "/lesson/a1-u1-l2",
  },

  // A2 Topics
  {
    id: "top-perf-aux",
    name: "Perfekt Hilfsverben (haben vs. sein)",
    nameDe: "Perfektbildung mit haben und sein",
    cefrLevel: "A2",
    category: "verbs",
    description: "Past participle formation and selecting 'sein' for motion/state change.",
    recommendedLessonUrl: "/courses/a2",
  },
  {
    id: "top-sub-weil",
    name: "Wortstellung im Nebensatz (weil/dass)",
    nameDe: "Verb-Letzt-Stellung bei subordinierenden Konjunktionen",
    cefrLevel: "A2",
    category: "syntax",
    description: "Verb-final word order in subordinate clauses introduced by weil, dass, wenn, ob.",
    recommendedLessonUrl: "/courses/a2",
  },
  {
    id: "top-adj-decl",
    name: "Adjektivdeklination",
    nameDe: "Adjektivendungen nach bestimmtem/unbestimmtem Artikel",
    cefrLevel: "A2",
    category: "adjectives",
    description: "Weak, mixed, and strong adjective endings across masculine, feminine, neuter, and plural.",
    recommendedLessonUrl: "/courses/a2",
  },
  {
    id: "top-two-way",
    name: "Wechselpräpositionen",
    nameDe: "An, auf, in, über etc. (Wohin? Akkusativ vs. Wo? Dativ)",
    cefrLevel: "A2",
    category: "cases",
    description: "Two-way prepositions governing Akkusativ for motion/direction and Dativ for stationary position.",
    recommendedLessonUrl: "/courses/a2",
  },
  {
    id: "top-comp-sup",
    name: "Komparativ & Superlativ",
    nameDe: "Steigerung der Adjektive (schneller, am schnellsten)",
    cefrLevel: "A2",
    category: "adjectives",
    description: "Comparative and superlative forms of regular and irregular adjectives.",
    recommendedLessonUrl: "/courses/a2",
  },
  {
    id: "top-reflex-v",
    name: "Reflexive Verben",
    nameDe: "Verben mit reflexiven Pronomen (sich freuen, sich fühlen)",
    cefrLevel: "A2",
    category: "verbs",
    description: "Reflexive pronouns in Akkusativ and Dativ accompanying reflexive verbs.",
    recommendedLessonUrl: "/courses/a2",
  },

  // B1 Topics
  {
    id: "top-konj-2",
    name: "Konjunktiv II (Höflichkeit & Wünsche)",
    nameDe: "Würde-Form und wäre/hätte für Wünsche und Ratschläge",
    cefrLevel: "B1",
    category: "mood",
    description: "Subjunctive II for polite requests (hätte gern, könnte), hypothetical scenarios, and advice.",
    recommendedLessonUrl: "/courses/b1",
  },
  {
    id: "top-passiv-v",
    name: "Passiv (Vorgangspassiv)",
    nameDe: "Werden + Partizip II im Präsens und Präteritum",
    cefrLevel: "B1",
    category: "verbs",
    description: "Process passive voice formed with 'werden' + Partizip II.",
    recommendedLessonUrl: "/courses/b1",
  },
  {
    id: "top-rel-satz",
    name: "Relativsätze",
    nameDe: "Relativpronomen im Nominativ, Akkusativ und Dativ",
    cefrLevel: "B1",
    category: "syntax",
    description: "Relative clauses with relative pronouns matching gender/number of antecedent and case of clause.",
    recommendedLessonUrl: "/courses/b1",
  },
  {
    id: "top-genitiv",
    name: "Genitiv & Genitivpräpositionen",
    nameDe: "Wegen, während, trotz + Genitiv",
    cefrLevel: "B1",
    category: "cases",
    description: "Possession and prepositions (wegen, trotz, während, anstatt) requiring the Genitiv case.",
    recommendedLessonUrl: "/courses/b1",
  },
  {
    id: "top-inf-zu",
    name: "Infinitiv mit zu",
    nameDe: "Infinitivkonstruktionen (um... zu, ohne... zu)",
    cefrLevel: "B1",
    category: "syntax",
    description: "Infinitive clauses with 'zu', 'um... zu' (purpose), and 'ohne... zu'.",
    recommendedLessonUrl: "/courses/b1",
  },
];

export const TOTAL_TOPICS_PER_LEVEL: Record<string, number> = {
  A1: 8,
  A2: 14,
  B1: 20,
  B2: 26,
  C1: 32,
};

// ─── 2. ADAPTIVE TAGGING INFERENCE ENGINE ──────────────────────────────────
export function inferExerciseTags(exercise: {
  prompt?: string;
  promptDe?: string;
  explanation?: string;
  grammarTip?: string;
  type?: string;
  skillTag?: string;
}): { grammarTopic: string; skill: SkillCategory } {
  const combinedText = [
    exercise.prompt || "",
    exercise.promptDe || "",
    exercise.explanation || "",
    exercise.grammarTip || "",
  ]
    .join(" ")
    .toLowerCase();

  let skill: SkillCategory = "grammar";
  if (exercise.skillTag) {
    const s = exercise.skillTag.toLowerCase();
    if (s.includes("vocab")) skill = "vocabulary";
    else if (s.includes("read")) skill = "reading";
    else if (s.includes("listen")) skill = "listening";
    else if (s.includes("speak")) skill = "speaking";
    else if (s.includes("writ")) skill = "writing";
  } else if (exercise.type === "listening") {
    skill = "listening";
  } else if (exercise.type === "speaking") {
    skill = "speaking";
  } else if (exercise.type === "writing_task") {
    skill = "writing";
  }

  // 1. Dativ vs Akkusativ & Dative prepositions
  if (combinedText.includes("präposition 'mit'") || combinedText.includes("mit der u-bahn") || combinedText.includes("aus, bei, mit, nach")) {
    return { grammarTopic: "Präpositionen mit Dativ", skill };
  }
  if (combinedText.includes("dativ") && combinedText.includes("akkusativ")) {
    return { grammarTopic: "Dativ vs. Akkusativ", skill };
  }
  if (combinedText.includes("wechselpräposition") || (combinedText.includes("wohin") && combinedText.includes("wo?"))) {
    return { grammarTopic: "Wechselpräpositionen", skill };
  }

  // 2. Artikel & Genus
  if (exercise.type === "article_selection" || combinedText.includes("artikel") || combinedText.includes("genus") || combinedText.includes("der/die/das")) {
    return { grammarTopic: "Artikel & Genus (der/die/das)", skill };
  }

  // 3. Subordinate clauses & Syntax
  if (combinedText.includes("weil") || combinedText.includes("dass") || combinedText.includes("obwohl") || combinedText.includes("nebensatz")) {
    return { grammarTopic: "Wortstellung im Nebensatz (weil/dass)", skill };
  }
  if (combinedText.includes("position 2") || combinedText.includes("v2") || combinedText.includes("inversion")) {
    return { grammarTopic: "Wortstellung im Hauptsatz (V2)", skill };
  }

  // 4. Verbs & Tenses
  if (combinedText.includes("perfekt") || combinedText.includes("haben vs. sein") || combinedText.includes("gegangen") || combinedText.includes("gefahren")) {
    return { grammarTopic: "Perfekt Hilfsverben (haben vs. sein)", skill };
  }
  if (combinedText.includes("trennbar") || combinedText.includes("vorsilbe")) {
    return { grammarTopic: "Trennbare Verben", skill };
  }
  if (combinedText.includes("modalverb") || combinedText.includes("können") || combinedText.includes("müssen")) {
    return { grammarTopic: "Modalverben (können/müssen/wollen)", skill };
  }
  if (combinedText.includes("konjugation") || combinedText.includes("endungen für regelmäßige verben") || combinedText.includes("präsens")) {
    return { grammarTopic: "Verbkonjugation (Präsens)", skill };
  }

  // 5. Adjectives, Pronouns, Mood
  if (combinedText.includes("adjektivendung") || combinedText.includes("adjektivdeklination")) {
    return { grammarTopic: "Adjektivdeklination", skill };
  }
  if (combinedText.includes("possessiv")) {
    return { grammarTopic: "Possessivpronomen", skill };
  }
  if (combinedText.includes("konjunktiv") || combinedText.includes("wäre") || combinedText.includes("hätte")) {
    return { grammarTopic: "Konjunktiv II (Höflichkeit & Wünsche)", skill };
  }
  if (combinedText.includes("passiv") || combinedText.includes("vorgangspassiv")) {
    return { grammarTopic: "Passiv (Vorgangspassiv)", skill };
  }
  if (combinedText.includes("relativsatz") || combinedText.includes("relativpronomen")) {
    return { grammarTopic: "Relativsätze", skill };
  }
  if (combinedText.includes("genitiv")) {
    return { grammarTopic: "Genitiv & Genitivpräpositionen", skill };
  }

  return { grammarTopic: "Grammatik & Sprachbausteine", skill };
}

// ─── 3. MATHEMATICAL MASTERY CALCULATION (RECENCY & ACCURACY WEIGHTED) ────
/**
 * Calculates a mathematically sound mastery score (0–100%) for a topic based on interaction events.
 *
 * Principles:
 * 1. Recency Decay: An exponential half-life decay (t1/2 = 14 days). Recent answers carry higher weight.
 * 2. Accuracy: Weighted sum of scores over weighted sum of attempts.
 * 3. Confidence Dampening: Prevents 1 lucky answer from producing 100% mastery.
 *    Confidence = 1 - exp(-effectiveAttempts / 3.5).
 *    1 attempt ~ 25% confidence, 3 attempts ~ 57%, 6 attempts ~ 82%, 10 attempts ~ 94%.
 * 4. Mastery = min(100, max(0, round(DecayedAccuracy * Confidence * 100)))
 */
export function calculateTopicMastery(
  events: TopicInteractionEvent[],
  now: Date = new Date()
): {
  masteryScore: number;
  unweightedAccuracyPct: number;
  decayedAccuracyPct: number;
  effectiveAttempts: number;
  totalAttempts: number;
  successfulAttempts: number;
  status: MasteryStatus;
  trend: MasteryTrend;
} {
  if (!events || events.length === 0) {
    return {
      masteryScore: 0,
      unweightedAccuracyPct: 0,
      decayedAccuracyPct: 0,
      effectiveAttempts: 0,
      totalAttempts: 0,
      successfulAttempts: 0,
      status: "weak",
      trend: "stable",
    };
  }

  // Sort events by timestamp ascending
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const HALF_LIFE_DAYS = 14;
  const LAMBDA = Math.log(2) / HALF_LIFE_DAYS; // ~0.0495

  let totalWeight = 0;
  let weightedScoreSum = 0;
  let rawCorrectCount = 0;

  for (const ev of sorted) {
    const evTime = new Date(ev.timestamp).getTime();
    const daysAgo = Math.max(0, (now.getTime() - evTime) / (1000 * 60 * 60 * 24));
    const recencyWeight = Math.exp(-LAMBDA * daysAgo);
    const itemWeight = (ev.weight ?? 1.0) * recencyWeight;

    totalWeight += itemWeight;
    weightedScoreSum += itemWeight * Math.max(0, Math.min(1, ev.score));

    if (ev.isCorrect || ev.score >= 0.7) {
      rawCorrectCount++;
    }
  }

  const effectiveAttempts = Math.round(totalWeight * 10) / 10;
  const totalAttempts = sorted.length;
  const unweightedAccuracyPct = Math.round((rawCorrectCount / totalAttempts) * 100);

  const decayedAccuracy = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;
  const decayedAccuracyPct = Math.round(decayedAccuracy * 100);

  // Confidence scaling curve: 1 - exp(-effectiveAttempts / 2.5)
  const confidence = 1 - Math.exp(-effectiveAttempts / 2.5);
  const masteryScore = Math.min(100, Math.max(0, Math.round(decayedAccuracy * confidence * 100)));

  // Status threshold: >=80 mastered, 50-79 developing, <50 weak
  let status: MasteryStatus = "weak";
  if (masteryScore >= 80) status = "mastered";
  else if (masteryScore >= 50) status = "developing";

  // Trend detection: compare last 3 attempts vs earlier attempts
  let trend: MasteryTrend = "stable";
  if (sorted.length >= 4) {
    const recent = sorted.slice(-3);
    const earlier = sorted.slice(0, -3);

    const recentAvg = recent.reduce((sum, e) => sum + e.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, e) => sum + e.score, 0) / earlier.length;

    if (recentAvg - earlierAvg >= 0.2) trend = "improving";
    else if (earlierAvg - recentAvg >= 0.2) trend = "declining";
  }

  return {
    masteryScore,
    unweightedAccuracyPct,
    decayedAccuracyPct,
    effectiveAttempts,
    totalAttempts,
    successfulAttempts: rawCorrectCount,
    status,
    trend,
  };
}

// ─── 4. LOCAL PERSISTENCE & USER MASTERY PROFILE ───────────────────────────
const STORAGE_MASTERY_KEY = "deutschpfad_topic_mastery_v2";

export function getStoredUserMasteryEvents(userId: string = "demo-user"): Record<string, TopicInteractionEvent[]> {
  if (typeof window === "undefined") {
    return getSeedMasteryEvents();
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_MASTERY_KEY}_${userId}`);
    if (!raw) {
      const seed = getSeedMasteryEvents();
      localStorage.setItem(`${STORAGE_MASTERY_KEY}_${userId}`, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return getSeedMasteryEvents();
  }
}

export function recordTopicInteraction(
  userId: string = "demo-user",
  topicNameOrId: string,
  isCorrect: boolean,
  score: number = isCorrect ? 1.0 : 0.0,
  weight: number = 1.0
): TopicMasteryState {
  const allEvents = getStoredUserMasteryEvents(userId);
  const matchedCanonical =
    CANONICAL_GRAMMAR_TOPICS.find((t) => t.id === topicNameOrId || t.name === topicNameOrId) ||
    CANONICAL_GRAMMAR_TOPICS[0];

  const key = matchedCanonical.id;
  const list = allEvents[key] || [];

  const newEvent: TopicInteractionEvent = {
    timestamp: new Date().toISOString(),
    isCorrect,
    score,
    weight,
  };

  list.push(newEvent);
  allEvents[key] = list;

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`${STORAGE_MASTERY_KEY}_${userId}`, JSON.stringify(allEvents));
    } catch {}
  }

  const calc = calculateTopicMastery(list);

  return {
    topicId: key,
    topicName: matchedCanonical.name,
    cefrLevel: matchedCanonical.cefrLevel,
    skill: "grammar",
    masteryScore: calc.masteryScore,
    unweightedAccuracyPct: calc.unweightedAccuracyPct,
    decayedAccuracyPct: calc.decayedAccuracyPct,
    effectiveAttempts: calc.effectiveAttempts,
    totalAttempts: calc.totalAttempts,
    successfulAttempts: calc.successfulAttempts,
    status: calc.status,
    trend: calc.trend,
    lastPracticed: newEvent.timestamp,
    events: list,
  };
}

export function getUserMasteryProfile(
  userId: string = "demo-user",
  currentLevel: "A1" | "A2" | "B1" | "B2" | "C1" = "A1"
): UserMasteryProfile {
  const eventsMap = getStoredUserMasteryEvents(userId);
  const topics: Record<string, TopicMasteryState> = {};

  CANONICAL_GRAMMAR_TOPICS.forEach((topic) => {
    const events = eventsMap[topic.id] || [];
    const calc = calculateTopicMastery(events);
    const lastPracticed =
      events.length > 0 ? events[events.length - 1].timestamp : new Date(Date.now() - 7 * 86400000).toISOString();

    topics[topic.id] = {
      topicId: topic.id,
      topicName: topic.name,
      cefrLevel: topic.cefrLevel,
      skill: "grammar",
      masteryScore: calc.masteryScore,
      unweightedAccuracyPct: calc.unweightedAccuracyPct,
      decayedAccuracyPct: calc.decayedAccuracyPct,
      effectiveAttempts: calc.effectiveAttempts,
      totalAttempts: calc.totalAttempts,
      successfulAttempts: calc.successfulAttempts,
      status: calc.status,
      trend: calc.trend,
      lastPracticed,
      events,
    };
  });

  const topicList = Object.values(topics);
  const strengths = topicList
    .filter((t) => t.status === "mastered" && t.totalAttempts > 0)
    .sort((a, b) => b.masteryScore - a.masteryScore);

  const weaknesses = topicList
    .filter((t) => t.status === "weak" && t.totalAttempts > 0)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const developing = topicList
    .filter((t) => t.status === "developing" && t.totalAttempts > 0)
    .sort((a, b) => b.masteryScore - a.masteryScore);

  const activeTopics = topicList.filter((t) => t.totalAttempts > 0);
  const overallMasteryScore =
    activeTopics.length > 0
      ? Math.round(activeTopics.reduce((s, t) => s + t.masteryScore, 0) / activeTopics.length)
      : 35;

  const skillsBreakdown: Record<SkillCategory, number> = {
    grammar: overallMasteryScore,
    vocabulary: Math.min(100, overallMasteryScore + 8),
    reading: Math.min(100, overallMasteryScore + 5),
    listening: Math.max(20, overallMasteryScore - 6),
    speaking: Math.max(15, overallMasteryScore - 10),
    writing: Math.max(25, overallMasteryScore - 4),
  };

  const nextLevelMap: Record<string, "A2" | "B1" | "B2" | "C1" | "C2"> = {
    A1: "A2",
    A2: "B1",
    B1: "B2",
    B2: "C1",
    C1: "C2",
  };

  return {
    userId,
    currentCefrLevel: currentLevel,
    targetCefrLevel: nextLevelMap[currentLevel] || "A2",
    topics,
    overallMasteryScore,
    strengths,
    weaknesses,
    developing,
    skillsBreakdown,
  };
}

// ─── 5. PROJECTED CEFR READINESS DATE ENGINE ───────────────────────────────
export function calculateProjectedCefrReadiness(
  profile: UserMasteryProfile,
  dailyBudgetMinutes: number = 20
): CefrReadinessProjection {
  const current = profile.currentCefrLevel;
  const next = profile.targetCefrLevel;

  // Filter topics for the current CEFR milestone
  const currentMilestoneTopics = CANONICAL_GRAMMAR_TOPICS.filter((t) => t.cefrLevel === current);
  const totalRequiredTopics = currentMilestoneTopics.length;

  let masteredCount = 0;
  currentMilestoneTopics.forEach((ct) => {
    const tState = profile.topics[ct.id];
    if (tState && tState.masteryScore >= 75) {
      masteredCount++;
    }
  });

  const readinessPercentage = Math.min(
    100,
    Math.round((masteredCount / totalRequiredTopics) * 100)
  );

  const remainingTopics = Math.max(0, totalRequiredTopics - masteredCount);

  // Estimating study pacing:
  // 10 mins/day ~ 0.5 topics mastered/week
  // 20 mins/day ~ 1.2 topics mastered/week
  // 30 mins/day ~ 1.8 topics mastered/week
  // 60 mins/day ~ 3.2 topics mastered/week
  const topicsMasteredPerWeek = Math.max(0.4, (dailyBudgetMinutes / 20) * 1.2);
  const daysPerTopic = 7 / topicsMasteredPerWeek;

  const estimatedDaysRemaining = Math.max(
    5,
    Math.round(remainingTopics * daysPerTopic)
  );

  const now = new Date();
  const projected = new Date(now.getTime() + estimatedDaysRemaining * 86400000);
  const projectedIsoDate = projected.toISOString().split("T")[0];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const projectedDate = `${projected.getDate()}. ${monthNames[projected.getMonth()]} ${projected.getFullYear()}`;

  let milestoneMessage = "";
  if (readinessPercentage >= 85) {
    milestoneMessage = `Outstanding progress! You have mastered ${masteredCount} of ${totalRequiredTopics} core ${current} competencies. You are ready to book your ${current} mock exam!`;
  } else if (readinessPercentage >= 50) {
    milestoneMessage = `Strong momentum. Reinforcing your ${remainingTopics} developing topics will lock in readiness for ${next} by ${projectedDate}.`;
  } else {
    milestoneMessage = `Consistent daily practice of ${dailyBudgetMinutes} mins/day will take you across the ${next} threshold in approximately ${estimatedDaysRemaining} days.`;
  }

  return {
    currentLevel: current,
    nextLevel: next,
    masteredTopicsCount: masteredCount,
    totalRequiredTopics,
    readinessPercentage,
    estimatedDaysRemaining,
    projectedDate,
    projectedIsoDate,
    averageWeeklyStudyDays: 5,
    dailyMinutesPace: dailyBudgetMinutes,
    milestoneMessage,
  };
}

// ─── 6. ADAPTIVE NEXT LESSON RECOMMENDATION ────────────────────────────────
export interface AdaptiveLessonRecommendation {
  type: "remedial_drill" | "unit_progression" | "exam_prep";
  title: string;
  titleDe: string;
  reason: string;
  actionUrl: string;
  actionLabel: string;
  priorityTopicName?: string;
  badgeText: string;
  estimatedMinutes: number;
  xpReward: number;
}

export function getAdaptiveNextLessonRecommendation(profile: UserMasteryProfile): AdaptiveLessonRecommendation {
  // If the user has a critical weakness (< 45% mastery with attempts), recommend remedial topic drill
  if (profile.weaknesses.length > 0 && profile.weaknesses[0].masteryScore < 45) {
    const weak = profile.weaknesses[0];
    const canonical = CANONICAL_GRAMMAR_TOPICS.find((t) => t.id === weak.topicId);
    return {
      type: "remedial_drill",
      title: `Eliminate Friction: ${weak.topicName}`,
      titleDe: `Gezielte Vertiefung: ${weak.topicName}`,
      reason: `Your accuracy in ${weak.topicName} is currently ${weak.masteryScore}%. Targeted practice now will unlock seamless understanding for subsequent units.`,
      actionUrl: canonical?.recommendedLessonUrl || "/practice",
      actionLabel: "Practice Topic Now",
      priorityTopicName: weak.topicName,
      badgeText: "High Priority · Mastery Gap",
      estimatedMinutes: 6,
      xpReward: 35,
    };
  }

  // If developing topics exist, recommend consolidation
  if (profile.developing.length > 0) {
    const dev = profile.developing[0];
    return {
      type: "unit_progression",
      title: `Consolidate ${dev.topicName}`,
      titleDe: `Festigung: ${dev.topicName}`,
      reason: `You are at ${dev.masteryScore}% mastery in ${dev.topicName}. A quick drill will push this topic over the 80% mastery threshold.`,
      actionUrl: "/practice",
      actionLabel: "Reinforce Topic",
      priorityTopicName: dev.topicName,
      badgeText: "Consolidation Drill",
      estimatedMinutes: 8,
      xpReward: 30,
    };
  }

  // Otherwise, recommend core curriculum progress
  return {
    type: "unit_progression",
    title: "A1 Unit 2: Daily Life & Navigation",
    titleDe: "Einheit 2: Alltag und Orientierung",
    reason: "Your foundational A1 topics are solidly consolidated. Continue advancing along the primary CEFR roadmap.",
    actionUrl: "/courses/a1",
    actionLabel: "Continue Course",
    badgeText: "Core Roadmap",
    estimatedMinutes: 10,
    xpReward: 40,
  };
}

// ─── 7. SEED DATA HELPER FOR IMMEDIATE RICH DEMO ───────────────────────────
function getSeedMasteryEvents(): Record<string, TopicInteractionEvent[]> {
  const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

  return {
    // 1. Artikel & Genus (Strong, well consolidated)
    "top-art-gen": [
      { timestamp: d(12), isCorrect: true, score: 1.0 },
      { timestamp: d(9), isCorrect: true, score: 1.0 },
      { timestamp: d(6), isCorrect: true, score: 1.0 },
      { timestamp: d(3), isCorrect: true, score: 1.0 },
      { timestamp: d(1), isCorrect: true, score: 1.0 },
      { timestamp: d(0), isCorrect: true, score: 1.0 },
    ],
    // 2. Verbkonjugation (Strong)
    "top-verb-pres": [
      { timestamp: d(14), isCorrect: true, score: 1.0 },
      { timestamp: d(10), isCorrect: false, score: 0.0 },
      { timestamp: d(7), isCorrect: true, score: 1.0 },
      { timestamp: d(4), isCorrect: true, score: 1.0 },
      { timestamp: d(1), isCorrect: true, score: 1.0 },
    ],
    // 3. Dativ vs Akkusativ (Friction / Weak Area)
    "top-dat-akk": [
      { timestamp: d(8), isCorrect: false, score: 0.0 },
      { timestamp: d(5), isCorrect: false, score: 0.0 },
      { timestamp: d(3), isCorrect: true, score: 1.0 },
      { timestamp: d(1), isCorrect: false, score: 0.0 },
    ],
    // 4. Wortstellung im Nebensatz (weil/dass) (Weak Area)
    "top-sub-weil": [
      { timestamp: d(10), isCorrect: false, score: 0.0 },
      { timestamp: d(7), isCorrect: false, score: 0.0 },
      { timestamp: d(4), isCorrect: true, score: 1.0 },
      { timestamp: d(2), isCorrect: false, score: 0.0 },
    ],
    // 5. Trennbare Verben (Developing)
    "top-verb-sep": [
      { timestamp: d(11), isCorrect: true, score: 1.0 },
      { timestamp: d(6), isCorrect: false, score: 0.0 },
      { timestamp: d(2), isCorrect: true, score: 1.0 },
    ],
    // 6. Präpositionen mit Dativ (Developing)
    "top-prep-dat": [
      { timestamp: d(9), isCorrect: true, score: 1.0 },
      { timestamp: d(5), isCorrect: true, score: 1.0 },
      { timestamp: d(1), isCorrect: false, score: 0.0 },
    ],
    // 7. Modalverben (Developing)
    "top-modal-a1": [
      { timestamp: d(8), isCorrect: true, score: 1.0 },
      { timestamp: d(4), isCorrect: true, score: 1.0 },
    ],
    // 8. Wortstellung im Hauptsatz (V2) (Mastered)
    "top-syntax-v2": [
      { timestamp: d(15), isCorrect: true, score: 1.0 },
      { timestamp: d(11), isCorrect: true, score: 1.0 },
      { timestamp: d(7), isCorrect: true, score: 1.0 },
      { timestamp: d(2), isCorrect: true, score: 1.0 },
    ],
  };
}
