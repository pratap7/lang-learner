import { SrsCardState, DEFAULT_SRS_STATE, calculateSm2, isCardDue, ReviewRating } from "./sm2";
import { VocabularyItem, LESSONS_DATABASE } from "./courseData";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineAction, cacheFlashcardsForOffline, getCachedOfflineFlashcards } from "./offlineSyncService";

export interface FlashcardItem {
  id: string;
  deckId: string;
  unitId?: string;
  german: string;
  english: string;
  article?: "der" | "die" | "das" | null;
  plural?: string | null;
  ipa?: string;
  partOfSpeech: string;
  exampleDe: string;
  exampleEn: string;
  grammarNote?: string;
  srsState: SrsCardState;
  source: "curriculum" | "user_saved";
  savedAt?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  titleDe: string;
  description: string;
  levelCode: string;
  iconName: string;
  totalCards: number;
  dueCards: number;
  masteredCards: number; // Cards with interval >= 21 days
  isCustomDeck?: boolean;
}

const STORAGE_KEY = "deutschpfad_flashcards_v1";

// Seed default curriculum flashcards from seeded lessons
function generateInitialFlashcards(): FlashcardItem[] {
  const cards: FlashcardItem[] = [];

  // 1. Gather all vocabulary from seeded A1 lessons
  Object.values(LESSONS_DATABASE).forEach((lesson) => {
    lesson.vocabulary.forEach((v) => {
      // Simulate slightly varied initial due dates so some are due today, some tomorrow
      const isDue = Math.random() < 0.65; // 65% due on initial load
      const randomPastDays = Math.floor(Math.random() * 3);
      const dueDate = isDue
        ? new Date(Date.now() - randomPastDays * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

      cards.push({
        id: `card-${v.id}`,
        deckId: lesson.unitId,
        unitId: lesson.unitId,
        german: v.german,
        english: v.english,
        article: v.article,
        plural: v.plural,
        ipa: v.ipa,
        partOfSpeech: v.partOfSpeech,
        exampleDe: v.exampleDe,
        exampleEn: v.exampleEn,
        grammarNote: v.grammarNote,
        srsState: {
          repetitions: isDue ? 0 : 1,
          interval: isDue ? 0 : 2,
          easeFactor: 2.5,
          dueDate,
        },
        source: "curriculum",
      });
    });
  });

  // 2. Extra initial items for "My Words" custom deck
  const initialMyWords: VocabularyItem[] = [
    {
      id: "mw-1",
      german: "Krankenhaus",
      english: "hospital",
      article: "das",
      plural: "die Krankenhäuser",
      ipa: "/ˈkʁaŋkn̩ˌhaʊ̯s/",
      partOfSpeech: "noun",
      exampleDe: "Das Krankenhaus liegt in der Stadtmitte.",
      exampleEn: "The hospital is located in the city center.",
      grammarNote: "Compound noun: krank (sick) + Haus (house). Neutral gender takes 'das'.",
    },
    {
      id: "mw-2",
      german: "Gemütlichkeit",
      english: "coziness / warmth",
      article: "die",
      plural: null,
      ipa: "/ɡəˈmyːtlɪçkaɪ̯t/",
      partOfSpeech: "noun",
      exampleDe: "Wir genießen die Gemütlichkeit im Café.",
      exampleEn: "We enjoy the coziness in the café.",
      grammarNote: "Nouns ending in '-keit' are always feminine ('die').",
    },
  ];

  initialMyWords.forEach((v) => {
    cards.push({
      id: `card-${v.id}`,
      deckId: "my-words",
      german: v.german,
      english: v.english,
      article: v.article,
      plural: v.plural,
      ipa: v.ipa,
      partOfSpeech: v.partOfSpeech,
      exampleDe: v.exampleDe,
      exampleEn: v.exampleEn,
      grammarNote: v.grammarNote,
      srsState: {
        ...DEFAULT_SRS_STATE,
        dueDate: new Date(Date.now() - 1000).toISOString(), // Due immediately
      },
      source: "user_saved",
      savedAt: new Date().toISOString(),
    });
  });

  return cards;
}

export function getAllFlashcards(): FlashcardItem[] {
  if (typeof window === "undefined") return generateInitialFlashcards();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialFlashcards();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return generateInitialFlashcards();
  }
}

export function saveAllFlashcards(cards: FlashcardItem[]): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch {}
  }
}

export const DECK_DEFINITIONS: {
  id: string;
  title: string;
  titleDe: string;
  description: string;
  levelCode: string;
  iconName: string;
  isCustomDeck?: boolean;
}[] = [
  {
    id: "my-words",
    title: "My Saved Words",
    titleDe: "Mein persönlicher Wortschatz",
    description: "Vocabulary you bookmarked from lessons and drills for focused mastery.",
    levelCode: "Custom",
    iconName: "bookmark",
    isCustomDeck: true,
  },
  {
    id: "a1-u1",
    title: "Unit 1: Greetings & Introductions",
    titleDe: "Begrüßung & Höflichkeit",
    description: "Formal vs informal greetings, titles, courtesy formulas, and numbers 1-20.",
    levelCode: "A1",
    iconName: "handshake",
  },
  {
    id: "a1-u2",
    title: "Unit 2: Everyday Life & Shopping",
    titleDe: "Alltag & Einkaufen",
    description: "Supermarket vocabulary, food, prices, and plural forms of nouns.",
    levelCode: "A1",
    iconName: "shopping-bag",
  },
  {
    id: "a1-u3",
    title: "Unit 3: Family & Free Time",
    titleDe: "Familie & Freizeit",
    description: "Family members, possessive pronouns, telling time, and weekend hobbies.",
    levelCode: "A1",
    iconName: "users",
  },
  {
    id: "a1-u4",
    title: "Unit 4: Living & Home",
    titleDe: "Wohnen & Möbel",
    description: "Apartments, furniture, describing rooms, and the accusative case.",
    levelCode: "A1",
    iconName: "home",
  },
];

export function getDecks(): FlashcardDeck[] {
  const cards = getAllFlashcards();
  const now = new Date();

  return DECK_DEFINITIONS.map((def) => {
    const deckCards = cards.filter((c) => c.deckId === def.id);
    const dueCount = deckCards.filter((c) => isCardDue(c.srsState.dueDate, now)).length;
    const masteredCount = deckCards.filter((c) => (c.srsState.interval || 0) >= 21).length;

    return {
      id: def.id,
      title: def.title,
      titleDe: def.titleDe,
      description: def.description,
      levelCode: def.levelCode,
      iconName: def.iconName,
      totalCards: deckCards.length,
      dueCards: dueCount,
      masteredCards: masteredCount,
      isCustomDeck: def.isCustomDeck,
    };
  });
}

export function getCardsForDeck(deckId: string): FlashcardItem[] {
  const cards = getAllFlashcards();
  return cards.filter((c) => c.deckId === deckId);
}

export function getDueCardsForDeck(deckId: string): FlashcardItem[] {
  const cards = getCardsForDeck(deckId);
  const now = new Date();
  const due = cards.filter((c) => isCardDue(c.srsState.dueDate, now));
  try {
    cacheFlashcardsForOffline(deckId, due.length > 0 ? due : cards);
  } catch {}
  return due;
}

export function getTotalDueCardsCount(): number {
  const cards = getAllFlashcards();
  const now = new Date();
  return cards.filter((c) => isCardDue(c.srsState.dueDate, now)).length;
}

export function rateFlashcard(cardId: string, rating: ReviewRating): SrsCardState {
  const cards = getAllFlashcards();
  const cardIndex = cards.findIndex((c) => c.id === cardId);
  const now = new Date();

  if (cardIndex === -1) {
    return calculateSm2(DEFAULT_SRS_STATE, rating, now);
  }

  const current = cards[cardIndex];
  const nextSrs = calculateSm2(current.srsState, rating, now);

  cards[cardIndex] = {
    ...current,
    srsState: nextSrs,
  };

  saveAllFlashcards(cards);

  // Optimistic sync: enqueue action for immediate or background sync
  enqueueOfflineAction("flashcard_review", {
    cardId,
    nextSrs,
  });

  return nextSrs;
}

export function saveWordToMyWords(vocab: VocabularyItem): boolean {
  const cards = getAllFlashcards();
  const exists = cards.some(
    (c) => c.deckId === "my-words" && c.german.toLowerCase() === vocab.german.toLowerCase()
  );

  if (exists) return false;

  const newCard: FlashcardItem = {
    id: `card-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    deckId: "my-words",
    german: vocab.german,
    english: vocab.english,
    article: vocab.article,
    plural: vocab.plural,
    ipa: vocab.ipa,
    partOfSpeech: vocab.partOfSpeech,
    exampleDe: vocab.exampleDe,
    exampleEn: vocab.exampleEn,
    grammarNote: vocab.grammarNote,
    srsState: {
      ...DEFAULT_SRS_STATE,
      dueDate: new Date().toISOString(), // Due immediately for practice
    },
    source: "user_saved",
    savedAt: new Date().toISOString(),
  };

  cards.unshift(newCard);
  saveAllFlashcards(cards);
  return true;
}

export function removeWordFromMyWords(cardIdOrGerman: string): void {
  const cards = getAllFlashcards();
  const filtered = cards.filter(
    (c) =>
      !(
        c.deckId === "my-words" &&
        (c.id === cardIdOrGerman || c.german.toLowerCase() === cardIdOrGerman.toLowerCase())
      )
  );
  saveAllFlashcards(filtered);
}

export function isWordSavedInMyWords(german: string): boolean {
  const cards = getAllFlashcards();
  return cards.some(
    (c) => c.deckId === "my-words" && c.german.toLowerCase() === german.toLowerCase()
  );
}
