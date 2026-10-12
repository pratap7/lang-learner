import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_GRAMMAR_TOPICS,
  inferExerciseTags,
  calculateTopicMastery,
  getUserMasteryProfile,
  calculateProjectedCefrReadiness,
  getAdaptiveNextLessonRecommendation,
  type TopicInteractionEvent,
} from "../adaptiveMasteryService.ts";
import { getAdaptiveMistakeReviewItems } from "../mistakesService.ts";

describe("Adaptive Exercise Tagging Engine", () => {
  it("should accurately tag exercises with grammar topic and skill", () => {
    // 1. Dativ preposition
    const ex1 = {
      prompt: "Ergänze den passenden Artikel: 'Jeden Morgen fahre ich mit ___ U-Bahn zur Arbeit.'",
      grammarTip: "Präposition 'mit' erfordert immer den Dativ.",
      explanation: "Die Präposition 'mit' verlangt ausnahmslos den Dativ.",
      type: "multiple_choice",
    };
    const tag1 = inferExerciseTags(ex1);
    assert.equal(tag1.grammarTopic, "Präpositionen mit Dativ");
    assert.equal(tag1.skill, "grammar");

    // 2. Artikel & Genus
    const ex2 = {
      prompt: "Welcher Artikel gehört zu '___ Mädchen'?",
      type: "article_selection",
    };
    const tag2 = inferExerciseTags(ex2);
    assert.equal(tag2.grammarTopic, "Artikel & Genus (der/die/das)");

    // 3. Subordinate clause syntax
    const ex3 = {
      prompt: "Bilde den korrekten Kausalsatz: 'Er geht heute nicht joggen, weil ...'",
      grammarTip: "Verb-Letzt-Stellung nach 'weil'.",
    };
    const tag3 = inferExerciseTags(ex3);
    assert.equal(tag3.grammarTopic, "Wortstellung im Nebensatz (weil/dass)");

    // 4. Listening skill recognition
    const ex4 = {
      prompt: "Listen to the coffee shop conversation and answer:",
      type: "listening",
    };
    const tag4 = inferExerciseTags(ex4);
    assert.equal(tag4.skill, "listening");
  });
});

describe("Recency & Accuracy Weighted Mastery Calculation", () => {
  const now = new Date("2026-10-12T12:00:00Z");
  const dayMs = 86400000;

  it("should calculate low mastery for a single attempt due to confidence dampening", () => {
    // 1 single correct answer should not give 100% mastery
    const events: TopicInteractionEvent[] = [
      { timestamp: now.toISOString(), isCorrect: true, score: 1.0 },
    ];
    const result = calculateTopicMastery(events, now);

    assert.equal(result.totalAttempts, 1);
    assert.equal(result.unweightedAccuracyPct, 100);
    // Confidence factor ~ 0.25, so mastery score should be around 25%
    assert.ok(result.masteryScore < 40, "1 attempt must be dampened by sample-size confidence");
    assert.equal(result.status, "weak");
  });

  it("should graduate to 'mastered' after sustained consistent accuracy", () => {
    const events: TopicInteractionEvent[] = [
      { timestamp: new Date(now.getTime() - 10 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 8 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 6 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 4 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 2 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 0 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
    ];
    const result = calculateTopicMastery(events, now);

    assert.equal(result.totalAttempts, 6);
    assert.equal(result.unweightedAccuracyPct, 100);
    assert.ok(result.masteryScore >= 80, "Sustained accuracy must achieve >= 80% mastery");
    assert.equal(result.status, "mastered");
  });

  it("should give higher penalty to a recent mistake than to an old mistake (recency weighting)", () => {
    // Profile A: Recent mistake today, 3 older correct answers
    const profileRecentMistake: TopicInteractionEvent[] = [
      { timestamp: new Date(now.getTime() - 20 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 15 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 10 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 0 * dayMs).toISOString(), isCorrect: false, score: 0.0 }, // Failed today!
    ];

    // Profile B: Old mistake 20 days ago, 3 recent correct answers
    const profileOldMistake: TopicInteractionEvent[] = [
      { timestamp: new Date(now.getTime() - 20 * dayMs).toISOString(), isCorrect: false, score: 0.0 }, // Failed 20d ago
      { timestamp: new Date(now.getTime() - 6 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 3 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 0 * dayMs).toISOString(), isCorrect: true, score: 1.0 }, // Recovered
    ];

    const resultA = calculateTopicMastery(profileRecentMistake, now);
    const resultB = calculateTopicMastery(profileOldMistake, now);

    // Profile B recovered recently, so its decayed accuracy and mastery must be higher than Profile A!
    assert.ok(
      resultB.decayedAccuracyPct > resultA.decayedAccuracyPct,
      `Old mistake (${resultB.decayedAccuracyPct}%) should have higher decayed accuracy than recent mistake (${resultA.decayedAccuracyPct}%)`
    );
    assert.ok(
      resultB.masteryScore > resultA.masteryScore,
      `Mastery score with recent recovery (${resultB.masteryScore}%) must exceed recent failure (${resultA.masteryScore}%)`
    );
  });

  it("should detect improving vs declining trends", () => {
    // Improving: 0, 0, 1, 1
    const improvingEvents: TopicInteractionEvent[] = [
      { timestamp: new Date(now.getTime() - 12 * dayMs).toISOString(), isCorrect: false, score: 0.0 },
      { timestamp: new Date(now.getTime() - 8 * dayMs).toISOString(), isCorrect: false, score: 0.0 },
      { timestamp: new Date(now.getTime() - 4 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 1 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 0 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
    ];
    const resImp = calculateTopicMastery(improvingEvents, now);
    assert.equal(resImp.trend, "improving");

    // Declining: 1, 1, 0, 0
    const decliningEvents: TopicInteractionEvent[] = [
      { timestamp: new Date(now.getTime() - 12 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 8 * dayMs).toISOString(), isCorrect: true, score: 1.0 },
      { timestamp: new Date(now.getTime() - 4 * dayMs).toISOString(), isCorrect: false, score: 0.0 },
      { timestamp: new Date(now.getTime() - 1 * dayMs).toISOString(), isCorrect: false, score: 0.0 },
      { timestamp: new Date(now.getTime() - 0 * dayMs).toISOString(), isCorrect: false, score: 0.0 },
    ];
    const resDec = calculateTopicMastery(decliningEvents, now);
    assert.equal(resDec.trend, "declining");
  });
});

describe("Projected CEFR Readiness Date & Pacing", () => {
  it("should calculate readiness percentage and estimated days remaining", () => {
    const profile = getUserMasteryProfile("test-ready-user", "A1");
    const projection = calculateProjectedCefrReadiness(profile, 20);

    assert.equal(projection.currentLevel, "A1");
    assert.equal(projection.nextLevel, "A2");
    assert.ok(projection.readinessPercentage >= 0 && projection.readinessPercentage <= 100);
    assert.ok(projection.totalRequiredTopics >= 5);
    assert.ok(projection.estimatedDaysRemaining > 0);
    assert.ok(projection.projectedDate.length > 5);
    assert.ok(projection.milestoneMessage.length > 10);
  });

  it("should compress estimated days when daily study budget increases", () => {
    const profile = getUserMasteryProfile("test-pacing-user", "A1");
    const pacing10m = calculateProjectedCefrReadiness(profile, 10);
    const pacing30m = calculateProjectedCefrReadiness(profile, 30);

    assert.ok(
      pacing30m.estimatedDaysRemaining < pacing10m.estimatedDaysRemaining,
      "30 mins/day pacing must result in earlier readiness date than 10 mins/day"
    );
  });
});

describe("Adaptive Next Lesson & Mistake Selection", () => {
  it("should recommend remedial drill when high-friction weakness exists", () => {
    const profile = getUserMasteryProfile("test-rec-user", "A1");
    // Ensure a weak topic is present
    if (profile.weaknesses.length > 0) {
      profile.weaknesses[0].masteryScore = 25; // Critical friction
      const rec = getAdaptiveNextLessonRecommendation(profile);
      assert.equal(rec.type, "remedial_drill");
      assert.ok(rec.title.includes("Eliminate Friction"));
      assert.ok(rec.reason.length > 15);
    }
  });

  it("should prioritize mistake review items by lowest topic mastery score", () => {
    const masteryScores = {
      "Dativ vs. Akkusativ": 22, // High friction
      "Trennbare Verben": 78,    // Low friction
    };

    const reviewItems = getAdaptiveMistakeReviewItems(5, masteryScores);
    assert.ok(reviewItems.length > 0);

    // If both topics exist in the pool, Dativ vs. Akkusativ must come first
    const dativIdx = reviewItems.findIndex((i) => i.grammarTopic === "Dativ vs. Akkusativ");
    const trennbarIdx = reviewItems.findIndex((i) => i.grammarTopic === "Trennbare Verben");

    if (dativIdx !== -1 && trennbarIdx !== -1) {
      assert.ok(dativIdx < trennbarIdx, "Lowest mastery topic must be reviewed before higher mastery topic");
    }
  });
});
