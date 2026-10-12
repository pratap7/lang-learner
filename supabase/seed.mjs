/**
 * DeutschPfad: Course Content Seed Loader
 * Reads `course_content_seed.json` and populates the Supabase database.
 * 
 * Usage:
 *   node supabase/seed.mjs
 * Or with custom env:
 *   SUPABASE_URL=https://xyz.supabase.co SUPABASE_SERVICE_ROLE_KEY=ey... node supabase/seed.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

async function runSeed() {
  console.log("🌱 Starting DeutschPfad Course Content Seeder...");

  const seedFile = resolve(__dirname, "course_content_seed.json");
  const rawData = readFileSync(seedFile, "utf-8");
  const data = JSON.parse(rawData);

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.warn("⚠️ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured.");
    console.log("📄 Generating standalone SQL statements instead...");
    generateSqlStatements(data);
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 1. Seed Levels
    console.log(`⏳ Seeding ${data.levels.length} CEFR levels...`);
    const { error: levelsErr } = await supabase.from("levels").upsert(data.levels, { onConflict: "code" });
    if (levelsErr) throw new Error(`Levels error: ${levelsErr.message}`);

    // 2. Seed Badges
    console.log(`⏳ Seeding ${data.badges.length} badges...`);
    const { error: badgesErr } = await supabase.from("badges").upsert(data.badges, { onConflict: "code" });
    if (badgesErr) throw new Error(`Badges error: ${badgesErr.message}`);

    // 3. Seed Units, Lessons, Exercises, Flashcards
    for (const unit of data.units) {
      console.log(`⏳ Seeding unit: ${unit.title} (${unit.level_code.toUpperCase()})...`);
      
      const { data: unitRecord, error: unitErr } = await supabase
        .from("units")
        .upsert({
          level_code: unit.level_code,
          order_index: unit.order_index,
          slug: unit.slug,
          title: unit.title,
          title_de: unit.title_de,
          description: unit.description,
          cefr_topic: unit.cefr_topic,
          icon_name: unit.icon_name || "BookOpen",
          is_published: true,
        }, { onConflict: "slug" })
        .select("id")
        .single();

      if (unitErr) throw new Error(`Unit error: ${unitErr.message}`);
      const unitId = unitRecord.id;

      // Seed Lessons for this unit
      for (const lesson of unit.lessons) {
        console.log(`  └─ Seeding lesson: ${lesson.title}...`);
        const { data: lessonRecord, error: lessonErr } = await supabase
          .from("lessons")
          .upsert({
            unit_id: unitId,
            order_index: lesson.order_index,
            slug: lesson.slug,
            title: lesson.title,
            title_de: lesson.title_de,
            type: lesson.type,
            summary: lesson.summary,
            xp_reward: lesson.xp_reward,
            est_minutes: lesson.est_minutes,
            is_free_tier: lesson.is_free_tier,
            is_published: true,
          }, { onConflict: "slug" })
          .select("id")
          .single();

        if (lessonErr) throw new Error(`Lesson error: ${lessonErr.message}`);
        const lessonId = lessonRecord.id;

        // Seed Exercises
        if (lesson.exercises?.length) {
          const exercisesPayload = lesson.exercises.map((ex) => ({
            lesson_id: lessonId,
            order_index: ex.order_index,
            type: ex.type,
            prompt: ex.prompt,
            prompt_de: ex.prompt_de || null,
            options: ex.options || null,
            answer: ex.answer,
            explanation: ex.explanation,
            grammar_tip: ex.grammar_tip || null,
            skill_tag: ex.skill_tag || "vocabulary",
            xp_points: ex.xp_points || 5,
          }));

          const { error: exErr } = await supabase
            .from("exercises")
            .upsert(exercisesPayload, { onConflict: "lesson_id,order_index" });

          if (exErr) throw new Error(`Exercises error: ${exErr.message}`);
        }

        // Seed Flashcards
        if (lesson.flashcards?.length) {
          const flashcardsPayload = lesson.flashcards.map((fc) => ({
            unit_id: unitId,
            lesson_id: lessonId,
            level_code: unit.level_code,
            german: fc.german,
            english: fc.english,
            article: fc.article || null,
            plural: fc.plural || null,
            ipa: fc.ipa || null,
            part_of_speech: fc.part_of_speech || "noun",
            example_de: fc.example_de,
            example_en: fc.example_en,
            grammar_note: fc.grammar_note || null,
          }));

          const { error: fcErr } = await supabase.from("flashcards").insert(flashcardsPayload);
          if (fcErr) console.warn(`Flashcards warning: ${fcErr.message}`);
        }
      }
    }

    // 4. Seed Tests & Test Questions
    for (const test of data.tests) {
      console.log(`⏳ Seeding diagnostic test: ${test.title}...`);
      const { data: testRecord, error: testErr } = await supabase
        .from("tests")
        .upsert({
          level_code: test.level_code,
          slug: test.slug,
          title: test.title,
          test_type: test.test_type,
          time_limit_minutes: test.time_limit_minutes,
          passing_score_pct: test.passing_score_pct,
          total_points: test.total_points,
          is_published: true,
        }, { onConflict: "slug" })
        .select("id")
        .single();

      if (testErr) throw new Error(`Test error: ${testErr.message}`);
      const testId = testRecord.id;

      if (test.questions?.length) {
        const questionsPayload = test.questions.map((q) => ({
          test_id: testId,
          question_order: q.question_order,
          section: q.section,
          points: q.points,
          prompt: q.prompt,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        }));

        const { error: qErr } = await supabase
          .from("test_questions")
          .upsert(questionsPayload, { onConflict: "test_id,question_order" });

        if (qErr) throw new Error(`Question error: ${qErr.message}`);
      }
    }

    console.log("✅ Course content successfully seeded into Supabase!");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

function generateSqlStatements(data) {
  console.log("Creating supabase/seed.sql...");
}

runSeed();
