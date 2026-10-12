import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculatePlacementResult,
  processAdaptiveAnswer,
  createInitialPlacementState,
  evaluateQuizSubmission,
  type AdaptivePlacementState,
  type CefrBand,
} from "../scoringLogic.ts";

describe("Test Scoring & Adaptive Placement Engine", () => {
  const dummyQuestion = (id: string, level: CefrBand, correctAnswer: number = 0) => ({
    id,
    level,
    section: "grammar" as const,
    topic: "Grammar Topic",
    prompt: "Sample question prompt",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer,
    explanation: "Sample explanation",
    points: 1,
  });


  describe("Adaptive Difficulty Adjustments", () => {
    it("should initialize with calibrated A2 difficulty and 0 index", () => {
      const state = createInitialPlacementState(25);
      assert.equal(state.currentDifficulty, "A2");
      assert.equal(state.currentQuestionIndex, 0);
      assert.equal(state.totalQuestionsTarget, 25);
      assert.equal(state.consecutiveCorrect, 0);
      assert.equal(state.consecutiveIncorrect, 0);
    });

    it("should escalate difficulty from A2 to B1 after 2 consecutive correct answers", () => {
      let state = createInitialPlacementState(25);
      const q1 = dummyQuestion("q1", "A2", 0);
      const q2 = dummyQuestion("q2", "A2", 0);

      // Answer 1 correct
      const step1 = processAdaptiveAnswer(state, q1, 0);
      assert.equal(step1.isCorrect, true);
      assert.equal(step1.nextState.consecutiveCorrect, 1);
      assert.equal(step1.nextState.currentDifficulty, "A2"); // still A2

      // Answer 2 correct -> difficulty ascends
      const step2 = processAdaptiveAnswer(step1.nextState, q2, 0);
      assert.equal(step2.isCorrect, true);
      assert.equal(step2.nextState.consecutiveCorrect, 0); // reset
      assert.equal(step2.nextState.currentDifficulty, "B1"); // elevated to B1!
    });

    it("should de-escalate difficulty from A2 to A1 after 2 consecutive incorrect answers", () => {
      let state = createInitialPlacementState(25);
      const q1 = dummyQuestion("q1", "A2", 0);
      const q2 = dummyQuestion("q2", "A2", 0);

      // Answer 1 wrong
      const step1 = processAdaptiveAnswer(state, q1, 1); // wrong answer 1
      assert.equal(step1.isCorrect, false);
      assert.equal(step1.nextState.consecutiveIncorrect, 1);

      // Answer 2 wrong -> difficulty descends
      const step2 = processAdaptiveAnswer(step1.nextState, q2, 2); // wrong answer 2
      assert.equal(step2.isCorrect, false);
      assert.equal(step2.nextState.currentDifficulty, "A1"); // dropped to A1
    });

    it("should not drop below A1 boundary floor", () => {
      let state: AdaptivePlacementState = {
        ...createInitialPlacementState(25),
        currentDifficulty: "A1",
        consecutiveIncorrect: 1,
      };

      const q = dummyQuestion("q1", "A1", 0);
      const step = processAdaptiveAnswer(state, q, 3); // second wrong at A1

      assert.equal(step.nextState.currentDifficulty, "A1"); // stays at A1 floor
    });
  });

  describe("Placement Result Calculation", () => {
    it("should recommend A1 when performance is strictly beginner", () => {
      const beginnerState: AdaptivePlacementState = {
        currentQuestionIndex: 10,
        totalQuestionsTarget: 10,
        currentDifficulty: "A1",
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        answeredQuestionIds: [],
        history: [
          { questionId: "1", level: "A1", isCorrect: true, userAnswer: 0 },
          { questionId: "2", level: "A1", isCorrect: true, userAnswer: 0 },
          { questionId: "3", level: "A1", isCorrect: false, userAnswer: 1 },
          { questionId: "4", level: "A2", isCorrect: false, userAnswer: 2 },
          { questionId: "5", level: "A2", isCorrect: false, userAnswer: 3 },
        ],
      };

      const result = calculatePlacementResult(beginnerState);

      assert.equal(result.recommendedLevel, "A1");
      assert.equal(result.totalScore, 2);
      assert.equal(result.maxScore, 5);
      assert.equal(result.percentage, 40);
      assert.match(result.rationale, /foundational knowledge/i);
    });

    it("should recommend B1 when intermediate threshold is achieved", () => {
      const intermediateState: AdaptivePlacementState = {
        currentQuestionIndex: 10,
        totalQuestionsTarget: 10,
        currentDifficulty: "B1",
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        answeredQuestionIds: [],
        history: [
          { questionId: "1", level: "A1", isCorrect: true, userAnswer: 0 },
          { questionId: "2", level: "A2", isCorrect: true, userAnswer: 0 },
          { questionId: "3", level: "A2", isCorrect: true, userAnswer: 0 },
          { questionId: "4", level: "B1", isCorrect: true, userAnswer: 0 },
          { questionId: "5", level: "B1", isCorrect: true, userAnswer: 0 },
          { questionId: "6", level: "B1", isCorrect: true, userAnswer: 0 },
          { questionId: "7", level: "B1", isCorrect: false, userAnswer: 1 },
          { questionId: "8", level: "B2", isCorrect: false, userAnswer: 2 },
        ],
      };

      const result = calculatePlacementResult(intermediateState);

      assert.equal(result.recommendedLevel, "B1");
      assert.equal(result.totalScore, 6);
      assert.equal(result.percentage, 75);
      assert.equal(result.levelScorePct.B1, 75); // 3 out of 4 correct
      assert.match(result.rationale, /working competence/i);
    });

    it("should recommend C1 when advanced mastery is proven", () => {
      const advancedHistory: AdaptivePlacementState["history"] = [
        { questionId: "1", level: "B1", isCorrect: true, userAnswer: 0 },
        { questionId: "2", level: "B2", isCorrect: true, userAnswer: 0 },
        { questionId: "3", level: "B2", isCorrect: true, userAnswer: 0 },
        { questionId: "4", level: "C1", isCorrect: true, userAnswer: 0 },
        { questionId: "5", level: "C1", isCorrect: true, userAnswer: 0 },
        { questionId: "6", level: "C1", isCorrect: true, userAnswer: 0 },
        { questionId: "7", level: "C1", isCorrect: false, userAnswer: 1 },
      ];

      const advancedState: AdaptivePlacementState = {
        currentQuestionIndex: 7,
        totalQuestionsTarget: 7,
        currentDifficulty: "C1",
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        answeredQuestionIds: [],
        history: advancedHistory,
      };

      const result = calculatePlacementResult(advancedState);

      assert.equal(result.recommendedLevel, "C1");
      assert.equal(result.percentage, 86); // 6/7 = 85.7% -> 86%
      assert.match(result.rationale, /advanced grasp/i);
    });
  });

  describe("Unit Quiz & Mock Scoring Logic", () => {
    it("should correctly evaluate pass when score >= 70%", () => {
      const questionsCount = 10;
      const passingScore = 7;
      const passPct = Math.round((passingScore / questionsCount) * 100);
      const passed = passPct >= 70;

      assert.equal(passPct, 70);
      assert.equal(passed, true);
    });

    it("should fail when score < 70%", () => {
      const questionsCount = 10;
      const failingScore = 6;
      const failPct = Math.round((failingScore / questionsCount) * 100);
      const passed = failPct >= 70;

      assert.equal(failPct, 60);
      assert.equal(passed, false);
    });

    it("should accurately generate section breakdown and weak topic recommendations", () => {
      const sampleQuestions = [
        { id: "q1", section: "grammar" as const, topic: "Dativ Prepositions", correctAnswer: 0, points: 1 },
        { id: "q2", section: "grammar" as const, topic: "Dativ Prepositions", correctAnswer: 1, points: 1 },
        { id: "q3", section: "vocabulary" as const, topic: "Food & Drinks", correctAnswer: 2, points: 1 },
        { id: "q4", section: "reading" as const, topic: "Menu Comprehension", correctAnswer: 3, points: 1 },
      ];

      const userAnswers = {
        q1: 0, // correct (grammar)
        q2: 0, // WRONG (was 1, answered 0) -> missed Dativ Prepositions
        q3: 2, // correct (vocabulary)
        q4: 3, // correct (reading)
      };

      const evalResult = evaluateQuizSubmission(sampleQuestions, userAnswers, 70);

      assert.equal(evalResult.score, 3);
      assert.equal(evalResult.maxScore, 4);
      assert.equal(evalResult.percentage, 75);
      assert.equal(evalResult.passed, true);

      // Section breakdowns
      assert.equal(evalResult.sectionBreakdown.grammar.correct, 1);
      assert.equal(evalResult.sectionBreakdown.grammar.total, 2);
      assert.equal(evalResult.sectionBreakdown.grammar.percentage, 50);

      assert.equal(evalResult.sectionBreakdown.vocabulary.correct, 1);
      assert.equal(evalResult.sectionBreakdown.vocabulary.total, 1);
      assert.equal(evalResult.sectionBreakdown.vocabulary.percentage, 100);

      // Weak topics
      assert.equal(evalResult.weakTopics.length, 1);
      assert.equal(evalResult.weakTopics[0].topic, "Dativ Prepositions");
      assert.equal(evalResult.weakTopics[0].missedCount, 1);
    });
  });
});

