import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WRITING_TASKS,
  getWritingTaskById,
  getWritingTasks,
  type WritingTask,
} from "../writingTasks.ts";
import {
  WRITING_PLAN_LIMITS,
  getUserWritingUsage,
  recordWritingSubmission,
} from "../writingUsageService.ts";
import {
  evaluateWritingSubmissionHeuristic,
  generateWordDiff,
} from "../writingEvaluationService.ts";
import {
  recordWritingMistake,
  getMistakes,
  getGrammarTopicsSummary,
} from "../mistakesService.ts";

describe("Writing Task Definitions & Filtering", () => {
  it("should contain tasks across formal email, informal letter, and opinion text", () => {
    const formalTasks = getWritingTasks({ type: "formal_email" });
    const informalTasks = getWritingTasks({ type: "informal_letter" });
    const opinionTasks = getWritingTasks({ type: "opinion_text" });

    assert.ok(formalTasks.length >= 2, "Should have at least 2 formal email tasks");
    assert.ok(informalTasks.length >= 2, "Should have at least 2 informal letter tasks");
    assert.ok(opinionTasks.length >= 2, "Should have at least 2 opinion text tasks");

    for (const task of WRITING_TASKS) {
      assert.ok(task.title, `Task ${task.id} must have a title`);
      assert.ok(task.titleDe, `Task ${task.id} must have a German title`);
      assert.ok(task.scenario, `Task ${task.id} must have a scenario description`);
      assert.ok(task.bulletPoints.length >= 3, `Task ${task.id} must have at least 3 bullet points`);
      assert.ok(task.minWords > 0, `Task ${task.id} must specify minWords > 0`);
      assert.ok(task.maxWords >= task.minWords, `Task ${task.id} maxWords must be >= minWords`);
      assert.ok(task.sampleOpening, `Task ${task.id} must have a sampleOpening`);
      assert.ok(task.helpfulPhrases.length >= 3, `Task ${task.id} must have at least 3 helpful phrases`);
    }
  });

  it("should filter tasks accurately by CEFR level", () => {
    const a1Tasks = getWritingTasks({ level: "A1" });
    assert.ok(a1Tasks.length >= 2, "Should have at least 2 A1 tasks");
    for (const t of a1Tasks) {
      assert.equal(t.level, "A1");
    }

    const b2Tasks = getWritingTasks({ level: "B2" });
    assert.ok(b2Tasks.length >= 2, "Should have at least 2 B2 tasks");
    for (const t of b2Tasks) {
      assert.equal(t.level, "B2");
    }
  });

  it("should find task by ID or slug", () => {
    const byId = getWritingTaskById("wt-formal-a1");
    assert.ok(byId);
    assert.equal(byId?.type, "formal_email");

    const bySlug = getWritingTaskById("termin-absagen-a1");
    assert.ok(bySlug);
    assert.equal(bySlug?.id, "wt-formal-a1");

    const notFound = getWritingTaskById("non-existent");
    assert.equal(notFound, undefined);
  });
});

describe("Monthly Writing Submission Limits per Plan", () => {
  it("should enforce correct monthly submission caps per plan", () => {
    assert.equal(WRITING_PLAN_LIMITS.free.submissionCap, 5);
    assert.equal(WRITING_PLAN_LIMITS.pro.submissionCap, 30);
    assert.equal(WRITING_PLAN_LIMITS.unlimited.submissionCap, 150);
  });

  it("should calculate remaining submissions and limit reached state", () => {
    const freeUsage = getUserWritingUsage("user-test-free", "free");
    assert.equal(freeUsage.monthlySubmissionCap, 5);
    assert.ok(freeUsage.submissionsRemaining <= 5);

    const proUsage = getUserWritingUsage("user-test-pro", "pro");
    assert.equal(proUsage.monthlySubmissionCap, 30);
    assert.ok(proUsage.submissionsRemaining <= 30);
  });

  it("should increment submissions when recorded", () => {
    const before = getUserWritingUsage("user-test-inc", "free");
    const updated = recordWritingSubmission("user-test-inc", "free");
    assert.equal(updated.submissionsUsedThisMonth, before.submissionsUsedThisMonth + 1);
  });
});

describe("Rubric Evaluation & Error Highlighting Engine", () => {
  const sampleTask: WritingTask = getWritingTaskById("wt-formal-a1")!;

  it("should evaluate rubric across 4 competencies (0-5 each, total 0-20)", () => {
    const validFormalSubmission = `Sehr geehrte Frau Weber,
ich schreibe Ihnen, weil ich am Freitag leider nicht zum Einstufungstest kommen kann.
Ich bin seit gestern krank und liege mit Fieber im Bett. Es tut mir sehr leid.
Können wir den Termin bitte auf nächste Woche verschieben?
Vielen Dank für Ihr Verständnis.
Mit freundlichen Grüßen
Max Mustermann`;

    const result = evaluateWritingSubmissionHeuristic(sampleTask, validFormalSubmission);

    assert.ok(result.rubric.taskCompletion.score >= 0 && result.rubric.taskCompletion.score <= 5);
    assert.ok(result.rubric.grammar.score >= 0 && result.rubric.grammar.score <= 5);
    assert.ok(result.rubric.vocabulary.score >= 0 && result.rubric.vocabulary.score <= 5);
    assert.ok(result.rubric.coherence.score >= 0 && result.rubric.coherence.score <= 5);

    assert.equal(
      result.totalScore,
      result.rubric.taskCompletion.score +
        result.rubric.grammar.score +
        result.rubric.vocabulary.score +
        result.rubric.coherence.score
    );
    assert.ok(result.totalScore >= 12, "Well-formed formal email should achieve a solid score");
    assert.ok(result.percentage >= 60);
    assert.equal(result.suggestions.length, 3, "Must provide exactly 3 suggestions");
  });

  it("should flag missing formal greeting and 'weil' word order error", () => {
    const faultySubmission = `Hallo Frau Weber,
ich kann nicht kommen, weil ich bin krank.
Tschüss`;

    const result = evaluateWritingSubmissionHeuristic(sampleTask, faultySubmission);

    // Should flag missing formal salutation
    const salutationErr = result.errors.find((e) => e.grammarTopic.includes("Formelle Anrede"));
    assert.ok(salutationErr, "Should detect missing formal salutation");
    assert.equal(salutationErr?.severity, "critical");

    // Should flag 'weil' word order error
    const weilErr = result.errors.find((e) => e.grammarTopic.includes("Nebensatz"));
    assert.ok(weilErr, "Should detect verb second error after 'weil'");

    // Rubric grammar score should be penalized
    assert.ok(result.rubric.grammar.score <= 3);
  });

  it("should generate word-level diff segments", () => {
    const orig = "Ich habe mit die U-Bahn gefahren.";
    const corr = "Ich bin mit der U-Bahn gefahren.";

    const diff = generateWordDiff(orig, corr);
    assert.ok(diff.length > 0);
    const added = diff.filter((d) => d.type === "added");
    const removed = diff.filter((d) => d.type === "removed");
    assert.ok(added.length > 0);
    assert.ok(removed.length > 0);
  });
});

describe("Mistake Notebook Integration & Weak-Topic Profile", () => {
  it("should record writing errors into mistakes table and update weak-topic summary", async () => {
    const initialMistakesCount = getMistakes().length;

    const recorded = await recordWritingMistake({
      grammarTopic: "Wortstellung im Nebensatz (weil/dass)",
      level: "A2",
      prompt: "Writing task 'Termin absagen': Word order after weil",
      userAnswer: "weil ich bin krank",
      correctAnswer: "weil ich krank bin",
      explanation: "Verb must move to end of clause after 'weil'.",
    });

    assert.ok(recorded.id.startsWith("mistake_w_"));
    assert.equal(recorded.grammarTopic, "Wortstellung im Nebensatz (weil/dass)");
    assert.equal(recorded.userAnswer, "weil ich bin krank");

    const updatedMistakes = getMistakes();
    assert.ok(updatedMistakes.length >= initialMistakesCount);

    const summary = getGrammarTopicsSummary();
    const topicSummary = summary.find((s) => s.topic === "Wortstellung im Nebensatz (weil/dass)");
    assert.ok(topicSummary, "Weak-topic summary should reflect the newly saved writing mistake topic");
    assert.ok(topicSummary!.totalCount > 0);
  });
});
