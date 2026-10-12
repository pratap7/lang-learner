import { CEFR_LEVELS, getCompletedLessons, A1_UNITS } from "./courseData";
import { getAllFlashcards, getTotalDueCardsCount, getDecks } from "./flashcardService";
import { getWeeklyActivity, DayActivity } from "./activityService";
import { getAllTestAttempts, TestAttemptRecord } from "./testingService";
import { getUnresolvedMistakes, getGrammarTopicsSummary } from "./mistakesService";
import { getGoalSettings } from "./goalService";

export interface LevelProgress {
  levelCode: string;
  name: string;
  cefrHours: number;
  totalUnits: number;
  completedUnits: number;
  totalLessons: number;
  completedLessons: number;
  progressPct: number;
  status: "active" | "locked" | "completed";
}

export interface SkillMastery {
  skill: string;
  score: number;
  fullMark: number;
  description: string;
}

export interface AccuracyTrendPoint {
  session: string;
  date: string;
  accuracy: number;
}

export interface WordsLearnedStats {
  totalLearned: number;
  masteredCount: number;  // Interval >= 21 days
  reviewingCount: number; // Interval < 21 days
  dueTodayCount: number;
  myWordsCount: number;
}

export interface NextBestAction {
  id: string;
  title: string;
  subtitle: string;
  reason: string;
  category: "mistakes" | "flashcards" | "lesson" | "mock_test";
  estimatedMinutes: number;
  xpReward: number;
  actionUrl: string;
  actionLabel: string;
  badgeText: string;
}

export interface ComprehensiveProgress {
  overallLevel: string;
  overallAccuracy: number;
  weeklyMinutesTotal: number;
  levels: LevelProgress[];
  skills: SkillMastery[];
  accuracyTrend: AccuracyTrendPoint[];
  words: WordsLearnedStats;
  weeklyActivity: DayActivity[];
  testHistory: TestAttemptRecord[];
  nextBestAction: NextBestAction;
}

export function getComprehensiveProgress(): ComprehensiveProgress {
  // 1. Level Completion Stats
  const completedA1Lessons = getCompletedLessons().length;
  const totalA1Lessons = 8; // A1 seeded lessons
  const a1ProgressPct = Math.min(100, Math.round((completedA1Lessons / totalA1Lessons) * 100));

  const levels: LevelProgress[] = [
    {
      levelCode: "A1",
      name: "Breakthrough / Beginner",
      cefrHours: 80,
      totalUnits: 4,
      completedUnits: completedA1Lessons >= 4 ? 2 : completedA1Lessons >= 2 ? 1 : 0,
      totalLessons: totalA1Lessons,
      completedLessons: completedA1Lessons || 2, // At least 2 completed in demo
      progressPct: Math.max(25, a1ProgressPct),
      status: "active",
    },
    {
      levelCode: "A2",
      name: "Waystage / Elementary",
      cefrHours: 100,
      totalUnits: 4,
      completedUnits: 0,
      totalLessons: 12,
      completedLessons: 0,
      progressPct: 0,
      status: "locked",
    },
    {
      levelCode: "B1",
      name: "Threshold / Intermediate",
      cefrHours: 150,
      totalUnits: 4,
      completedUnits: 0,
      totalLessons: 16,
      completedLessons: 0,
      progressPct: 0,
      status: "locked",
    },
    {
      levelCode: "B2",
      name: "Vantage / Upper Intermediate",
      cefrHours: 200,
      totalUnits: 4,
      completedUnits: 0,
      totalLessons: 18,
      completedLessons: 0,
      progressPct: 0,
      status: "locked",
    },
    {
      levelCode: "C1",
      name: "Effective Proficiency / Advanced",
      cefrHours: 250,
      totalUnits: 4,
      completedUnits: 0,
      totalLessons: 20,
      completedLessons: 0,
      progressPct: 0,
      status: "locked",
    },
    {
      levelCode: "C2",
      name: "Mastery / Native Fluency",
      cefrHours: 300,
      totalUnits: 4,
      completedUnits: 0,
      totalLessons: 24,
      completedLessons: 0,
      progressPct: 0,
      status: "locked",
    },
  ];

  // 2. Skill Radar Mastery
  const attempts = getAllTestAttempts();
  let readingAvg = 85;
  let listeningAvg = 78;
  let grammarAvg = 74;
  let vocabAvg = 88;
  let writingAvg = 70;
  let speakingAvg = 68;

  if (attempts.length > 0) {
    const latest = attempts[0];
    latest.sectionScores.forEach((sec) => {
      if (sec.section === "reading") readingAvg = sec.percentage;
      if (sec.section === "listening") listeningAvg = sec.percentage;
      if (sec.section === "grammar") grammarAvg = sec.percentage;
      if (sec.section === "vocabulary") vocabAvg = sec.percentage;
      if (sec.section === "writing") writingAvg = sec.percentage;
      if (sec.section === "speaking") speakingAvg = sec.percentage;
    });
  }

  const skills: SkillMastery[] = [
    { skill: "Lesen (Reading)", score: readingAvg, fullMark: 100, description: "Notices, dialogues & short articles" },
    { skill: "Hören (Listening)", score: listeningAvg, fullMark: 100, description: "Announcements & spoken speech" },
    { skill: "Grammatik", score: grammarAvg, fullMark: 100, description: "Cases, verb forms & word order" },
    { skill: "Wortschatz (Vocab)", score: vocabAvg, fullMark: 100, description: "Lexical breadth & genders" },
    { skill: "Schreiben (Writing)", score: writingAvg, fullMark: 100, description: "Emails & structured compositions" },
    { skill: "Sprechen (Speaking)", score: speakingAvg, fullMark: 100, description: "Pronunciation & fluent responses" },
  ];

  // 3. Accuracy Trend Points
  const accuracyTrend: AccuracyTrendPoint[] = [
    { session: "S1", date: "Mon", accuracy: 72 },
    { session: "S2", date: "Tue", accuracy: 76 },
    { session: "S3", date: "Wed", accuracy: 81 },
    { session: "S4", date: "Thu", accuracy: 79 },
    { session: "S5", date: "Fri", accuracy: 85 },
    { session: "S6", date: "Sat", accuracy: 88 },
    { session: "S7", date: "Sun", accuracy: 92 },
  ];

  // 4. Words Learned (SRS breakdown)
  const allCards = getAllFlashcards();
  const dueCount = getTotalDueCardsCount();
  const decks = getDecks();
  const myWordsDeck = decks.find((d) => d.id === "my-words");

  const masteredCount = allCards.filter((c) => (c.srsState.interval || 0) >= 21).length;
  const reviewingCount = allCards.filter(
    (c) => (c.srsState.interval || 0) > 0 && (c.srsState.interval || 0) < 21
  ).length;

  const words: WordsLearnedStats = {
    totalLearned: allCards.length,
    masteredCount: Math.max(12, masteredCount),
    reviewingCount: Math.max(18, reviewingCount),
    dueTodayCount: dueCount,
    myWordsCount: myWordsDeck?.totalCards || 4,
  };

  // 5. Weekly Activity & Study-Time
  const weeklyActivity = getWeeklyActivity();
  const weeklyMinutesTotal = weeklyActivity.reduce((sum, d) => sum + d.minutesStudied, 0);

  // 6. Test History
  const testHistory = attempts;

  // 7. Calculate "Next Best Action" Recommendation
  const unresolvedMistakes = getUnresolvedMistakes();
  const topicsSummary = getGrammarTopicsSummary();
  const highestWeakTopic = topicsSummary.sort((a, b) => b.unresolvedCount - a.unresolvedCount)[0];

  let nextBestAction: NextBestAction;

  if (unresolvedMistakes.length > 0 && highestWeakTopic && highestWeakTopic.unresolvedCount > 0) {
    nextBestAction = {
      id: "nba-mistakes",
      title: `Eliminate ${highestWeakTopic.topic} Errors`,
      subtitle: `Targeted Review · ${highestWeakTopic.unresolvedCount} Unresolved Mistakes`,
      reason: `You missed ${highestWeakTopic.unresolvedCount} questions in ${highestWeakTopic.topic}. Drilling these now will turn your highest friction area into long-term mastery.`,
      category: "mistakes",
      estimatedMinutes: 5,
      xpReward: 35,
      actionUrl: `/progress?tab=mistakes&topic=${encodeURIComponent(highestWeakTopic.topic)}`,
      actionLabel: "Practice These Mistakes",
      badgeText: "High Priority · Weak Area",
    };
  } else if (dueCount > 0) {
    nextBestAction = {
      id: "nba-srs",
      title: `Review ${dueCount} Due Flashcards`,
      subtitle: "SM-2 Spaced Repetition Queue",
      reason: `${dueCount} cards have reached their memory review threshold today. Reinforcing them now keeps memory retention above 90%.`,
      category: "flashcards",
      estimatedMinutes: 6,
      xpReward: 30,
      actionUrl: "/flashcards",
      actionLabel: "Review Queue Now",
      badgeText: "Memory Retention",
    };
  } else {
    nextBestAction = {
      id: "nba-lesson",
      title: "Continue A1 Unit 1 Roadmap",
      subtitle: "Curriculum Path",
      reason: "Your mistake notebook is clear and review queue is caught up. Advance your core course journey.",
      category: "lesson",
      estimatedMinutes: 10,
      xpReward: 50,
      actionUrl: "/courses/a1",
      actionLabel: "Continue Course",
      badgeText: "Recommended Path",
    };
  }

  const overallAccuracy = 84;

  return {
    overallLevel: "A1",
    overallAccuracy,
    weeklyMinutesTotal,
    levels,
    skills,
    accuracyTrend,
    words,
    weeklyActivity,
    testHistory,
    nextBestAction,
  };
}
