-- ==============================================================================
-- DeutschPfad: Initial Database Seed SQL
-- Populates CEFR Levels, Badges, A1 Unit 1, Lessons, Exercises, and Placement Diagnostic
-- ==============================================================================

-- 1. CEFR LEVELS (A1 to C2)
INSERT INTO public.levels (code, order_index, title, title_de, description, cefr_guided_hours, official_exam_name, color_hex, is_published)
VALUES
('a1', 1, 'A1 · Beginner (Breakthrough)', 'A1 · Anfänger', 'Understand and use familiar everyday expressions and very basic phrases aimed at satisfying concrete needs.', 80, 'Goethe-Zertifikat A1: Start Deutsch 1', '#10b981', true),
('a2', 2, 'A2 · Elementary (Waystage)', 'A2 · Grundlegende Kenntnisse', 'Communicate in simple and routine tasks requiring a simple and direct exchange of information.', 150, 'Goethe-Zertifikat A2 / telc Deutsch A2', '#06b6d4', true),
('b1', 3, 'B1 · Intermediate (Threshold)', 'B1 · Fortgeschrittene Sprachverwendung', 'Understand the main points of clear standard input on familiar matters. Standard requirement for German citizenship.', 300, 'Goethe-Zertifikat B1 / DTZ', '#3b82f6', true),
('b2', 4, 'B2 · Upper-Intermediate (Vantage)', 'B2 · Selbständige Sprachverwendung', 'Interact with a degree of fluency with native speakers. Required for workplace and university entry.', 450, 'Goethe-Zertifikat B2 / TestDaF', '#6366f1', true),
('c1', 5, 'C1 · Advanced (Effective Fluency)', 'C1 · Fachkundige Sprachkenntnisse', 'Express ideas fluently and spontaneously for academic and professional purposes.', 650, 'Goethe-Zertifikat C1 / telc C1 Hochschule', '#8b5cf6', true),
('c2', 6, 'C2 · Mastery (Native Precision)', 'C2 · Annähernd muttersprachliche Kenntnisse', 'Understand with ease virtually everything heard or read. Native-like precision and nuance.', 850, 'Goethe-Zertifikat C2: GDS', '#ec4899', true)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  official_exam_name = EXCLUDED.official_exam_name;

-- 2. BADGES CATALOG
INSERT INTO public.badges (code, title, title_de, description, icon_name, category, xp_bonus, requirement_type, requirement_value)
VALUES
('onboarding_complete', 'Erster Schritt', 'Erster Schritt', 'Completed your personalized onboarding trajectory setup.', 'Award', 'onboarding', 50, 'onboarding_steps', 4),
('streak_7', 'Streak Starter', 'Wochen-Serie', 'Maintained a consistent daily study habit for 7 consecutive days.', 'Flame', 'streak', 100, 'streak_days', 7),
('streak_30', 'Habit Meister', '30-Tage Meister', 'Achieved a 30-day continuous learning streak.', 'Flame', 'streak', 300, 'streak_days', 30),
('cards_100', 'Wortschatz 100', '100 Vokabeln', 'Retained 100 vocabulary words using the spaced repetition system.', 'BookOpen', 'vocabulary', 150, 'cards_reviewed', 100),
('perfect_grammar', 'Grammatik Kenner', 'Grammatik-Profi', 'Scored 100% on the Akkusativ and Dativ declension mastery exercises.', 'Zap', 'grammar', 120, 'perfect_quizzes', 3),
('a1_certified', 'A1 Meister', 'A1 Absolvent', 'Completed all 6 units of A1 with an average quiz score over 80%.', 'ShieldCheck', 'mastery', 500, 'level_completion', 1)
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  xp_bonus = EXCLUDED.xp_bonus;

-- 3. A1 UNIT 1: ERSTE SCHRITTE
INSERT INTO public.units (id, level_code, order_index, slug, title, title_de, description, cefr_topic, icon_name, is_published)
VALUES
('00000000-0000-0000-0001-000000000001', 'a1', 1, 'a1-u1-erste-schritte', 'First Steps & Introductions', 'Erste Schritte & Kennenlernen', 'Greetings, introducing yourself, polite everyday phrases, and foundational pronunciation rules.', 'Personal Identification & Courtesies', 'MessageSquare', true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description;

-- 4. UNIT 1 LESSONS
INSERT INTO public.lessons (id, unit_id, order_index, slug, title, title_de, type, summary, xp_reward, est_minutes, is_free_tier, is_published)
VALUES
('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', 1, 'a1-u1-l1-begruessungen', 'Greetings & Politeness', 'Begrüßungen & Höflichkeitsformen', 'vocabulary', 'Master formal (Sie) vs. informal (du) greetings across Germany, Austria, and Switzerland.', 25, 12, true, true),
('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001', 2, 'a1-u1-l2-artikel-der-die-das', 'Articles & Gender (Der, Die, Das)', 'Bestimmte Artikel: Der, Die, Das', 'grammar', 'Understand how German assigns masculine, feminine, and neuter genders to every noun.', 30, 18, true, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary;

-- 5. EXERCISES FOR LESSON 1.1
INSERT INTO public.exercises (lesson_id, order_index, type, prompt, prompt_de, options, answer, explanation, grammar_tip, skill_tag, xp_points)
VALUES
('00000000-0000-0000-0002-000000000001', 1, 'multiple_choice', 'How do you formally say ''Good morning'' in German?', 'Guten Morgen', '["Guten Morgen", "Gute Nacht", "Tschüss", "Auf Wiedersehen"]'::jsonb, '"Guten Morgen"'::jsonb, '''Guten Morgen'' is used until roughly 11:00 AM.', 'Time greetings take the accusative case masculine ending (-en): Guten Morgen, Guten Tag.', 'vocabulary', 5),
('00000000-0000-0000-0002-000000000001', 2, 'translate', 'Translate ''Nice to meet you'':', 'Freut mich', '["Freut mich", "Danke schön", "Bitte sehr", "Guten Tag"]'::jsonb, '"Freut mich"'::jsonb, '''Freut mich'' is a natural short form of ''Es freut mich, Sie kennenzulernen''.', 'Reflexive verb freuen with accusative pronoun mich.', 'speaking', 5),
('00000000-0000-0000-0002-000000000001', 3, 'matching', 'Match the German greeting with its English meaning:', 'Zuordnung', '[{"de": "Auf Wiedersehen", "en": "Goodbye (formal)"}, {"de": "Tschüss", "en": "Bye (informal)"}, {"de": "Wie geht es Ihnen?", "en": "How are you? (formal)"}, {"de": "Bis bald", "en": "See you soon"}]'::jsonb, '{"Auf Wiedersehen": "Goodbye (formal)", "Tschüss": "Bye (informal)", "Wie geht es Ihnen?": "How are you? (formal)", "Bis bald": "See you soon"}'::jsonb, '''Auf Wiedersehen'' literally means ''until we see each other again''.', 'Ihnen is the formal dative pronoun.', 'reading', 10)
ON CONFLICT (lesson_id, order_index) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  answer = EXCLUDED.answer;

-- 6. EXERCISES FOR LESSON 1.2
INSERT INTO public.exercises (lesson_id, order_index, type, prompt, prompt_de, options, answer, explanation, grammar_tip, skill_tag, xp_points)
VALUES
('00000000-0000-0000-0002-000000000002', 1, 'article_gender', 'Select the correct article for ''Bahnhof'' (train station):', '___ Bahnhof', '["der", "die", "das"]'::jsonb, '"der"'::jsonb, '''Bahnhof'' is masculine (der Bahnhof). Compound nouns take the gender of the last word: der Hof -> der Bahnhof.', 'Compound noun rule: always takes the gender of the final noun.', 'grammar', 5),
('00000000-0000-0000-0002-000000000002', 2, 'article_gender', 'Select the correct article for ''Straße'' (street):', '___ Straße', '["der", "die", "das"]'::jsonb, '"die"'::jsonb, '''Straße'' is feminine (die Straße). Over 90% of nouns ending in ''-e'' denoting inanimate objects are feminine.', 'Nouns ending in -e are ~90% feminine (die).', 'grammar', 5),
('00000000-0000-0000-0002-000000000002', 3, 'fill_blank', 'Fill in the blank with the correct neuter article: ''___ Rathaus steht am Marktplatz.''', '___ Rathaus steht am Marktplatz.', '["Der", "Die", "Das"]'::jsonb, '"Das"'::jsonb, '''Rathaus'' (town hall) is neuter because ''das Haus'' is neuter.', 'Neuter compound noun ending in das Haus.', 'writing', 8)
ON CONFLICT (lesson_id, order_index) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  answer = EXCLUDED.answer;

-- 7. VOCABULARY FLASHCARDS (SRS Ready)
INSERT INTO public.flashcards (unit_id, lesson_id, level_code, german, english, article, plural, ipa, part_of_speech, example_de, example_en, grammar_note)
VALUES
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', 'a1', 'Bahnhof', 'train station', 'der', 'die Bahnhöfe', '/ˈbaːnˌhoːf/', 'noun', 'Der Zug fährt pünktlich am Bahnhof ab.', 'The train departs on time from the train station.', 'Masculine noun (der). Plural forms with an Umlaut (ä).'),
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', 'a1', 'Straße', 'street', 'die', 'die Straßen', '/ˈʃtʁaːsə/', 'noun', 'Die Straße ist ruhig und sauber.', 'The street is quiet and clean.', 'Feminine noun (die). Features the Eszett (ß).'),
('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0002-000000000002', 'a1', 'Rathaus', 'town hall', 'das', 'die Rathäuser', '/ˈʁaːtˌhaʊs/', 'noun', 'Das historische Rathaus befindet sich im Zentrum.', 'The historical town hall is located in the city center.', 'Neuter noun (das). Compound noun ending in das Haus.');

-- 8. PLACEMENT DIAGNOSTIC TEST
INSERT INTO public.tests (id, level_code, slug, title, test_type, time_limit_minutes, passing_score_pct, total_points, is_published)
VALUES
('00000000-0000-0000-0003-000000000001', 'a1', 'a1-placement-diagnostic', 'A1 Adaptive Placement Diagnostic', 'placement', 15, 70, 15, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title;

INSERT INTO public.test_questions (test_id, question_order, section, points, prompt, options, correct_answer, explanation)
VALUES
('00000000-0000-0000-0003-000000000001', 1, 'grammar', 5, 'Welcher Artikel ist richtig? ''___ Apfel ist rot.'' (The apple is red)', '["Der", "Die", "Das"]'::jsonb, '"Der"'::jsonb, '''Apfel'' is masculine in German: der Apfel.'),
('00000000-0000-0000-0003-000000000001', 2, 'reading', 5, 'Was bedeutet ''Ich hätte gerne ein Wasser, bitte''?', '["I would like a water, please", "Where is the water?", "I do not like water", "Water is expensive"]'::jsonb, '"I would like a water, please"'::jsonb, '''Ich hätte gerne...'' is the polite Konjunktiv II form for ordering food and drinks.'),
('00000000-0000-0000-0003-000000000001', 3, 'grammar', 5, 'Welche Verbform passt? ''Wir ___ aus Deutschland.'' (We come from Germany)', '["komme", "kommst", "kommen", "kommt"]'::jsonb, '"kommen"'::jsonb, 'The 1st person plural subject ''wir'' takes the ''-en'' ending: wir kommen.')
ON CONFLICT (test_id, question_order) DO UPDATE SET
  prompt = EXCLUDED.prompt,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer;
