import type { WritingTask } from "./writingTasks";

export interface TextDiffSegment {
  type: "unchanged" | "added" | "removed";
  text: string;
}

export interface WritingErrorItem {
  id: string;
  originalSnippet: string;
  correctedSnippet: string;
  grammarTopic: string;
  explanation: string;
  severity: "critical" | "moderate" | "minor";
}

export interface WritingRubricCriterion {
  score: number; // 0–5
  maxScore: number; // 5
  title: string;
  description: string;
  feedback: string;
}

export interface WritingEvaluationResult {
  rubric: {
    taskCompletion: WritingRubricCriterion;
    grammar: WritingRubricCriterion;
    vocabulary: WritingRubricCriterion;
    coherence: WritingRubricCriterion;
  };
  totalScore: number; // 0–20
  percentage: number; // 0–100
  cefrRating: string;
  originalText: string;
  correctedText: string;
  diffSegments: TextDiffSegment[];
  errors: WritingErrorItem[];
  suggestions: [string, string, string]; // exactly 3 suggestions
  wordCount: number;
  minWordsTarget: number;
  maxWordsTarget: number;
  isWordCountMet: boolean;
}

/**
 * Computes simple word-level diff segments between original and corrected strings.
 */
export function generateWordDiff(original: string, corrected: string): TextDiffSegment[] {
  const origWords = original.split(/(\s+)/);
  const corrWords = corrected.split(/(\s+)/);

  const segments: TextDiffSegment[] = [];
  let i = 0;
  let j = 0;

  while (i < origWords.length || j < corrWords.length) {
    if (i < origWords.length && j < corrWords.length && origWords[i] === corrWords[j]) {
      segments.push({ type: "unchanged", text: origWords[i] });
      i++;
      j++;
    } else {
      // Find mismatch
      if (i < origWords.length && (j >= corrWords.length || origWords[i] !== corrWords[j])) {
        // Look ahead in corrected
        const nextMatchInCorr = corrWords.indexOf(origWords[i], j);
        if (nextMatchInCorr !== -1 && nextMatchInCorr - j <= 3) {
          while (j < nextMatchInCorr) {
            segments.push({ type: "added", text: corrWords[j] });
            j++;
          }
        } else {
          segments.push({ type: "removed", text: origWords[i] });
          i++;
          if (j < corrWords.length) {
            segments.push({ type: "added", text: corrWords[j] });
            j++;
          }
        }
      } else if (j < corrWords.length) {
        segments.push({ type: "added", text: corrWords[j] });
        j++;
      }
    }
  }

  return segments;
}

/**
 * High-precision local heuristic evaluation engine for German learner essays.
 * Analyzes word count, formal/informal register, grammar rules, cases, and coherence.
 */
export function evaluateWritingSubmissionHeuristic(
  task: WritingTask,
  userText: string
): WritingEvaluationResult {
  const trimmed = userText.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const isWordCountMet = wordCount >= task.minWords;
  const errors: WritingErrorItem[] = [];
  let correctedText = userText;

  // ── 1. Check Salutations & Sign-offs ──────────────────────────────────────
  const lowerText = userText.toLowerCase();

  if (task.type === "formal_email") {
    // Check formal greeting
    const hasFormalGreeting =
      lowerText.includes("sehr geehrte") ||
      lowerText.includes("sehr geehrter") ||
      lowerText.includes("guten tag frau") ||
      lowerText.includes("guten tag herr");

    if (!hasFormalGreeting) {
      errors.push({
        id: "err-formal-salutation",
        originalSnippet: userText.split("\n")[0] || "Hi / Hallo",
        correctedSnippet: task.sampleOpening,
        grammarTopic: "Formelle Anrede & Höflichkeitsform",
        explanation:
          "In formal German correspondence (emails to companies, landlords, or teachers), you must use 'Sehr geehrte Damen und Herren,' or 'Sehr geehrte(r) Frau/Herr [Nachname],'. Informal greetings like 'Hallo' or 'Liebe' are inappropriate here.",
        severity: "critical",
      });
      // Prepend or correct salutation
      if (!userText.startsWith("Sehr geehrte")) {
        correctedText = `${task.sampleOpening}\n\n` + correctedText;
      }
    }

    // Check lowercase 'sie' / 'ihr' when addressing the recipient
    const lowerFormalSieMatch = /\b(können|haben|möchten|bitte)\s+sie\b/g;
    if (lowerFormalSieMatch.test(userText)) {
      errors.push({
        id: "err-sie-capitalization",
        originalSnippet: "... sie ...",
        correctedSnippet: "... Sie ...",
        grammarTopic: "Großschreibung der Höflichkeitsform",
        explanation:
          "When addressing someone formally with 'Sie', 'Ihnen', or 'Ihr', the pronoun must always be capitalized to distinguish it from the third-person 'sie' (they / she).",
        severity: "moderate",
      });
      correctedText = correctedText.replace(/\b(können|haben|möchten|bitten|fragen)\s+sie\b/g, "$1 Sie");
    }

    // Check formal sign-off
    const hasFormalSignoff =
      lowerText.includes("mit freundlichen grüßen") ||
      lowerText.includes("freundliche grüße") ||
      lowerText.includes("herzliche grüße");

    if (!hasFormalSignoff) {
      errors.push({
        id: "err-formal-signoff",
        originalSnippet: "Missing or informal sign-off",
        correctedSnippet: "Mit freundlichen Grüßen",
        grammarTopic: "Formelle Grußformel",
        explanation:
          "Formal German emails always end with 'Mit freundlichen Grüßen' followed directly by your full name on the next line (without a comma at the end in modern standard German).",
        severity: "moderate",
      });
      correctedText = correctedText + `\n\nMit freundlichen Grüßen\n[Ihr Name]`;
    }
  }

  if (task.type === "informal_letter") {
    const hasInformalGreeting =
      lowerText.includes("liebe") ||
      lowerText.includes("lieber") ||
      lowerText.includes("hallo") ||
      lowerText.includes("hi");

    if (!hasInformalGreeting) {
      errors.push({
        id: "err-informal-greeting",
        originalSnippet: userText.split("\n")[0] || "Sehr geehrte Damen und Herren",
        correctedSnippet: task.sampleOpening,
        grammarTopic: "Informelle Begrüßung",
        explanation:
          "For friendly letters to friends or family, open with 'Liebe [Frauenname],' (feminine) or 'Lieber [Männername],' (masculine). Formal openings create unnatural emotional distance.",
        severity: "critical",
      });
    }
  }

  // ── 2. Grammar Pattern Checks ─────────────────────────────────────────────
  // A. "weil" + Verb-second error (weil ich bin krank -> weil ich krank bin)
  const weilVerbSecondRegex = /\bweil\s+([a-zA-ZäöüÄÖÜß]+)\s+(ist|bin|war|habe|hat|kann|will)\s+([^,.\n]+)/gi;
  if (weilVerbSecondRegex.test(userText)) {
    errors.push({
      id: "err-weil-word-order",
      originalSnippet: "weil ... [Verb in Position 2]",
      correctedSnippet: "weil ... [konjugiertes Verb am Satzende]",
      grammarTopic: "Wortstellung im Nebensatz (weil/dass)",
      explanation:
        "Subordinating conjunctions such as 'weil', 'dass', and 'obwohl' trigger subordinate clause word order: the conjugated verb must move to the very end of the clause.",
      severity: "critical",
    });
    correctedText = correctedText.replace(
      /\bweil\s+([a-zA-ZäöüÄÖÜß]+)\s+(ist|bin|war|habe|hat|kann|will)\s+([^,.\n]+)/gi,
      "weil $1 $3 $2"
    );
  }

  // B. "Ich habe gegangen / gefahren" (sein vs. haben auxiliary in Perfekt)
  const motionAuxErrorRegex = /\b(habe|haben|hast|hat)\s+([^,.\n]*\b)?(gegangen|gefahren|geflogen|gekommen)\b/gi;
  if (motionAuxErrorRegex.test(userText)) {
    errors.push({
      id: "err-perfekt-auxiliary",
      originalSnippet: "habe ... gegangen/gefahren",
      correctedSnippet: "bin ... gegangen/gefahren",
      grammarTopic: "Perfekt: Hilfsverb 'sein' bei Ortsveränderung",
      explanation:
        "Verbs of movement and location change (gehen, fahren, fliegen, kommen) form the Perfekt tense strictly with the auxiliary verb 'sein' (ich bin gefahren, nicht ich habe gefahren).",
      severity: "critical",
    });
    correctedText = correctedText.replace(/\bhabe\s+([^,.\n]*\b)?(gegangen|gefahren|geflogen|gekommen)\b/gi, "bin $1$2");
  }

  // C. Dativ Preposition Check (mit + die -> mit der)
  if (/\bmit\s+die\b/gi.test(userText)) {
    errors.push({
      id: "err-dativ-mit",
      originalSnippet: "mit die",
      correctedSnippet: "mit der",
      grammarTopic: "Dativ nach Präposition 'mit'",
      explanation:
        "The preposition 'mit' always governs the Dativ case. Feminine nouns ('die U-Bahn') change from 'die' to 'der' in the Dativ ('mit der U-Bahn').",
      severity: "moderate",
    });
    correctedText = correctedText.replace(/\bmit\s+die\b/gi, "mit der");
  }

  // D. Akkusativ Masculine check (einen vs ein)
  if (/\b(möchte|suche|brauche)\s+ein\s+(Kaffee|Termin|Tisch|Job|Brief)\b/gi.test(userText)) {
    errors.push({
      id: "err-akkusativ-masculine",
      originalSnippet: "ein Kaffee / ein Termin",
      correctedSnippet: "einen Kaffee / einen Termin",
      grammarTopic: "Akkusativ bei maskulinen Nomen",
      explanation:
        "Transitive verbs like 'möchten', 'suchen', or 'brauchen' require the direct object in the Akkusativ case. Masculine indefinite articles change from 'ein' to 'einen'.",
      severity: "moderate",
    });
    correctedText = correctedText.replace(
      /\b(möchte|suche|brauche)\s+ein\s+(Kaffee|Termin|Tisch|Job|Brief)\b/gi,
      "$1 einen $2"
    );
  }

  // ── 3. Rubric Scoring (0–5 per criterion) ─────────────────────────────────
  // Task Completion (0–5)
  let taskCompletionScore = 4;
  if (!isWordCountMet) taskCompletionScore = Math.max(1, taskCompletionScore - 2);
  if (task.bulletPoints.length > 0) {
    // Check if key prompt words appear
    const mentionsKeyTopics = task.bulletPoints.some((bp) => {
      const wordsInBp = bp.split(/\s+/).slice(0, 2).map((w) => w.toLowerCase());
      return wordsInBp.some((w) => lowerText.includes(w));
    });
    if (mentionsKeyTopics) taskCompletionScore = Math.min(5, taskCompletionScore + 1);
  }

  // Grammar (0–5)
  let grammarScore = 5;
  const criticalErrorsCount = errors.filter((e) => e.severity === "critical").length;
  const modErrorsCount = errors.filter((e) => e.severity === "moderate").length;
  grammarScore = Math.max(1, 5 - criticalErrorsCount * 1.5 - modErrorsCount * 0.8);
  grammarScore = Math.round(grammarScore);

  // Vocabulary (0–5)
  let vocabularyScore = 3;
  if (wordCount >= task.minWords) vocabularyScore += 1;
  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  if (uniqueWords.size > 25) vocabularyScore = Math.min(5, vocabularyScore + 1);
  if (wordCount < 15) vocabularyScore = 1;

  // Coherence & Structure (0–5)
  let coherenceScore = 3;
  const connectors = ["weil", "deshalb", "außerdem", "jedoch", "da", "obwohl", "zunächst", "schließlich", "einerseits", "andererseits", "dass"];
  const connectorMatches = connectors.filter((c) => lowerText.includes(c)).length;
  if (connectorMatches >= 2) coherenceScore += 1;
  if (connectorMatches >= 4) coherenceScore = Math.min(5, coherenceScore + 1);
  if (task.type === "formal_email" && !lowerText.includes("mit freundlichen grüßen")) {
    coherenceScore = Math.max(2, coherenceScore - 1);
  }

  const totalScore = taskCompletionScore + grammarScore + vocabularyScore + coherenceScore;
  const percentage = Math.round((totalScore / 20) * 100);

  // Derive CEFR performance rating
  let cefrRating = task.level;
  if (percentage >= 85) {
    cefrRating = task.level + "+";
  } else if (percentage < 60) {
    cefrRating = "Below " + task.level;
  }

  // Generate word diff
  const diffSegments = generateWordDiff(userText, correctedText);

  // ── 4. Tailored 3 Suggestions for Improvement ─────────────────────────────
  const suggestions: [string, string, string] = [
    task.type === "formal_email"
      ? "Ensure consistent use of the capitalized polite form ('Sie', 'Ihnen', 'Ihr') and close with standard phrasing like 'Über Ihre Rückmeldung würde ich mich sehr freuen.'"
      : task.type === "informal_letter"
      ? "Add personal conversational touches such as 'Wie geht es dir?' at the beginning and sign off with 'Herzliche Grüße' or 'Bis bald!'."
      : "Structure your arguments using contrastive pairs such as 'Einerseits ... andererseits ...' or 'Zwar ... aber ...' to elevate your text's rhetorical cohesion.",
    errors.some((e) => e.grammarTopic.includes("Nebensatz"))
      ? "Keep practicing subordinate clause verb placement ('Verb-Letzt-Stellung'): whenever you use 'weil', 'dass', or 'obwohl', remember that the conjugated verb must go directly to the end."
      : "Incorporate more two-way prepositions with Dative and Akkusativ (an, auf, in, über) to demonstrate solid command of German cases.",
    wordCount < task.minWords
      ? `Aim to expand your sentences by adding reasons or time expressions (e.g. 'Letzte Woche', 'aus diesem Grund') to comfortably reach the target of ${task.minWords}–${task.maxWords} words.`
      : "Vary your vocabulary by replacing basic words like 'gut' or 'machen' with expressive verbs like 'ermöglichen', 'schätzen', or 'gestalten'.",
  ];

  return {
    rubric: {
      taskCompletion: {
        score: taskCompletionScore,
        maxScore: 5,
        title: "Task Completion",
        description: "Coverage of prompt bullet points, register appropriateness, and required details.",
        feedback:
          taskCompletionScore >= 4
            ? "Strong fulfillment of the task prompt. All required communicative points were addressed."
            : "Some required elements from the scenario were omitted or the text was too brief.",
      },
      grammar: {
        score: grammarScore,
        maxScore: 5,
        title: "Grammatical Accuracy",
        description: "Verb conjugation, word order in main/subordinate clauses, and case endings.",
        feedback:
          grammarScore >= 4
            ? "Solid grammatical control with minimal friction in syntax and case inflections."
            : "Grammatical inaccuracies (such as word order or preposition cases) were detected and corrected below.",
      },
      vocabulary: {
        score: vocabularyScore,
        maxScore: 5,
        title: "Vocabulary & Range",
        description: "Lexical diversity, situational collocations, and idiomatic German expressions.",
        feedback:
          vocabularyScore >= 4
            ? "Rich and level-appropriate vocabulary suited to the context of this task."
            : "Consider incorporating more domain-specific vocabulary and descriptive phrasing.",
      },
      coherence: {
        score: coherenceScore,
        maxScore: 5,
        title: "Coherence & Structure",
        description: "Logical paragraphing, linking words (weil, obwohl, deshalb), and standard formatting.",
        feedback:
          coherenceScore >= 4
            ? "The text flows smoothly with natural transitions and standard formatting conventions."
            : "Use more connectors (z.B. deshalb, außerdem, da) to tie your sentences together seamlessly.",
      },
    },
    totalScore,
    percentage,
    cefrRating,
    originalText: userText,
    correctedText,
    diffSegments,
    errors,
    suggestions,
    wordCount,
    minWordsTarget: task.minWords,
    maxWordsTarget: task.maxWords,
    isWordCountMet,
  };
}
