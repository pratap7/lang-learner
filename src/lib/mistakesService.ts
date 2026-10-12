export interface MistakeRecord {
  id: string;
  exerciseId: string;
  exerciseType: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  reviewCount: number;
}

export interface ExerciseLike {
  id: string;
  type?: string;
  prompt: string;
  promptDe?: string;
  explanation: string;
  grammarTip?: string;
  level: string;
}

export interface EnrichedMistakeRecord extends MistakeRecord {
  grammarTopic: string;
  level?: string;
  promptDe?: string;
  options?: string[];
}

const MISTAKES_STORAGE_KEY = "deutschpfad_mistakes_v2";

export const SAMPLE_SEEDED_MISTAKES: EnrichedMistakeRecord[] = [
  {
    id: "m-seed-1",
    exerciseId: "ex-dat-1",
    exerciseType: "multiple_choice",
    grammarTopic: "Dativ vs. Akkusativ",
    level: "A1",
    prompt: "Ergänze den passenden Artikel: 'Jeden Morgen fahre ich mit ___ U-Bahn zur Arbeit.'",
    promptDe: "Präposition 'mit' erfordert immer den Dativ.",
    userAnswer: "die",
    correctAnswer: "der",
    explanation: "Die Präposition 'mit' verlangt ausnahmslos den Dativ. Das feminine Substantiv 'die U-Bahn' verändert sich im Dativ zu 'der U-Bahn'.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    reviewCount: 2,
    options: ["der", "die", "das", "dem"],
  },
  {
    id: "m-seed-2",
    exerciseId: "ex-dat-2",
    exerciseType: "multiple_choice",
    grammarTopic: "Dativ vs. Akkusativ",
    level: "A1",
    prompt: "Ergänze das Pronomen: 'Kannst du ___ bitte das Salz reichen?'",
    promptDe: "Dativ-Objekt bei zweistelligen Verben.",
    userAnswer: "mich",
    correctAnswer: "mir",
    explanation: "'Reichen / geben' verlangt die Person im Dativ (Wem reichst du das Salz? -> mir) und die Sache im Akkusativ (Was? -> das Salz).",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    reviewCount: 3,
    options: ["mich", "mir", "mein", "ich"],
  },
  {
    id: "m-seed-3",
    exerciseId: "ex-art-1",
    exerciseType: "article_selection",
    grammarTopic: "Artikel & Genus (der/die/das)",
    level: "A1",
    prompt: "Welcher Artikel gehört zu '___ Mädchen'?",
    promptDe: "Diminutiv-Endung '-chen'.",
    userAnswer: "die",
    correctAnswer: "das",
    explanation: "Substantive mit der Verkleinerungsform (Diminutiv) auf '-chen' oder '-lein' sind immer ausnahmslos neutral: 'das Mädchen'.",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    reviewCount: 1,
    options: ["der", "die", "das"],
  },
  {
    id: "m-seed-4",
    exerciseId: "ex-art-2",
    exerciseType: "article_selection",
    grammarTopic: "Artikel & Genus (der/die/das)",
    level: "A1",
    prompt: "Welcher Artikel gehört zu '___ Zeitung'?",
    promptDe: "Substantiv-Endung '-ung'.",
    userAnswer: "der",
    correctAnswer: "die",
    explanation: "Nomen mit den Suffixen '-ung', '-heit', '-keit', '-schaft' oder '-tät' sind im Deutschen immer feminin: 'die Zeitung'.",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 2,
    options: ["der", "die", "das"],
  },
  {
    id: "m-seed-5",
    exerciseId: "ex-verb-1",
    exerciseType: "multiple_choice",
    grammarTopic: "Trennbare Verben",
    level: "A1",
    prompt: "Welches Verbpräfix steht am Satzende? 'Der Sprachkurs fängt um 09:00 Uhr ___.'",
    promptDe: "Infinitiv: anfangen.",
    userAnswer: "auf",
    correctAnswer: "an",
    explanation: "Das trennbare Verb lautet 'anfangen'. Die betonte Vorsilbe 'an-' trennt sich im Hauptsatz und wandert ans Satzende.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    reviewCount: 2,
    options: ["an", "auf", "mit", "ab"],
  },
  {
    id: "m-seed-6",
    exerciseId: "ex-word-1",
    exerciseType: "sentence_reordering",
    grammarTopic: "Wortstellung im Nebensatz (weil/dass)",
    level: "A2",
    prompt: "Bilde den korrekten Kausalsatz: 'Er geht heute nicht joggen, weil ...'",
    promptDe: "Verb-Letzt-Stellung nach 'weil'.",
    userAnswer: "weil er ist müde",
    correctAnswer: "weil er müde ist",
    explanation: "Subordinierende Konjunktionen wie 'weil', 'dass', 'obwohl' verlangen die Verb-Letzt-Stellung: das konjugierte Verb 'ist' muss ganz ans Ende.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: false,
    reviewCount: 3,
    options: ["weil er müde ist", "weil er ist müde", "weil ist er müde"],
  },
  {
    id: "m-seed-7",
    exerciseId: "ex-perf-1",
    exerciseType: "multiple_choice",
    grammarTopic: "Perfekt Hilfsverben (haben vs. sein)",
    level: "A2",
    prompt: "Welches Hilfsverb ist korrekt? 'Letztes Wochenende ___ wir nach München gefahren.'",
    promptDe: "Ortsveränderung im Perfekt.",
    userAnswer: "haben",
    correctAnswer: "sind",
    explanation: "Verben der Fortbewegung und Ortsveränderung (fahren, gehen, fliegen, reisen) bilden das Perfekt immer mit 'sein': 'wir sind gefahren'.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    resolved: true,
    resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    reviewCount: 1,
    options: ["sind", "haben", "waren", "hatten"],
  },
];

export function getMistakes(): EnrichedMistakeRecord[] {
  if (typeof window === "undefined") return SAMPLE_SEEDED_MISTAKES;
  try {
    const raw = localStorage.getItem(MISTAKES_STORAGE_KEY);
    if (!raw) {
      // Seed initial sample mistakes so the notebook is immediately rich and functional
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(SAMPLE_SEEDED_MISTAKES));
      return SAMPLE_SEEDED_MISTAKES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read mistakes from storage:", err);
    return SAMPLE_SEEDED_MISTAKES;
  }
}

export function getUnresolvedMistakes(): EnrichedMistakeRecord[] {
  return getMistakes().filter((m) => !m.resolved);
}

export function getAdaptiveMistakeReviewItems(
  limit: number = 5,
  topicMasteryScores?: Record<string, number>
): EnrichedMistakeRecord[] {
  const unresolved = getUnresolvedMistakes();
  if (unresolved.length <= limit) return unresolved;

  return [...unresolved]
    .sort((a, b) => {
      const scoreA = topicMasteryScores?.[a.grammarTopic] ?? 50;
      const scoreB = topicMasteryScores?.[b.grammarTopic] ?? 50;
      if (scoreA !== scoreB) {
        return scoreA - scoreB; // Lowest mastery first (highest friction)
      }
      return (b.reviewCount || 1) - (a.reviewCount || 1);
    })
    .slice(0, limit);
}

export function getMistakesGroupedByTopic(): Record<string, EnrichedMistakeRecord[]> {
  const mistakes = getMistakes();
  const grouped: Record<string, EnrichedMistakeRecord[]> = {};

  mistakes.forEach((m) => {
    const topic = m.grammarTopic || "Allgemeine Grammatik";
    if (!grouped[topic]) {
      grouped[topic] = [];
    }
    grouped[topic].push(m);
  });

  return grouped;
}

export function getGrammarTopicsSummary(): {
  topic: string;
  totalCount: number;
  unresolvedCount: number;
  resolvedCount: number;
  level: string;
}[] {
  const grouped = getMistakesGroupedByTopic();

  return Object.entries(grouped).map(([topic, items]) => {
    const unresolved = items.filter((i) => !i.resolved).length;
    return {
      topic,
      totalCount: items.length,
      unresolvedCount: unresolved,
      resolvedCount: items.length - unresolved,
      level: items[0]?.level || "A1",
    };
  });
}

function inferGrammarTopic(exercise: ExerciseLike): string {
  if (exercise.grammarTip) {
    if (exercise.grammarTip.toLowerCase().includes("dativ") || exercise.grammarTip.toLowerCase().includes("akkusativ")) {
      return "Dativ vs. Akkusativ";
    }
    if (exercise.grammarTip.toLowerCase().includes("artikel") || exercise.grammarTip.toLowerCase().includes("genus")) {
      return "Artikel & Genus (der/die/das)";
    }
    if (exercise.grammarTip.toLowerCase().includes("trennbar")) {
      return "Trennbare Verben";
    }
    if (exercise.grammarTip.toLowerCase().includes("weil") || exercise.grammarTip.toLowerCase().includes("wortstellung")) {
      return "Wortstellung im Nebensatz (weil/dass)";
    }
  }

  if (exercise.type === "article_selection") {
    return "Artikel & Genus (der/die/das)";
  }
  if (exercise.type === "sentence_reordering") {
    return "Wortstellung & Syntax";
  }

  return "Grammatik & Sprachbausteine";
}

export async function recordMistake(
  exercise: ExerciseLike,
  userAnswer: unknown,
  correctAnswer: unknown
): Promise<EnrichedMistakeRecord> {
  const answerStr = typeof userAnswer === "string" ? userAnswer : JSON.stringify(userAnswer);
  const correctStr = typeof correctAnswer === "string" ? correctAnswer : JSON.stringify(correctAnswer);

  const existingMistakes = getMistakes();
  const existingIdx = existingMistakes.findIndex((m) => m.exerciseId === exercise.id);

  let record: EnrichedMistakeRecord;
  const inferredTopic = inferGrammarTopic(exercise);

  if (existingIdx >= 0) {
    record = {
      ...existingMistakes[existingIdx],
      userAnswer: answerStr,
      correctAnswer: correctStr,
      explanation: exercise.explanation,
      timestamp: new Date().toISOString(),
      resolved: false,
      reviewCount: (existingMistakes[existingIdx].reviewCount || 1) + 1,
      grammarTopic: existingMistakes[existingIdx].grammarTopic || inferredTopic,
      level: exercise.level.toUpperCase(),
    };
    existingMistakes[existingIdx] = record;
  } else {
    record = {
      id: "mistake_" + Math.random().toString(36).substring(2, 9),
      exerciseId: exercise.id,
      exerciseType: exercise.type || "exercise",
      prompt: exercise.prompt + (exercise.promptDe ? ` (${exercise.promptDe})` : ""),
      userAnswer: answerStr,
      correctAnswer: correctStr,
      explanation: exercise.explanation,
      timestamp: new Date().toISOString(),
      resolved: false,
      reviewCount: 1,
      grammarTopic: inferredTopic,
      level: exercise.level.toUpperCase(),
    };
    existingMistakes.unshift(record);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(existingMistakes));
    } catch (e) {
      console.warn("Could not save mistake to localStorage:", e);
    }
  }

  // Attempt sync with Supabase if online and authenticated
  try {
    if (typeof window !== "undefined") {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(exercise.id);
        if (isValidUuid) {
          await (supabase as any)
            .from("mistakes")
            .upsert({
              user_id: user.id,
              exercise_id: exercise.id,
              mistake_type: "exercise",
              mistake_count: record.reviewCount,
              last_mistake_at: record.timestamp,
              resolved: false,
              user_notes: `Wrong answer: ${answerStr}. Expected: ${correctStr}`,
            }, { onConflict: "user_id,exercise_id" });
        }
      }
    }
  } catch {}

  return record;
}

export interface WritingMistakeInput {
  grammarTopic: string;
  level: string;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

export async function recordWritingMistake(input: WritingMistakeInput): Promise<EnrichedMistakeRecord> {
  const existingMistakes = getMistakes();
  const existingIdx = existingMistakes.findIndex(
    (m) => m.grammarTopic === input.grammarTopic && m.userAnswer === input.userAnswer
  );

  let record: EnrichedMistakeRecord;

  if (existingIdx >= 0) {
    record = {
      ...existingMistakes[existingIdx],
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
      timestamp: new Date().toISOString(),
      resolved: false,
      reviewCount: (existingMistakes[existingIdx].reviewCount || 1) + 1,
      level: input.level.toUpperCase(),
    };
    existingMistakes[existingIdx] = record;
  } else {
    record = {
      id: "mistake_w_" + Math.random().toString(36).substring(2, 9),
      exerciseId: "writing_" + Math.random().toString(36).substring(2, 9),
      exerciseType: "writing_review" as any,
      prompt: input.prompt,
      userAnswer: input.userAnswer,
      correctAnswer: input.correctAnswer,
      explanation: input.explanation,
      timestamp: new Date().toISOString(),
      resolved: false,
      reviewCount: 1,
      grammarTopic: input.grammarTopic,
      level: input.level.toUpperCase(),
    };
    existingMistakes.unshift(record);
  }

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(existingMistakes));
    } catch (e) {
      console.warn("Could not save writing mistake to localStorage:", e);
    }
  }

  try {
    if (typeof window !== "undefined") {
      const { createClient } = await import("./supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await (supabase as any).from("mistakes").upsert(
          {
            user_id: user.id,
            exercise_id: record.exerciseId,
            mistake_type: "writing",
            mistake_count: record.reviewCount,
            last_mistake_at: record.timestamp,
            resolved: false,
            user_notes: `Writing error: ${input.userAnswer} -> ${input.correctAnswer} (${input.grammarTopic})`,
          },
          { onConflict: "user_id,exercise_id" }
        );
      }
    }
  } catch {}

  return record;
}

export function resolveMistake(mistakeId: string): void {
  const mistakes = getMistakes().map((m) => {
    if (m.id === mistakeId) {
      return { ...m, resolved: true, resolvedAt: new Date().toISOString() };
    }
    return m;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
  }
}

export function reopenMistake(mistakeId: string): void {
  const mistakes = getMistakes().map((m) => {
    if (m.id === mistakeId) {
      return { ...m, resolved: false, resolvedAt: undefined };
    }
    return m;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(MISTAKES_STORAGE_KEY, JSON.stringify(mistakes));
  }
}

export function clearMistakes(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(MISTAKES_STORAGE_KEY);
  }
}

