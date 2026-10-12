import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { calculateSm2, type SrsCardState } from "../sm2.ts";
import { calculateNextStreak, type StreakData } from "../streakService.ts";
import { evaluateQuizSubmission, type QuizEvaluationResult } from "../scoringLogic.ts";
import { getLevelInfoFromXp } from "../gamificationService.ts";

/**
 * End-to-End User Journey Simulation:
 * Signup → Onboarding → Lesson Player → Unit Quiz & Certificate
 */
describe("E2E User Journey: Signup → Onboarding → Lesson → Quiz", () => {
  // Shared state across the learner's journey
  let userSession: {
    userId: string;
    email: string;
    fullName: string;
    onboardingCompleted: boolean;
    goalSettings: {
      targetLevel: string;
      dailyMinutes: number;
      examDate: string;
      learningReason: string;
    } | null;
    totalXp: number;
    streak: StreakData;
    completedLessonIds: string[];
    unlockedBadges: string[];
    srsDeck: Record<string, SrsCardState>;
    quizAttempts: {
      quizId: string;
      score: number;
      percentage: number;
      passed: boolean;
      completedAt: string;
    }[];
  };

  it("Step 1: User Signup & Profile Provisioning", () => {
    // Simulate user registration
    const newUserId = "usr-test-12345";
    const initialStreak: StreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezeCredits: 1, // New user welcome freeze shield
      isFreezeEquipped: true,
      freezeUsedDates: [],
      todayCompleted: false,
    };

    userSession = {
      userId: newUserId,
      email: "learner@example.com",
      fullName: "Gaurav Pratap",
      onboardingCompleted: false,
      goalSettings: null,
      totalXp: 0,
      streak: initialStreak,
      completedLessonIds: [],
      unlockedBadges: [],
      srsDeck: {},
      quizAttempts: [],
    };

    assert.equal(userSession.userId, "usr-test-12345");
    assert.equal(userSession.onboardingCompleted, false);
    assert.equal(userSession.totalXp, 0);
    assert.equal(userSession.streak.currentStreak, 0);
    assert.equal(userSession.streak.freezeCredits, 1);
  });

  it("Step 2: Onboarding Setup & Target Trajectory", () => {
    // User configures personalized learning commitments
    userSession.goalSettings = {
      targetLevel: "b1",
      dailyMinutes: 20,
      examDate: "2027-04-15",
      learningReason: "work",
    };
    userSession.onboardingCompleted = true;

    // Welcome onboarding XP award (+50 XP) and First Step badge
    userSession.totalXp += 50;
    userSession.unlockedBadges.push("b-first-step");

    const levelInfo = getLevelInfoFromXp(userSession.totalXp);

    assert.equal(userSession.onboardingCompleted, true);
    assert.equal(userSession.goalSettings.targetLevel, "b1");
    assert.equal(userSession.goalSettings.dailyMinutes, 20);
    assert.equal(userSession.totalXp, 50);
    assert.equal(levelInfo.levelNumber, 1);
    assert.equal(userSession.unlockedBadges.includes("b-first-step"), true);
  });

  it("Step 3: Interactive Lesson Player Completion & Daily Streak Initiation", () => {
    const lessonId = "a1-u1-l1";
    const lessonXpReward = 25;

    // Simulate studying lesson vocabulary & dialogue
    const studiedWord = "der Kaffee";
    const todayDate = "2026-10-12";

    // Add studied vocabulary to user's spaced-repetition flashcard deck
    userSession.srsDeck[studiedWord] = calculateSm2(
      { repetitions: 0, interval: 0, easeFactor: 2.5 },
      "good",
      new Date(todayDate)
    );

    // Complete lesson
    userSession.completedLessonIds.push(lessonId);
    userSession.totalXp += lessonXpReward;

    // Trigger streak calculation
    const { nextStreak } = calculateNextStreak(userSession.streak, todayDate);
    userSession.streak = nextStreak;

    assert.equal(userSession.completedLessonIds.includes(lessonId), true);
    assert.equal(userSession.totalXp, 75); // 50 + 25 = 75 XP
    assert.equal(userSession.streak.currentStreak, 1);
    assert.equal(userSession.streak.todayCompleted, true);
    assert.equal(userSession.srsDeck[studiedWord].repetitions, 1);
    assert.equal(userSession.srsDeck[studiedWord].interval, 1);
  });

  it("Step 4: Unit Quiz Examination & Mastery Evaluation", () => {
    // 10-Question A1 Unit 1 Quiz
    const quizQuestions = [
      { id: "q1", section: "grammar" as const, topic: "Personal Pronouns", correctAnswer: 0, points: 1 },
      { id: "q2", section: "vocabulary" as const, topic: "Farewells", correctAnswer: 2, points: 1 },
      { id: "q3", section: "grammar" as const, topic: "Verb sein", correctAnswer: 1, points: 1 },
      { id: "q4", section: "vocabulary" as const, topic: "Origins aus", correctAnswer: 0, points: 1 },
      { id: "q5", section: "grammar" as const, topic: "Question Words", correctAnswer: 1, points: 1 },
      { id: "q6", section: "grammar" as const, topic: "Verb wohnen", correctAnswer: 0, points: 1 },
      { id: "q7", section: "vocabulary" as const, topic: "Greetings", correctAnswer: 1, points: 1 },
      { id: "q8", section: "reading" as const, topic: "Intro Dialogue", correctAnswer: 0, points: 1 },
      { id: "q9", section: "vocabulary" as const, topic: "Polite Bitte", correctAnswer: 2, points: 1 },
      { id: "q10", section: "grammar" as const, topic: "Gender der/die/das", correctAnswer: 0, points: 1 },
    ];

    // User submits 8 correct answers out of 10 (80% passing score)
    const userAnswers: Record<string, number> = {
      q1: 0, // correct
      q2: 2, // correct
      q3: 1, // correct
      q4: 0, // correct
      q5: 1, // correct
      q6: 0, // correct
      q7: 1, // correct
      q8: 0, // correct
      q9: 0, // WRONG (was 2, answered 0)
      q10: 1, // WRONG (was 0, answered 1)
    };

    const evaluation: QuizEvaluationResult = evaluateQuizSubmission(quizQuestions, userAnswers, 70);

    assert.equal(evaluation.score, 8);
    assert.equal(evaluation.maxScore, 10);
    assert.equal(evaluation.percentage, 80);
    assert.equal(evaluation.passed, true);

    // Record attempt
    userSession.quizAttempts.push({
      quizId: "quiz-a1-u1",
      score: evaluation.score,
      percentage: evaluation.percentage,
      passed: evaluation.passed,
      completedAt: new Date().toISOString(),
    });

    // Pass award: +50 XP bonus and unlock Quiz Victor badge
    userSession.totalXp += 50;
    userSession.unlockedBadges.push("b-quiz-victor");

    const levelInfo = getLevelInfoFromXp(userSession.totalXp);

    assert.equal(userSession.totalXp, 125); // 75 + 50 = 125 XP
    assert.equal(levelInfo.levelNumber, 2); // Leveled up to Level 2 (Explorer)!
    assert.equal(userSession.unlockedBadges.includes("b-quiz-victor"), true);
    assert.equal(userSession.quizAttempts.length, 1);
    assert.equal(userSession.quizAttempts[0].passed, true);
  });
});
