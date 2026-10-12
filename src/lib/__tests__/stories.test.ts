import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  GRADED_STORIES,
  getStoryById,
  getStoriesByLevel,
  getRecommendedStories,
  recordCompletedStory,
  getCompletedStoryIds,
  getTotalReadingStats,
  type GradedStory,
} from "../gradedStories.ts";


describe("Graded Stories Catalog & Structure", () => {
  it("should contain stories across A1, A2, and B1 levels", () => {
    const a1Stories = getStoriesByLevel("A1");
    const a2Stories = getStoriesByLevel("A2");
    const b1Stories = getStoriesByLevel("B1");

    assert.ok(a1Stories.length >= 2, "Must have at least two A1 stories");
    assert.ok(a2Stories.length >= 2, "Must have at least two A2 stories");
    assert.ok(b1Stories.length >= 1, "Must have at least one B1 story");

    for (const story of GRADED_STORIES) {
      assert.ok(story.title, `Story ${story.id} must have a title`);
      assert.ok(story.titleDe, `Story ${story.id} must have a German title`);
      assert.ok(story.summary, `Story ${story.id} must have a summary`);
      assert.ok(story.sentences.length >= 5, `Story ${story.id} must have at least 5 sentences`);
      assert.ok(Object.keys(story.vocabularyMap).length >= 4, `Story ${story.id} must have vocabulary map`);
      assert.ok(story.questions.length >= 2, `Story ${story.id} must have at least 2 comprehension questions`);
    }
  });

  it("should find story by ID or slug", () => {
    const byId = getStoryById("story-berlin-a1");
    assert.ok(byId);
    assert.equal(byId?.slug, "ein-samstag-in-berlin");

    const bySlug = getStoryById("das-geheimnis-im-schwarzwald");
    assert.ok(bySlug);
    assert.equal(bySlug?.id, "story-schwarzwald-a2");

    const notFound = getStoryById("unknown-story-xyz");
    assert.equal(notFound, undefined);
  });

  it("should have valid sentences and questions structure", () => {
    const story = GRADED_STORIES[0];

    story.sentences.forEach((s, idx) => {
      assert.equal(s.id, idx);
      assert.ok(s.textDe.length > 5);
      assert.ok(s.textEn.length > 5);
      assert.ok(s.endTimeSeconds > s.startTimeSeconds);
    });

    story.questions.forEach((q) => {
      assert.ok(q.questionDe.length > 5);
      assert.ok(q.options.length >= 3);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length);
      assert.ok(q.explanation.length > 5);
    });
  });
});

describe("Reading Progress & Recommendation Algorithm", () => {
  it("should recommend stories matching the user level and flashcard overlap", () => {
    const recommendations = getRecommendedStories("A1", 3);
    assert.equal(recommendations.length, 3);

    // Highest recommended story should match A1 or have flashcard vocabulary overlap
    const topRec = recommendations[0];
    assert.ok(topRec.recommendationScore > 0);
    assert.ok(topRec.recommendationReason.length > 5);
    assert.ok(topRec.story.id);
  });

  it("should record completed reading sessions and calculate WPM", () => {
    const initialCompleted = getCompletedStoryIds().length;

    const session = recordCompletedStory("story-berlin-a1", 120, 100); // 120 seconds = 2 minutes
    assert.equal(session.storyId, "story-berlin-a1");
    assert.equal(session.durationSeconds, 120);
    assert.ok(session.calculatedWpm > 0);
    assert.equal(session.questionsScorePct, 100);

    const stats = getTotalReadingStats();
    assert.ok(stats.totalSecondsRead >= 120);
    assert.ok(stats.completedStoriesCount >= initialCompleted);
  });
});
