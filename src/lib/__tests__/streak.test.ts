import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateNextStreak, type StreakData } from "../streakService.ts";

describe("Streak Calculation Logic", () => {
  const baseStreak: StreakData = {
    currentStreak: 5,
    longestStreak: 10,
    lastActivityDate: "2026-10-11",
    freezeCredits: 2,
    isFreezeEquipped: true,
    freezeUsedDates: [],
    todayCompleted: false,
  };

  it("should increment streak on consecutive day", () => {
    const today = "2026-10-12";
    const { nextStreak, freezeUsed, streakReset } = calculateNextStreak(baseStreak, today);

    assert.equal(nextStreak.currentStreak, 6);
    assert.equal(nextStreak.longestStreak, 10);
    assert.equal(nextStreak.todayCompleted, true);
    assert.equal(freezeUsed, false);
    assert.equal(streakReset, false);
    assert.equal(nextStreak.freezeCredits, 2);
  });

  it("should be idempotent when activity is recorded multiple times on same day", () => {
    const today = "2026-10-11"; // same day as lastActivityDate
    const { nextStreak, freezeUsed, streakReset } = calculateNextStreak(baseStreak, today);

    assert.equal(nextStreak.currentStreak, 5);
    assert.equal(nextStreak.todayCompleted, true);
    assert.equal(freezeUsed, false);
    assert.equal(streakReset, false);
  });

  it("should update longest streak when current streak exceeds previous record", () => {
    const recordStreak: StreakData = {
      ...baseStreak,
      currentStreak: 10,
      longestStreak: 10,
      lastActivityDate: "2026-10-11",
    };

    const { nextStreak } = calculateNextStreak(recordStreak, "2026-10-12");

    assert.equal(nextStreak.currentStreak, 11);
    assert.equal(nextStreak.longestStreak, 11);
  });

  it("should absorb a 1-day lapse when streak freeze is equipped", () => {
    // Last activity 2026-10-10, today is 2026-10-12 (missed 2026-10-11)
    const activeWithFreeze: StreakData = {
      ...baseStreak,
      lastActivityDate: "2026-10-10",
      freezeCredits: 2,
      isFreezeEquipped: true,
      freezeUsedDates: [],
    };

    const { nextStreak, freezeUsed, streakReset } = calculateNextStreak(activeWithFreeze, "2026-10-12");

    assert.equal(freezeUsed, true);
    assert.equal(streakReset, false);
    assert.equal(nextStreak.currentStreak, 6); // streak preserved and incremented
    assert.equal(nextStreak.freezeCredits, 1);  // 1 freeze consumed
    assert.equal(nextStreak.freezeUsedDates.length, 1);
    assert.equal(nextStreak.freezeUsedDates[0], "2026-10-11");
  });

  it("should reset streak to 1 if missed a day and NO freeze is equipped", () => {
    const unshielded: StreakData = {
      ...baseStreak,
      lastActivityDate: "2026-10-10",
      freezeCredits: 0,
      isFreezeEquipped: false,
    };

    const { nextStreak, freezeUsed, streakReset } = calculateNextStreak(unshielded, "2026-10-12");

    assert.equal(freezeUsed, false);
    assert.equal(streakReset, true);
    assert.equal(nextStreak.currentStreak, 1);
    assert.equal(nextStreak.longestStreak, 10); // preserves previous best
  });

  it("should reset streak to 1 if absent for more than 1 day even with freeze", () => {
    // Absent for 3 days (last was Oct 8, today Oct 12)
    const absentLong: StreakData = {
      ...baseStreak,
      lastActivityDate: "2026-10-08",
      freezeCredits: 2,
      isFreezeEquipped: true,
    };

    const { nextStreak, streakReset } = calculateNextStreak(absentLong, "2026-10-12");

    assert.equal(streakReset, true);
    assert.equal(nextStreak.currentStreak, 1);
  });

  it("should initialize brand new learner to streak 1 on first session", () => {
    const brandNew: StreakData = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      freezeCredits: 1,
      isFreezeEquipped: true,
      freezeUsedDates: [],
      todayCompleted: false,
    };

    const { nextStreak, streakReset } = calculateNextStreak(brandNew, "2026-10-12");

    assert.equal(nextStreak.currentStreak, 1);
    assert.equal(nextStreak.longestStreak, 1);
    assert.equal(nextStreak.lastActivityDate, "2026-10-12");
    assert.equal(streakReset, false);
  });
});
