import { NextRequest, NextResponse } from "next/server";
import { getScenarioById, CefrLevel } from "@/lib/conversationScenarios";
import { VocabularyItem } from "@/lib/courseData";
import { ConversationReportSchema } from "@/lib/validations/apiSchemas";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";
import { sanitizeStudentInput } from "@/lib/security/promptSanitizer";

export interface GrammarCorrectionItem {
  id: string;
  userSaid: string;
  corrected: string;
  ruleExplanation: string;
}

export interface ConversationFeedbackReport {
  fluencyScore: number;
  cefrEvaluation: CefrLevel;
  durationMinutes: number;
  turnsCount: number;
  summary: string;
  grammarErrors: GrammarCorrectionItem[];
  vocabularyToReview: VocabularyItem[];
  xpEarned: number;
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);

  // 1. Sliding window rate limiting on conversation report (20 req/min per IP)
  const rateLimit = checkRateLimit(`conversation-report:${clientIp}`, 20, 60);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many report requests. Please wait a moment.",
      },
      { status: 429, headers: rateLimit.headers }
    );
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "INVALID_JSON", message: "Malformed JSON body." },
        { status: 400, headers: rateLimit.headers }
      );
    }

    // 2. Strict Zod Schema Validation
    const validation = ConversationReportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid input parameters.",
          issues: validation.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        },
        { status: 422, headers: rateLimit.headers }
      );
    }

    const { scenarioId, userLevel, durationSeconds, messages } = validation.data;

    const scenario = getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: "SCENARIO_NOT_FOUND", message: "Invalid scenario identifier." },
        { status: 400, headers: rateLimit.headers }
      );
    }

    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => sanitizeStudentInput(m.content).sanitized);

    // 1. Evaluate grammar errors post-session without interruption
    const grammarErrors = analyzeGrammarErrors(userMessages, userLevel as CefrLevel);

    // 2. Extract key scenario vocabulary tailored for the user's flashcards
    const vocabularyToReview = extractReviewVocabulary(scenarioId, userMessages);

    // 3. Compute dynamic fluency score (0–100)
    const turnCount = userMessages.length;
    const errorCount = grammarErrors.length;
    let baseScore = 75;
    if (turnCount >= 4) baseScore += 10;
    if (turnCount >= 7) baseScore += 5;
    baseScore -= Math.min(25, errorCount * 6);
    const fluencyScore = Math.max(50, Math.min(98, baseScore));

    const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
    const xpEarned = Math.min(60, 25 + turnCount * 4);

    const report: ConversationFeedbackReport = {
      fluencyScore,
      cefrEvaluation: userLevel as CefrLevel,
      durationMinutes,
      turnsCount: turnCount,
      summary: generateSummary(fluencyScore, userLevel, turnCount, scenario?.titleDe || "Gespräch"),
      grammarErrors,
      vocabularyToReview,
      xpEarned,
    };

    return NextResponse.json(report);
  } catch (err) {
    console.error("[Conversation Report Error]", err);
    return NextResponse.json({ error: "REPORT_GENERATION_FAILED" }, { status: 500 });
  }
}

function analyzeGrammarErrors(userMessages: string[], level: CefrLevel): GrammarCorrectionItem[] {
  const errors: GrammarCorrectionItem[] = [];

  userMessages.forEach((msg, idx) => {
    const lower = msg.toLowerCase();

    // Check 1: Masculine Accusative 'ein' instead of 'einen'
    if (lower.includes("ein kaffee") || lower.includes("ein tee") || lower.includes("ein apfelsaft") || lower.includes("ein kuchen")) {
      errors.push({
        id: `err-${idx}-akk`,
        userSaid: msg,
        corrected: msg.replace(/ein (kaffee|tee|apfelsaft|kuchen)/gi, "einen $1"),
        ruleExplanation: "Masculine nouns in the accusative case (direct object) take 'einen', not 'ein'.",
      });
    }

    // Check 2: 'Ich will' instead of polite 'Ich möchte / Ich hätte gerne'
    if (lower.startsWith("ich will") || lower.includes(" ich will ")) {
      errors.push({
        id: `err-${idx}-polite`,
        userSaid: msg,
        corrected: msg.replace(/ich will/gi, "ich möchte bitte"),
        ruleExplanation: "In service interactions, 'Ich möchte bitte' (I would like) is polite and customary; 'Ich will' sounds demanding.",
      });
    }

    // Check 3: Missing verb capitalization on nouns
    const words = msg.split(/\s+/);
    const uncapitalizedNouns = words.filter((w) => ["kaffee", "rechnung", "karte", "milch", "arzt", "termin", "pass"].includes(w.toLowerCase()) && /^[a-z]/.test(w));
    if (uncapitalizedNouns.length > 0 && errors.length < 2) {
      errors.push({
        id: `err-${idx}-caps`,
        userSaid: msg,
        corrected: msg.replace(/\b(kaffee|rechnung|karte|milch|arzt|termin|pass)\b/gi, (match) => match.charAt(0).toUpperCase() + match.slice(1)),
        ruleExplanation: "All German nouns (Substantive) are always capitalized in writing.",
      });
    }
  });

  // Provide a generic learning enhancement if no major errors were found
  if (errors.length === 0 && userMessages.length > 0) {
    return [];
  }

  return errors.slice(0, 3); // Top 3 actionable errors
}

function extractReviewVocabulary(scenarioId: string, userMessages: string[]): VocabularyItem[] {
  switch (scenarioId) {
    case "sc-cafe":
    case "cafe":
      return [
        {
          id: "cv-1",
          german: "der Kaffee",
          article: "der",
          plural: "die Kaffees",
          english: "the coffee",
          partOfSpeech: "noun",
          exampleDe: "Ich möchte bitte einen Kaffee mit Hafermilch.",
          exampleEn: "I would like a coffee with oat milk, please.",
          grammarNote: "Masculine noun: Akkusativ 'einen Kaffee'.",
        },
        {
          id: "cv-2",
          german: "die Rechnung",
          article: "die",
          plural: "die Rechnungen",
          english: "the bill / check",
          partOfSpeech: "noun",
          exampleDe: "Die Rechnung, bitte! Wir möchten zahlen.",
          exampleEn: "The bill, please! We would like to pay.",
          grammarNote: "All nouns ending in '-ung' are feminine ('die').",
        },
        {
          id: "cv-3",
          german: "getrennt",
          article: null,
          plural: null,
          english: "separately / split",
          partOfSpeech: "adverb",
          exampleDe: "Zahlen Sie zusammen oder getrennt?",
          exampleEn: "Are you paying together or separately?",
          grammarNote: "Standard German billing question.",
        },
      ];

    case "sc-doctor":
    case "doctor":
      return [
        {
          id: "cv-doc-1",
          german: "das Rezept",
          article: "das",
          plural: "die Rezepte",
          english: "the prescription",
          partOfSpeech: "noun",
          exampleDe: "Die Ärztin gibt mir ein Rezept für die Apotheke.",
          exampleEn: "The doctor gives me a prescription for the pharmacy.",
          grammarNote: "Neuter noun: 'das Rezept'.",
        },
        {
          id: "cv-doc-2",
          german: "die Beschwerden",
          article: "die",
          plural: "die Beschwerden",
          english: "the complaints / symptoms",
          partOfSpeech: "noun",
          exampleDe: "Welche Beschwerden haben Sie seit gestern?",
          exampleEn: "What complaints have you had since yesterday?",
          grammarNote: "Usually used in the plural.",
        },
        {
          id: "cv-doc-3",
          german: "die Schmerzen",
          article: "die",
          plural: "die Schmerzen",
          english: "the pain / aches",
          partOfSpeech: "noun",
          exampleDe: "Ich habe seit drei Tagen starke Halsschmerzen.",
          exampleEn: "I have had a severe sore throat for three days.",
          grammarNote: "Plural noun. Paired with body parts: Kopfschmerzen, Halsschmerzen.",
        },
      ];

    case "sc-job-interview":
    case "job-interview":
      return [
        {
          id: "cv-job-1",
          german: "die Erfahrung",
          article: "die",
          plural: "die Erfahrungen",
          english: "the experience",
          partOfSpeech: "noun",
          exampleDe: "Ich habe vier Jahre Erfahrung in diesem Bereich.",
          exampleEn: "I have four years of experience in this field.",
          grammarNote: "Feminine noun ending in '-ung'.",
        },
        {
          id: "cv-job-2",
          german: "die Teamfähigkeit",
          article: "die",
          plural: null,
          english: "teamwork ability / team player quality",
          partOfSpeech: "noun",
          exampleDe: "Teamfähigkeit ist für unsere Projekte unerlässlich.",
          exampleEn: "Teamwork is essential for our projects.",
          grammarNote: "Nouns ending in '-keit' are feminine ('die').",
        },
      ];

    default:
      return [
        {
          id: "cv-def-1",
          german: "das Gespräch",
          article: "das",
          plural: "die Gespräche",
          english: "the conversation / dialogue",
          partOfSpeech: "noun",
          exampleDe: "Das Gespräch war sehr angenehm und lehrreich.",
          exampleEn: "The conversation was very pleasant and educational.",
          grammarNote: "Neuter noun: 'das Gespräch'.",
        },
        {
          id: "cv-def-2",
          german: "sich einleben",
          article: null,
          plural: null,
          english: "to settle in",
          partOfSpeech: "verb",
          exampleDe: "Ich habe mich schon gut in Deutschland eingelebt.",
          exampleEn: "I have already settled in well in Germany.",
          grammarNote: "Reflexive separable verb: er lebt sich ein.",
        },
      ];
  }
}

function generateSummary(score: number, level: CefrLevel, turns: number, title: string): string {
  if (score >= 85) {
    return `Ausgezeichnet! You conducted a confident, fluent conversation during '${title}' across ${turns} turns. Your word choice aligned well with CEFR ${level}, and your responses were natural and culturally appropriate.`;
  }
  if (score >= 70) {
    return `Sehr gut! You successfully navigated '${title}' across ${turns} turns. Keep practicing your accusative case endings and polite phrasing to boost your spontaneous fluency.`;
  }
  return `Guter Versuch! You completed your dialogue practice session across ${turns} turns. Review the recommended grammar points below and add the vocabulary words directly to your flashcards for daily spaced repetition review!`;
}
