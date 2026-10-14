/**
 * Offline Cache, Background Sync & Network Resilience Service
 * - Manages offline caching for active lessons and flashcard review queues.
 * - Maintains an IndexedDB/localStorage queue for offline user actions.
 * - Flushes pending mutations automatically upon network restoration.
 * - Provides exponential backoff fetch wrapper (fetchWithRetry).
 */

import { createClient } from "./supabase/client.ts";

export type SyncItemType =
  | "flashcard_review"
  | "lesson_completion"
  | "exercise_answer"
  | "streak_activity"
  | "mistake_record";

export interface QueuedSyncItem {
  id: string;
  type: SyncItemType;
  payload: any;
  timestamp: number;
  retryCount: number;
  status: "pending" | "syncing" | "failed";
}

const SYNC_QUEUE_KEY = "deutschpfad_sync_queue_v1";
const LESSON_CACHE_PREFIX = "deutschpfad_offline_lesson_";
const FLASHCARD_CACHE_PREFIX = "deutschpfad_offline_flashcards_";

/* ─────────────────────────────────────────────────────────────────────────────
   1. OFFLINE SYNC QUEUE MANAGEMENT
───────────────────────────────────────────────────────────────────────────── */

export function getPendingSyncQueue(): QueuedSyncItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveSyncQueue(queue: QueuedSyncItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(
      new CustomEvent("deutschpfad:sync-queue-updated", {
        detail: { count: queue.length },
      })
    );
  } catch {}
}

export function enqueueOfflineAction(type: SyncItemType, payload: any): QueuedSyncItem {
  const queue = getPendingSyncQueue();
  const newItem: QueuedSyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
    retryCount: 0,
    status: "pending",
  };

  queue.push(newItem);
  saveSyncQueue(queue);

  // If online, try immediate optimistic flush
  if (typeof navigator !== "undefined" && navigator.onLine) {
    flushPendingSyncQueue();
  }

  return newItem;
}

/**
 * Flush all queued offline mutations to backend / Supabase
 */
export async function flushPendingSyncQueue(): Promise<{
  syncedCount: number;
  remainingCount: number;
}> {
  if (typeof window === "undefined" || !navigator.onLine) {
    const queue = getPendingSyncQueue();
    return { syncedCount: 0, remainingCount: queue.length };
  }

  const queue = getPendingSyncQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, remainingCount: 0 };
  }

  const remainingQueue: QueuedSyncItem[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      const success = await processSyncItem(item);
      if (success) {
        syncedCount++;
      } else {
        item.retryCount++;
        if (item.retryCount < 5) {
          remainingQueue.push(item);
        }
      }
    } catch {
      item.retryCount++;
      if (item.retryCount < 5) {
        remainingQueue.push(item);
      }
    }
  }

  saveSyncQueue(remainingQueue);

  if (syncedCount > 0) {
    window.dispatchEvent(
      new CustomEvent("deutschpfad:offline-synced", {
        detail: { syncedCount, remainingCount: remainingQueue.length },
      })
    );
  }

  return { syncedCount, remainingCount: remainingQueue.length };
}

async function processSyncItem(item: QueuedSyncItem): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  switch (item.type) {
    case "flashcard_review": {
      const { cardId, nextSrs } = item.payload;
      if (!user) return true; // Synced locally
      const { error } = await (supabase as any).from("srs_reviews").upsert({
        user_id: user.id,
        flashcard_id: cardId,
        ease_factor: nextSrs.easeFactor,
        interval_days: nextSrs.interval,
        repetitions: nextSrs.repetitions,
        due_date: nextSrs.dueDate,
        last_reviewed_at: nextSrs.lastReviewedAt,
        updated_at: new Date().toISOString(),
      });
      return !error;
    }

    case "lesson_completion": {
      const { lessonId, stats } = item.payload;
      if (!user) return true;
      const { error } = await (supabase as any).from("lesson_progress").upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        xp_earned: stats.xpEarned,
        accuracy_pct: stats.accuracyPct,
        completed_at: new Date().toISOString(),
      });
      return !error;
    }

    case "streak_activity": {
      const { streakData } = item.payload;
      if (!user) return true;
      const { error } = await (supabase as any).from("user_streaks").upsert({
        user_id: user.id,
        current_streak: streakData.currentStreak,
        longest_streak: streakData.longestStreak,
        last_active_date: streakData.lastActiveDate,
        updated_at: new Date().toISOString(),
      });
      return !error;
    }

    case "mistake_record": {
      // Local mistakes table already saved; sync to cloud if available
      return true;
    }

    default:
      return true;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. OFFLINE LESSON & FLASHCARD CACHING
───────────────────────────────────────────────────────────────────────────── */

export function cacheLessonForOffline(lessonId: string, lessonData: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${LESSON_CACHE_PREFIX}${lessonId}`,
      JSON.stringify({
        data: lessonData,
        cachedAt: Date.now(),
      })
    );
  } catch {}
}

export function getCachedOfflineLesson(lessonId: string): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${LESSON_CACHE_PREFIX}${lessonId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch {
    return null;
  }
}

export function cacheFlashcardsForOffline(deckId: string, cards: any[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${FLASHCARD_CACHE_PREFIX}${deckId}`,
      JSON.stringify({
        cards,
        cachedAt: Date.now(),
      })
    );
  } catch {}
}

export function getCachedOfflineFlashcards(deckId: string): any[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${FLASHCARD_CACHE_PREFIX}${deckId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.cards;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. NETWORK RESILIENCE: EXPONENTIAL BACKOFF FETCH WRAPPER
───────────────────────────────────────────────────────────────────────────── */

export interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  baseDelayMs?: number;
  timeoutMs?: number;
}

export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<{ data: T | null; error: string | null; isOffline: boolean }> {
  const { maxRetries = 3, baseDelayMs = 600, timeoutMs = 8000, ...fetchOptions } = options;

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      data: null,
      error: "You are currently offline. Actions will be queued for sync.",
      isOffline: true,
    };
  }

  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If 5xx server error and retries remaining, wait with backoff
        if (response.status >= 500 && attempt < maxRetries) {
          attempt++;
          const jitter = Math.random() * 200;
          const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        const errText = await response.text().catch(() => "HTTP Error");
        return { data: null, error: `HTTP ${response.status}: ${errText}`, isOffline: false };
      }

      const data: T = await response.json().catch(() => null);
      return { data, error: null, isOffline: false };
    } catch (err: any) {
      clearTimeout(timeoutId);

      // If aborted or network dropped, retry if attempts remain
      if (attempt < maxRetries) {
        attempt++;
        const jitter = Math.random() * 200;
        const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
        await new Promise((res) => setTimeout(res, delay));
        continue;
      }

      const isOfflineNow = typeof navigator !== "undefined" && !navigator.onLine;
      return {
        data: null,
        error: isOfflineNow ? "Network connection lost." : err?.message || "Network request failed",
        isOffline: isOfflineNow,
      };
    }
  }

  return { data: null, error: "Max retries exceeded", isOffline: false };
}
