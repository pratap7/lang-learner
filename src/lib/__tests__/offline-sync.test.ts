import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";

import {
  enqueueOfflineAction,
  getPendingSyncQueue,
  saveSyncQueue,
  cacheLessonForOffline,
  getCachedOfflineLesson,
  cacheFlashcardsForOffline,
  getCachedOfflineFlashcards,
  fetchWithRetry,
} from "../offlineSyncService.ts";

describe("Offline Sync & Background Queue Engine", () => {
  beforeEach(() => {
    // Reset mock localStorage
    const store: Record<string, string> = {};
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    };

    (global as any).window = {
      dispatchEvent: () => true,
    };
    (global as any).CustomEvent = class {
      detail: any;
      constructor(name: string, opts: any) {
        this.detail = opts?.detail;
      }
    };
  });

  it("should successfully enqueue an offline action and assign a unique ID and timestamp", () => {
    const item = enqueueOfflineAction("flashcard_review", {
      cardId: "card-123",
      nextSrs: { interval: 6, easeFactor: 2.6, repetitions: 2 },
    });

    assert.ok(item.id.startsWith("sync_"), "Sync item ID should have sync_ prefix");
    assert.strictEqual(item.type, "flashcard_review");
    assert.strictEqual(item.status, "pending");
    assert.strictEqual(item.retryCount, 0);

    const queue = getPendingSyncQueue();
    assert.strictEqual(queue.length, 1);
    assert.strictEqual(queue[0].payload.cardId, "card-123");
  });

  it("should round-trip lesson caching for offline access without data degradation", () => {
    const sampleLesson = {
      id: "a1-u1-l1",
      title: "Begrüßungen & Hallo",
      level: "A1",
      vocabulary: [{ id: "v1", german: "Hallo", english: "Hello" }],
      exercises: [{ id: "ex1", prompt: "Translate Hello" }],
    };

    cacheLessonForOffline("a1-u1-l1", sampleLesson);
    const retrieved = getCachedOfflineLesson("a1-u1-l1");

    assert.ok(retrieved, "Cached lesson should be retrievable");
    assert.strictEqual(retrieved.id, "a1-u1-l1");
    assert.strictEqual(retrieved.vocabulary[0].german, "Hallo");
  });

  it("should cache and retrieve flashcard review queue for offline study", () => {
    const sampleCards = [
      { id: "c1", german: "der Apfel", english: "apple", srsState: { repetitions: 1 } },
      { id: "c2", german: "das Buch", english: "book", srsState: { repetitions: 2 } },
    ];

    cacheFlashcardsForOffline("a1-u1", sampleCards);
    const retrieved = getCachedOfflineFlashcards("a1-u1");

    assert.ok(retrieved, "Cached flashcard queue should be retrievable");
    assert.strictEqual(retrieved.length, 2);
    assert.strictEqual(retrieved[0].german, "der Apfel");
  });

  it("should detect offline state in fetchWithRetry and return structured offline result", async () => {
    Object.defineProperty(globalThis.navigator, "onLine", {
      value: false,
      configurable: true,
    });

    const result = await fetchWithRetry("https://api.example.com/sync", {
      method: "POST",
    });

    assert.strictEqual(result.isOffline, true);
    assert.strictEqual(result.data, null);
    assert.ok(result.error?.includes("offline"));
  });
});
