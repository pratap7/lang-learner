/**
 * SuperMemo 2 (SM-2) Spaced Repetition Algorithm
 * Computes progressive intervals, repetitions, and ease factors for optimal memory retention.
 */

export type ReviewRating = "again" | "hard" | "good" | "easy";

export interface SrsCardState {
  repetitions: number;
  interval: number; // in days
  easeFactor: number; // minimum 1.3, default 2.5
  dueDate: string; // ISO date string (YYYY-MM-DD or full ISO)
  lastReviewedAt?: string;
  lapses?: number;
}

export const DEFAULT_SRS_STATE: SrsCardState = {
  repetitions: 0,
  interval: 0,
  easeFactor: 2.5,
  dueDate: new Date(0).toISOString(), // Due immediately
  lapses: 0,
};

/**
 * Calculates the next SRS review interval according to the SM-2 algorithm.
 *
 * @param current Current repetitions, interval (days), and easeFactor.
 * @param rating User feedback grade ("again", "hard", "good", "easy").
 * @param currentDate Base reference date (defaults to now).
 */
export function calculateSm2(
  current: { repetitions: number; interval: number; easeFactor: number; lapses?: number },
  rating: ReviewRating,
  currentDate: Date = new Date()
): SrsCardState {
  let repetitions = current.repetitions || 0;
  let interval = current.interval || 0;
  let easeFactor = current.easeFactor || 2.5;
  let lapses = current.lapses || 0;

  // Ensure minimum ease factor bounds
  if (easeFactor < 1.3) easeFactor = 1.3;

  switch (rating) {
    case "again": {
      // Complete recall failure
      repetitions = 0;
      interval = 1; // Due tomorrow / 1 day
      easeFactor = Math.max(1.3, Number((easeFactor - 0.2).toFixed(2)));
      lapses += 1;
      break;
    }

    case "hard": {
      // Recalled with significant hesitation
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 2;
      } else {
        interval = Math.max(interval + 1, Math.round(interval * 1.2));
      }
      easeFactor = Math.max(1.3, Number((easeFactor - 0.15).toFixed(2)));
      break;
    }

    case "good": {
      // Correct response with normal effort (Standard SM-2)
      repetitions += 1;
      if (repetitions === 1) {
        interval = 1;
      } else if (repetitions === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      // Standard SM-2 formula for q=4: EF' = EF + (0.1 - (5-4)*(0.08 + (5-4)*0.02)) = EF
      easeFactor = Math.max(1.3, Number(easeFactor.toFixed(2)));
      break;
    }

    case "easy": {
      // Immediate, effortless recall
      repetitions += 1;
      if (repetitions === 1) {
        interval = 4;
      } else if (repetitions === 2) {
        interval = 10;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      easeFactor = Math.max(1.3, Number((easeFactor + 0.15).toFixed(2)));
      break;
    }
  }

  // Calculate next due date
  const nextDueDate = new Date(currentDate.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    repetitions,
    interval,
    easeFactor,
    dueDate: nextDueDate.toISOString(),
    lastReviewedAt: currentDate.toISOString(),
    lapses,
  };
}

/**
 * Checks if a card is currently due for review.
 */
export function isCardDue(dueDateStr?: string, now: Date = new Date()): boolean {
  if (!dueDateStr) return true;
  const dueDate = new Date(dueDateStr);
  return dueDate.getTime() <= now.getTime();
}

/**
 * Computes next preview intervals for each button label (e.g. "1d", "6d").
 */
export function getPreviewIntervals(current: {
  repetitions: number;
  interval: number;
  easeFactor: number;
}): Record<ReviewRating, string> {
  const baseDate = new Date();
  const again = calculateSm2(current, "again", baseDate);
  const hard = calculateSm2(current, "hard", baseDate);
  const good = calculateSm2(current, "good", baseDate);
  const easy = calculateSm2(current, "easy", baseDate);

  const formatDays = (days: number): string => {
    if (days <= 1) return "1d";
    if (days < 30) return `${days}d`;
    const months = (days / 30).toFixed(1);
    return `${months}mo`;
  };

  return {
    again: formatDays(again.interval),
    hard: formatDays(hard.interval),
    good: formatDays(good.interval),
    easy: formatDays(easy.interval),
  };
}
