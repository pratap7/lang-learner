import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateSm2, isCardDue, getPreviewIntervals, DEFAULT_SRS_STATE } from "../sm2.ts";

describe("SM-2 Spaced Repetition Algorithm", () => {
  const baseDate = new Date("2026-10-12T12:00:00Z");

  it("should handle new card graded as 'good'", () => {
    const next = calculateSm2({ repetitions: 0, interval: 0, easeFactor: 2.5 }, "good", baseDate);

    assert.equal(next.repetitions, 1);
    assert.equal(next.interval, 1);
    assert.equal(next.easeFactor, 2.5);
    assert.equal(next.dueDate, "2026-10-13T12:00:00.000Z");
  });

  it("should graduate to 6 days on second 'good' review", () => {
    const next = calculateSm2({ repetitions: 1, interval: 1, easeFactor: 2.5 }, "good", baseDate);

    assert.equal(next.repetitions, 2);
    assert.equal(next.interval, 6);
    assert.equal(next.easeFactor, 2.5);
    assert.equal(next.dueDate, "2026-10-18T12:00:00.000Z");
  });

  it("should compound interval by ease factor on third 'good' review", () => {
    const next = calculateSm2({ repetitions: 2, interval: 6, easeFactor: 2.5 }, "good", baseDate);

    assert.equal(next.repetitions, 3);
    assert.equal(next.interval, 15); // Math.round(6 * 2.5) = 15
    assert.equal(next.dueDate, "2026-10-27T12:00:00.000Z");
  });

  it("should reset repetitions and drop ease factor on 'again'", () => {
    const next = calculateSm2(
      { repetitions: 4, interval: 35, easeFactor: 2.4, lapses: 0 },
      "again",
      baseDate
    );

    assert.equal(next.repetitions, 0);
    assert.equal(next.interval, 1);
    assert.equal(next.easeFactor, 2.2); // 2.4 - 0.2
    assert.equal(next.lapses, 1);
  });

  it("should enforce minimum ease factor floor of 1.3", () => {
    const next = calculateSm2(
      { repetitions: 1, interval: 2, easeFactor: 1.35 },
      "again",
      baseDate
    );

    assert.equal(next.easeFactor, 1.3); // clamped at 1.3 minimum
  });

  it("should give bonus interval and boost ease factor on 'easy'", () => {
    const next = calculateSm2({ repetitions: 0, interval: 0, easeFactor: 2.5 }, "easy", baseDate);

    assert.equal(next.repetitions, 1);
    assert.equal(next.interval, 4);
    assert.equal(next.easeFactor, 2.65); // 2.5 + 0.15
    assert.equal(next.dueDate, "2026-10-16T12:00:00.000Z");
  });

  it("should correctly check due card status", () => {
    const pastDate = "2026-10-10T00:00:00Z";
    const futureDate = "2026-10-20T00:00:00Z";

    assert.equal(isCardDue(pastDate, baseDate), true);
    assert.equal(isCardDue(futureDate, baseDate), false);
    assert.equal(isCardDue(undefined, baseDate), true);
  });

  it("should generate preview interval labels", () => {
    const labels = getPreviewIntervals({ repetitions: 1, interval: 1, easeFactor: 2.5 });
    assert.equal(labels.again, "1d");
    assert.equal(labels.hard, "2d");
    assert.equal(labels.good, "6d");
    assert.equal(labels.easy, "10d");
  });
});
