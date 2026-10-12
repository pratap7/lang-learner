/**
 * DeutschPfad: Comprehensive Course Curriculum & Learning Data Repository
 * Full sample content for CEFR A1–C2 with deep interactive lessons for A1 Unit 1.
 */

export interface VocabularyItem {
  id: string;
  german: string;
  english: string;
  article?: "der" | "die" | "das" | null;
  plural?: string | null;
  ipa?: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "phrase" | "adverb";
  exampleDe: string;
  exampleEn: string;
  grammarNote?: string;
}

export interface GrammarSection {
  title: string;
  explanation: string;
  ruleHighlight?: string;
  tables?: {
    caption: string;
    headers: string[];
    rows: string[][];
    colorCodes?: Record<string, string>; // e.g. "der": "#3b82f6", "die": "#ec4899", "das": "#10b981"
  }[];
  examples: {
    de: string;
    en: string;
    breakdown?: string;
  }[];
}

export interface DialogueLine {
  speaker: string;
  avatar: string;
  avatarBg: string;
  german: string;
  english: string;
}

export interface CultureNote {
  title: string;
  location: string;
  flag: string;
  content: string;
  proTip: string;
}

export interface LessonContent {
  id: string;
  unitId: string;
  levelCode: "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  orderIndex: number;
  slug: string;
  title: string;
  titleDe: string;
  type: "vocabulary" | "grammar" | "dialogue" | "culture" | "review";
  estMinutes: number;
  xpReward: number;
  summary: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarSection;
  dialogue: {
    title: string;
    context: string;
    lines: DialogueLine[];
  };
  culture: CultureNote;
  keyTakeaways: string[];
}

export interface UnitItem {
  id: string;
  levelCode: "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  orderIndex: number;
  slug: string;
  title: string;
  titleDe: string;
  description: string;
  iconName: string;
  totalLessons: number;
  lessons: {
    id: string;
    orderIndex: number;
    slug: string;
    title: string;
    titleDe: string;
    type: "vocabulary" | "grammar" | "dialogue" | "culture" | "review";
    estMinutes: number;
    xpReward: number;
  }[];
}

export interface LevelItem {
  code: "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  name: string;
  nameDe: string;
  badgeLabel: string;
  description: string;
  guidedHours: number;
  officialExam: string;
  colorHex: string;
  unitsCount: number;
  lessonsCount: number;
  isUnlockedDefault: boolean;
  skills: string[];
}

/* ─── Level Definitions ─────────────────────────────────────────────────── */

export const CEFR_LEVELS: LevelItem[] = [
  {
    code: "a1",
    name: "A1 · Beginner (Breakthrough)",
    nameDe: "A1 · Anfänger",
    badgeLabel: "A1",
    description: "Foundational vocabulary, personal introductions, essential polite expressions, food ordering, and definite articles (der/die/das).",
    guidedHours: 80,
    officialExam: "Goethe-Zertifikat A1: Start Deutsch 1",
    colorHex: "#10b981",
    unitsCount: 6,
    lessonsCount: 36,
    isUnlockedDefault: true,
    skills: ["Greetings & Courtesy", "Gender Articles", "Present Tense Verbs", "Basic Questions"],
  },
  {
    code: "a2",
    name: "A2 · Elementary (Waystage)",
    nameDe: "A2 · Grundkenntnisse",
    badgeLabel: "A2",
    description: "Everyday routines, past tense (Perfekt), describing places and family, shopping, public transit, and simple personal emails.",
    guidedHours: 150,
    officialExam: "Goethe-Zertifikat A2 / telc Deutsch A2",
    colorHex: "#06b6d4",
    unitsCount: 8,
    lessonsCount: 48,
    isUnlockedDefault: true,
    skills: ["Past Tense (Perfekt)", "Accusative & Dative Pronouns", "Directions", "Daily Routine"],
  },
  {
    code: "b1",
    name: "B1 · Intermediate (Threshold)",
    nameDe: "B1 · Mittelstufe",
    badgeLabel: "B1",
    description: "Expressing opinions, travel problems, German citizenship requirement (DTZ), Subjunctive II (Konjunktiv II), and reading news excerpts.",
    guidedHours: 300,
    officialExam: "Goethe-Zertifikat B1 / DTZ (Zuwanderer)",
    colorHex: "#3b82f6",
    unitsCount: 10,
    lessonsCount: 60,
    isUnlockedDefault: false,
    skills: ["Konjunktiv II", "Subordinate Clauses (weil/dass)", "German Citizenship", "Debates"],
  },
  {
    code: "b2",
    name: "B2 · Upper-Intermediate (Vantage)",
    nameDe: "B2 · Gute Mittelstufe",
    badgeLabel: "B2",
    description: "Professional workplace communication, university entrance, complex technical texts, spontaneous idioms, and passive voice.",
    guidedHours: 450,
    officialExam: "Goethe-Zertifikat B2 / TestDaF (TDN 3/4)",
    colorHex: "#6366f1",
    unitsCount: 10,
    lessonsCount: 60,
    isUnlockedDefault: false,
    skills: ["Professional Emails", "Passive Voice", "Complex Connectors", "Abstract Arguments"],
  },
  {
    code: "c1",
    name: "C1 · Advanced (Effective Fluency)",
    nameDe: "C1 · Oberstufe",
    badgeLabel: "C1",
    description: "Academic discussions, literary nuance, implicit meanings, flexible vocabulary for research, policy, and high-level negotiations.",
    guidedHours: 650,
    officialExam: "Goethe-Zertifikat C1 / telc C1 Hochschule",
    colorHex: "#8b5cf6",
    unitsCount: 8,
    lessonsCount: 48,
    isUnlockedDefault: false,
    skills: ["Academic Discourse", "Nominal Style", "Subtle Irony & Idioms", "Scientific Writing"],
  },
  {
    code: "c2",
    name: "C2 · Mastery (Native Precision)",
    nameDe: "C2 · Muttersprachliches Niveau",
    badgeLabel: "C2",
    description: "Effortless comprehension, native precision, regional idioms, dialect awareness, and masterful cultural eloquence.",
    guidedHours: 850,
    officialExam: "Goethe-Zertifikat C2: GDS",
    colorHex: "#ec4899",
    unitsCount: 6,
    lessonsCount: 36,
    isUnlockedDefault: false,
    skills: ["Native Eloquence", "Dialects (Bairisch, Schwäbisch)", "Philosophy & Rhetoric"],
  },
];

/* ─── Units Data for A1 ─────────────────────────────────────────────────── */

export const A1_UNITS: UnitItem[] = [
  {
    id: "a1-u1",
    levelCode: "a1",
    orderIndex: 1,
    slug: "a1-u1-erste-schritte",
    title: "Unit 1: Greetings and Introductions",
    titleDe: "Einheit 1: Begrüßungen und Kennenlernen",
    description: "Master everyday German greetings, formal vs informal address, introducing yourself, gender articles (der/die/das), and ordering at a café.",
    iconName: "MessageSquare",
    totalLessons: 4,
    lessons: [
      {
        id: "a1-u1-l1",
        orderIndex: 1,
        slug: "a1-u1-l1-begruessungen",
        title: "Lesson 1: Greetings & Politeness",
        titleDe: "Lektion 1: Begrüßungen & Höflichkeit",
        type: "vocabulary",
        estMinutes: 12,
        xpReward: 25,
      },
      {
        id: "a1-u1-l2",
        orderIndex: 2,
        slug: "a1-u1-l2-sich-vorstellen",
        title: "Lesson 2: Introducing Yourself",
        titleDe: "Lektion 2: Sich vorstellen & Herkunft",
        type: "dialogue",
        estMinutes: 15,
        xpReward: 30,
      },
      {
        id: "a1-u1-l3",
        orderIndex: 3,
        slug: "a1-u1-l3-artikel-der-die-das",
        title: "Lesson 3: Articles & Gender (Der, Die, Das)",
        titleDe: "Lektion 3: Die Artikel: Der, Die, Das",
        type: "grammar",
        estMinutes: 18,
        xpReward: 35,
      },
      {
        id: "a1-u1-l4",
        orderIndex: 4,
        slug: "a1-u1-l4-im-cafe",
        title: "Lesson 4: At the Café (Ordering & Numbers)",
        titleDe: "Lektion 4: Im Café: Bestellen & Zahlen 1–10",
        type: "dialogue",
        estMinutes: 15,
        xpReward: 30,
      },
    ],
  },
  {
    id: "a1-u2",
    levelCode: "a1",
    orderIndex: 2,
    slug: "a1-u2-alltag-einkaufen",
    title: "Unit 2: Everyday Life & Shopping",
    titleDe: "Einheit 2: Alltag & Einkaufen im Supermarkt",
    description: "Supermarket vocabulary, prices, plural forms of nouns, and asking for prices in German cities.",
    iconName: "ShoppingBag",
    totalLessons: 5,
    lessons: [
      { id: "a1-u2-l1", orderIndex: 1, slug: "a1-u2-l1", title: "At the Supermarket", titleDe: "Im Supermarkt", type: "vocabulary", estMinutes: 15, xpReward: 25 },
      { id: "a1-u2-l2", orderIndex: 2, slug: "a1-u2-l2", title: "Plurals of Nouns", titleDe: "Die Pluralformen", type: "grammar", estMinutes: 18, xpReward: 30 },
      { id: "a1-u2-l3", orderIndex: 3, slug: "a1-u2-l3", title: "How much is that? (Prices)", titleDe: "Wie viel kostet das?", type: "dialogue", estMinutes: 14, xpReward: 25 },
      { id: "a1-u2-l4", orderIndex: 4, slug: "a1-u2-l4", title: "Food & Drinks", titleDe: "Essen & Trinken", type: "vocabulary", estMinutes: 12, xpReward: 25 },
      { id: "a1-u2-l5", orderIndex: 5, slug: "a1-u2-l5", title: "Unit 2 Review & Quiz", titleDe: "Wiederholung & Test", type: "review", estMinutes: 20, xpReward: 50 },
    ],
  },
  {
    id: "a1-u3",
    levelCode: "a1",
    orderIndex: 3,
    slug: "a1-u3-familie-freizeit",
    title: "Unit 3: Family & Free Time",
    titleDe: "Einheit 3: Familie, Hobbys & Freizeit",
    description: "Talking about relatives, possessive pronouns (mein/dein), weekend activities, and scheduling time.",
    iconName: "Users",
    totalLessons: 6,
    lessons: [
      { id: "a1-u3-l1", orderIndex: 1, slug: "a1-u3-l1", title: "Family Members", titleDe: "Meine Familie", type: "vocabulary", estMinutes: 14, xpReward: 25 },
      { id: "a1-u3-l2", orderIndex: 2, slug: "a1-u3-l2", title: "Possessive Pronouns: Mein & Dein", titleDe: "Possessivartikel", type: "grammar", estMinutes: 16, xpReward: 30 },
      { id: "a1-u3-l3", orderIndex: 3, slug: "a1-u3-l3", title: "Hobbies & Sports", titleDe: "Hobbys & Freizeitaktivitäten", type: "vocabulary", estMinutes: 15, xpReward: 25 },
      { id: "a1-u3-l4", orderIndex: 4, slug: "a1-u3-l4", title: "Telling the Time in German", titleDe: "Die Uhrzeit", type: "grammar", estMinutes: 18, xpReward: 35 },
      { id: "a1-u3-l5", orderIndex: 5, slug: "a1-u3-l5", title: "Weekend Plans Dialogue", titleDe: "Wochenendpläne", type: "dialogue", estMinutes: 15, xpReward: 30 },
      { id: "a1-u3-l6", orderIndex: 6, slug: "a1-u3-l6", title: "Unit 3 Mastery Quiz", titleDe: "Abschlusstest Einheit 3", type: "review", estMinutes: 20, xpReward: 50 },
    ],
  },
  {
    id: "a1-u4",
    levelCode: "a1",
    orderIndex: 4,
    slug: "a1-u4-wohnen-moebel",
    title: "Unit 4: Living & Home",
    titleDe: "Einheit 4: Wohnen, Wohnung & Möbel",
    description: "Apartments, furniture, describing rooms, and the accusative case (den, die, das, einen, eine).",
    iconName: "Home",
    totalLessons: 6,
    lessons: [
      { id: "a1-u4-l1", orderIndex: 1, slug: "a1-u4-l1", title: "My Apartment & Rooms", titleDe: "Meine Wohnung", type: "vocabulary", estMinutes: 15, xpReward: 25 },
      { id: "a1-u4-l2", orderIndex: 2, slug: "a1-u4-l2", title: "Furniture & Decor", titleDe: "Möbel und Einrichtung", type: "vocabulary", estMinutes: 14, xpReward: 25 },
      { id: "a1-u4-l3", orderIndex: 3, slug: "a1-u4-l3", title: "The Accusative Case (Den / Einen)", titleDe: "Der Akkusativ", type: "grammar", estMinutes: 22, xpReward: 40 },
      { id: "a1-u4-l4", orderIndex: 4, slug: "a1-u4-l4", title: "Adjectives for the Home", titleDe: "Adjektive: groß, klein, hell", type: "grammar", estMinutes: 15, xpReward: 30 },
      { id: "a1-u4-l5", orderIndex: 5, slug: "a1-u4-l5", title: "Apartment Hunting in Berlin", titleDe: "Wohnungssuche", type: "dialogue", estMinutes: 16, xpReward: 30 },
      { id: "a1-u4-l6", orderIndex: 6, slug: "a1-u4-l6", title: "Unit 4 Accusative Challenge", titleDe: "Akkusativ-Meistertest", type: "review", estMinutes: 20, xpReward: 50 },
    ],
  },
  {
    id: "a1-u5",
    levelCode: "a1",
    orderIndex: 5,
    slug: "a1-u5-stadt-verkehr",
    title: "Unit 5: The City & Transport",
    titleDe: "Einheit 5: Unterwegs in der Stadt & Verkehr",
    description: "Public transport (U-Bahn, S-Bahn, Tram), tickets, asking for directions, and prepositions of place.",
    iconName: "Compass",
    totalLessons: 7,
    lessons: [
      { id: "a1-u5-l1", orderIndex: 1, slug: "a1-u5-l1", title: "Modes of Transport", titleDe: "Verkehrsmittel", type: "vocabulary", estMinutes: 14, xpReward: 25 },
      { id: "a1-u5-l2", orderIndex: 2, slug: "a1-u5-l2", title: "Buying a Train Ticket", titleDe: "Am Fahrkartenautomat", type: "dialogue", estMinutes: 15, xpReward: 30 },
      { id: "a1-u5-l3", orderIndex: 3, slug: "a1-u5-l3", title: "Directions: Links, Rechts, Geradeaus", titleDe: "Wegbeschreibung", type: "vocabulary", estMinutes: 16, xpReward: 30 },
      { id: "a1-u5-l4", orderIndex: 4, slug: "a1-u5-l4", title: "Local Prepositions with Dative", titleDe: "Lokale Präpositionen (Dativ)", type: "grammar", estMinutes: 20, xpReward: 40 },
      { id: "a1-u5-l5", orderIndex: 5, slug: "a1-u5-l5", title: "Lost in Munich (Dialogue)", titleDe: "Orientierung in München", type: "dialogue", estMinutes: 16, xpReward: 30 },
      { id: "a1-u5-l6", orderIndex: 6, slug: "a1-u5-l6", title: "The Deutsche Bahn Guide", titleDe: "Kultur: DB & ÖPNV", type: "culture", estMinutes: 12, xpReward: 20 },
      { id: "a1-u5-l7", orderIndex: 7, slug: "a1-u5-l7", title: "Unit 5 Transport Quiz", titleDe: "Verkehrs-Check", type: "review", estMinutes: 20, xpReward: 50 },
    ],
  },
  {
    id: "a1-u6",
    levelCode: "a1",
    orderIndex: 6,
    slug: "a1-u6-abschluss-pruefung",
    title: "Unit 6: Work, Health & Official A1 Exam",
    titleDe: "Einheit 6: Beruf, Gesundheit & Goethe A1 Prüfung",
    description: "Professions, making doctor appointments, parts of the body, and the complete Goethe-Zertifikat A1 mock exam.",
    iconName: "Trophy",
    totalLessons: 8,
    lessons: [
      { id: "a1-u6-l1", orderIndex: 1, slug: "a1-u6-l1", title: "Jobs & Careers", titleDe: "Berufe & Tätigkeiten", type: "vocabulary", estMinutes: 15, xpReward: 25 },
      { id: "a1-u6-l2", orderIndex: 2, slug: "a1-u6-l2", title: "Body Parts & Health", titleDe: "Körperteile & Gesundheit", type: "vocabulary", estMinutes: 15, xpReward: 25 },
      { id: "a1-u6-l3", orderIndex: 3, slug: "a1-u6-l3", title: "Modal Verbs: Können, Müssen, Wollen", titleDe: "Modalverben", type: "grammar", estMinutes: 22, xpReward: 40 },
      { id: "a1-u6-l4", orderIndex: 4, slug: "a1-u6-l4", title: "At the Doctor (Doctor Dialogue)", titleDe: "Beim Arzt", type: "dialogue", estMinutes: 16, xpReward: 30 },
      { id: "a1-u6-l5", orderIndex: 5, slug: "a1-u6-l5", title: "Writing Short Emails in German", titleDe: "E-Mails schreiben", type: "grammar", estMinutes: 18, xpReward: 35 },
      { id: "a1-u6-l6", orderIndex: 6, slug: "a1-u6-l6", title: "Goethe A1 Listening Section", titleDe: "Goethe A1 Hören", type: "review", estMinutes: 20, xpReward: 50 },
      { id: "a1-u6-l7", orderIndex: 7, slug: "a1-u6-l7", title: "Goethe A1 Reading & Writing", titleDe: "Goethe A1 Lesen & Schreiben", type: "review", estMinutes: 25, xpReward: 60 },
      { id: "a1-u6-l8", orderIndex: 8, slug: "a1-u6-l8", title: "Official A1 Graduation Mock Exam", titleDe: "Offizieller A1-Abschlusstest", type: "review", estMinutes: 45, xpReward: 150 },
    ],
  },
];

/* ─── Fully Detailed Lessons for A1 Unit 1 ─────────────────────────────── */

export const LESSONS_DATABASE: Record<string, LessonContent> = {
  "a1-u1-l1": {
    id: "a1-u1-l1",
    unitId: "a1-u1",
    levelCode: "a1",
    orderIndex: 1,
    slug: "a1-u1-l1-begruessungen",
    title: "Greetings & Politeness",
    titleDe: "Begrüßungen & Höflichkeitsformen",
    type: "vocabulary",
    estMinutes: 12,
    xpReward: 25,
    summary: "Learn how to greet people at any time of day, master the difference between formal 'Sie' and informal 'du', and speak with polite German etiquette.",
    vocabulary: [
      {
        id: "v1",
        german: "Hallo",
        english: "Hello / Hi",
        article: null,
        ipa: "/ˈhalo/",
        partOfSpeech: "phrase",
        exampleDe: "Hallo, wie geht es dir?",
        exampleEn: "Hello, how are you?",
        grammarNote: "Informal greeting used with friends, family, and peers.",
      },
      {
        id: "v2",
        german: "Guten Morgen",
        english: "Good morning",
        article: null,
        ipa: "/ˌɡuːtn̩ ˈmɔʁɡn̩/",
        partOfSpeech: "phrase",
        exampleDe: "Guten Morgen, Herr Schmidt!",
        exampleEn: "Good morning, Mr. Schmidt!",
        grammarNote: "Used until roughly 11:00 AM. Grammatically an accusative masculine phrase (der Morgen -> Guten Morgen).",
      },
      {
        id: "v3",
        german: "Guten Tag",
        english: "Good day / Hello (formal)",
        article: null,
        ipa: "/ˌɡuːtn̩ ˈtaːk/",
        partOfSpeech: "phrase",
        exampleDe: "Guten Tag, wie kann ich Ihnen helfen?",
        exampleEn: "Good day, how can I help you?",
        grammarNote: "The universal formal daytime greeting throughout Germany, Austria, and Switzerland (from 11:00 AM to ~6:00 PM).",
      },
      {
        id: "v4",
        german: "Guten Abend",
        english: "Good evening",
        article: null,
        ipa: "/ˌɡuːtn̩ ˈaːbn̩t/",
        partOfSpeech: "phrase",
        exampleDe: "Guten Abend allerseits!",
        exampleEn: "Good evening everyone!",
        grammarNote: "Used from roughly 6:00 PM onwards.",
      },
      {
        id: "v5",
        german: "Auf Wiedersehen",
        english: "Goodbye (formal)",
        article: null,
        ipa: "/aʊf ˈviːdɐˌzeːən/",
        partOfSpeech: "phrase",
        exampleDe: "Auf Wiedersehen und bis morgen!",
        exampleEn: "Goodbye and see you tomorrow!",
        grammarNote: "Literally: 'Until we see each other again'. On the phone, Germans say 'Auf Wiederhören' (until we hear each other again).",
      },
      {
        id: "v6",
        german: "Tschüss",
        english: "Bye (informal)",
        article: null,
        ipa: "/tʃʏs/",
        partOfSpeech: "phrase",
        exampleDe: "Tschüss, mach's gut!",
        exampleEn: "Bye, take care!",
        grammarNote: "Universal informal farewell. Often doubled cheerfully: 'Tschüssi!'.",
      },
      {
        id: "v7",
        german: "Danke schön",
        english: "Thank you very much",
        article: null,
        ipa: "/ˈdaŋkə ʃøːn/",
        partOfSpeech: "phrase",
        exampleDe: "Vielen Dank für Ihre Hilfe!",
        exampleEn: "Many thanks for your help!",
        grammarNote: "Can be shortened to 'Danke' or intensified as 'Vielen Dank' (Many thanks).",
      },
      {
        id: "v8",
        german: "Bitte sehr",
        english: "You are welcome / Here you go",
        article: null,
        ipa: "/ˈbɪtə zeːɐ̯/",
        partOfSpeech: "phrase",
        exampleDe: "Bitte sehr, gern geschehen!",
        exampleEn: "You're very welcome, my pleasure!",
        grammarNote: "'Bitte' is one of the most versatile words in German: it means 'please', 'you're welcome', and 'pardon?'.",
      },
    ],
    grammar: {
      title: "The Golden Rule: Formal 'Sie' vs. Informal 'du'",
      explanation: "German distinguishes strictly between addressing someone respectfully (Formal: Sie) versus familiarly (Informal: du). Using 'du' prematurely in a professional setting or with government officials (e.g. Bürgeramt, police, banks) is considered impolite.",
      ruleHighlight: "Crucial rule: The formal pronoun 'Sie' (and its possessive 'Ihr') is ALWAYS capitalized in writing, no matter where it appears in the sentence!",
      tables: [
        {
          caption: "Formal vs. Informal Comparison Matrix",
          headers: ["Context", "Formal (Sie)", "Informal (du)", "Grammar Form"],
          rows: [
            ["How are you?", "Wie geht es Ihnen?", "Wie geht's dir?", "Dative pronoun"],
            ["What is your name?", "Wie heißen Sie?", "Wie heißt du?", "Verb ending: -en vs -t"],
            ["Where are you from?", "Woher kommen Sie?", "Woher kommst du?", "Verb ending: -en vs -st"],
            ["Goodbye", "Auf Wiedersehen", "Tschüss / Bis bald", "Social register"],
          ],
        },
      ],
      examples: [
        {
          de: "Guten Tag, Herr Weber. Wie geht es Ihnen?",
          en: "Good day, Mr. Weber. How are you? (formal)",
          breakdown: "Uses 'Herr Weber' + formal dative pronoun 'Ihnen' with capital 'I'.",
        },
        {
          de: "Hallo Jonas! Wie geht's dir?",
          en: "Hi Jonas! How are you doing? (informal)",
          breakdown: "Uses first name 'Jonas' + contracted informal 'Wie geht's dir?'.",
        },
      ],
    },
    dialogue: {
      title: "Treffen am Berliner Hauptbahnhof",
      context: "Herr Schmidt meets a new business partner, Frau Dr. Weber, at the central train station in Berlin.",
      lines: [
        {
          speaker: "Herr Schmidt",
          avatar: "HS",
          avatarBg: "from-blue-600 to-indigo-600",
          german: "Guten Tag, Frau Dr. Weber! Willkommen in Berlin.",
          english: "Good day, Dr. Weber! Welcome to Berlin.",
        },
        {
          speaker: "Frau Dr. Weber",
          avatar: "FW",
          avatarBg: "from-emerald-600 to-teal-600",
          german: "Guten Tag, Herr Schmidt! Freut mich sehr, Sie kennenzulernen.",
          english: "Good day, Mr. Schmidt! Very pleased to meet you.",
        },
        {
          speaker: "Herr Schmidt",
          avatar: "HS",
          avatarBg: "from-blue-600 to-indigo-600",
          german: "Die Freude ist ganz meinerseits. Hatten Sie eine angenehme Fahrt?",
          english: "The pleasure is entirely mine. Did you have a pleasant journey?",
        },
        {
          speaker: "Frau Dr. Weber",
          avatar: "FW",
          avatarBg: "from-emerald-600 to-teal-600",
          german: "Ja, danke schön! Der ICE war sehr pünktlich.",
          english: "Yes, thank you very much! The ICE train was right on time.",
        },
      ],
    },
    culture: {
      title: "The Handshake, Eye Contact & Du-Etiquette",
      location: "Berlin & DACH region",
      flag: "🇩🇪 🇦🇹 🇨🇭",
      content: "In Germany, Austria, and Switzerland, shaking hands with firm grip while maintaining direct eye contact is the standard greeting in professional and semi-formal settings. Default to 'Sie' and family names with titles ('Frau Schmidt', 'Herr Dr. Müller') until the other person explicitly offers: 'Wir können uns gerne duzen' (We can use 'du').",
      proTip: "In Austrian Bavaria and Austria, you will frequently hear 'Grüß Gott' (literally: God greet you) instead of 'Guten Tag', and in Switzerland, 'Grüezi' is the universal formal greeting!",
    },
    keyTakeaways: [
      "Use 'Guten Morgen' until ~11:00 AM, 'Guten Tag' during the day, and 'Guten Abend' in the evening.",
      "Always capitalize formal 'Sie' and 'Ihnen' in writing.",
      "Say 'Auf Wiedersehen' in formal situations and 'Tschüss' with friends.",
      "Default to 'Sie' in shops, offices, and with strangers until invited to use 'du'.",
    ],
  },

  "a1-u1-l2": {
    id: "a1-u1-l2",
    unitId: "a1-u1",
    levelCode: "a1",
    orderIndex: 2,
    slug: "a1-u1-l2-sich-vorstellen",
    title: "Introducing Yourself",
    titleDe: "Sich vorstellen & Herkunft",
    type: "dialogue",
    estMinutes: 15,
    xpReward: 30,
    summary: "Learn to introduce yourself with confidence: state your name, where you come from, where you live, and what languages you speak.",
    vocabulary: [
      {
        id: "v9",
        german: "heißen",
        english: "to be called / named",
        partOfSpeech: "verb",
        exampleDe: "Ich heiße Alex.",
        exampleEn: "My name is Alex (I am called Alex).",
        grammarNote: "Notice the Eszett 'ß'. In the present tense: ich heiße, du heißt, er/sie heißt.",
      },
      {
        id: "v10",
        german: "kommen",
        english: "to come (from)",
        partOfSpeech: "verb",
        exampleDe: "Woher kommen Sie? - Ich komme aus den USA.",
        exampleEn: "Where do you come from? - I come from the USA.",
        grammarNote: "Paired with preposition 'aus' (from): 'aus Deutschland', 'aus Indien', 'aus den USA'.",
      },
      {
        id: "v11",
        german: "wohnen",
        english: "to live / reside",
        partOfSpeech: "verb",
        exampleDe: "Ich wohne in Berlin.",
        exampleEn: "I live in Berlin.",
        grammarNote: "Paired with preposition 'in' (in): 'in München', 'in Wien', 'in Zürich'.",
      },
      {
        id: "v12",
        german: "sprechen",
        english: "to speak",
        partOfSpeech: "verb",
        exampleDe: "Ich spreche Englisch und ein bisschen Deutsch.",
        exampleEn: "I speak English and a little German.",
        grammarNote: "Irregular stem-changing verb: du sprichst, er/sie spricht.",
      },
      {
        id: "v13",
        german: "Deutschland",
        english: "Germany",
        article: null,
        ipa: "/ˈdɔɪ̯t͡ʃlant/",
        partOfSpeech: "noun",
        exampleDe: "Deutschland liegt in Mitteleuropa.",
        exampleEn: "Germany is in Central Europe.",
        grammarNote: "Neuter country with no article: 'Ich fahre nach Deutschland'.",
      },
      {
        id: "v14",
        german: "die Schweiz",
        english: "Switzerland",
        article: "die",
        ipa: "/diː ʃvaɪ̯ts/",
        partOfSpeech: "noun",
        exampleDe: "Ich komme aus der Schweiz.",
        exampleEn: "I come from Switzerland.",
        grammarNote: "Feminine country noun! In dative with 'aus', 'die' changes to 'der Schweiz'.",
      },
    ],
    grammar: {
      title: "Present Tense Verb Conjugation & The V2 Rule",
      explanation: "In German, verbs change their endings depending on the subject pronoun. Furthermore, in main declarative statements, the conjugated verb MUST occupy the second position (V2 rule).",
      ruleHighlight: "Standard endings: ich (-e), du (-st), er/sie/es (-t), wir (-en), ihr (-t), Sie/sie (-en).",
      tables: [
        {
          caption: "Regular Present Tense Verb Endings: kommen (to come)",
          headers: ["Pronoun", "German Form", "English Translation", "Ending"],
          rows: [
            ["ich (I)", "ich komme", "I come", "-e"],
            ["du (you informal)", "du kommst", "you come", "-st"],
            ["er/sie/es (he/she/it)", "er/sie kommt", "he/she comes", "-t"],
            ["wir (we)", "wir kommen", "we come", "-en"],
            ["ihr (you all)", "ihr kommt", "you all come", "-t"],
            ["Sie/sie (You formal / they)", "Sie kommen", "You come / they come", "-en"],
          ],
        },
      ],
      examples: [
        {
          de: "Ich komme aus Spanien.",
          en: "I come from Spain.",
          breakdown: "Position 1: Ich | Position 2 (Verb): komme | Position 3: aus Spanien.",
        },
        {
          de: "Heute lerne ich Deutsch.",
          en: "Today I am learning German.",
          breakdown: "Position 1: Heute | Position 2 (Verb): lerne | Position 3: ich Deutsch. (V2 Rule preserved!)",
        },
      ],
    },
    dialogue: {
      title: "Kennenlernen im Deutschkurs",
      context: "Two learners, Liam and Elena, introduce themselves on the first day of an intensive language course in Frankfurt.",
      lines: [
        {
          speaker: "Liam",
          avatar: "L",
          avatarBg: "from-amber-500 to-orange-600",
          german: "Hallo! Ich bin Liam. Und wie heißt du?",
          english: "Hello! I am Liam. And what is your name?",
        },
        {
          speaker: "Elena",
          avatar: "E",
          avatarBg: "from-rose-500 to-pink-600",
          german: "Freut mich, Liam! Ich heiße Elena. Woher kommst du?",
          english: "Nice to meet you, Liam! My name is Elena. Where are you from?",
        },
        {
          speaker: "Liam",
          avatar: "L",
          avatarBg: "from-amber-500 to-orange-600",
          german: "Ich komme aus Irland, aber ich wohne jetzt hier in Frankfurt. Und du?",
          english: "I come from Ireland, but I live here in Frankfurt now. And you?",
        },
        {
          speaker: "Elena",
          avatar: "E",
          avatarBg: "from-rose-500 to-pink-600",
          german: "Ich komme aus Italien. Ich spreche Italienisch, Englisch und ein bisschen Deutsch.",
          english: "I come from Italy. I speak Italian, English, and a little German.",
        },
      ],
    },
    culture: {
      title: "The DACH Concept & Country Genders",
      location: "Germany, Austria, Switzerland",
      flag: "🇩🇪 🇦🇹 🇨🇭",
      content: "The German-speaking sphere is known as 'DACH': D (Deutschland), A (Österreich - Austria), CH (Confoederatio Helvetica - Switzerland). Most countries in German have no grammatical article (Deutschland, Österreich, Frankreich), but a few notable exceptions have articles: 'die Schweiz' (Switzerland), 'die Türkei' (Turkey), and 'die USA' (plural).",
      proTip: "When asked 'Woher kommen Sie?', respond: 'Ich komme aus...' followed by your country. If from Switzerland: 'Ich komme aus DER Schweiz'!",
    },
    keyTakeaways: [
      "Use 'Ich heiße...' or 'Ich bin...' to state your name.",
      "Say 'Ich komme aus [Country]' for your origin and 'Ich wohne in [City]' for your residence.",
      "Verbs in statements always take the SECOND position in the sentence.",
      "Say 'ein bisschen' (a little bit) when describing your current German skill.",
    ],
  },

  "a1-u1-l3": {
    id: "a1-u1-l3",
    unitId: "a1-u1",
    levelCode: "a1",
    orderIndex: 3,
    slug: "a1-u1-l3-artikel-der-die-das",
    title: "Articles & Gender: Der, Die, Das",
    titleDe: "Die Artikel: Der, Die, Das",
    type: "grammar",
    estMinutes: 18,
    xpReward: 35,
    summary: "Crack the secret code of German gender. Every German noun is masculine (der), feminine (die), or neuter (das). Learn the high-yield ending patterns to predict noun genders accurately.",
    vocabulary: [
      {
        id: "v15",
        german: "Bahnhof",
        english: "train station",
        article: "der",
        plural: "die Bahnhöfe",
        ipa: "/ˈbaːnˌhoːf/",
        partOfSpeech: "noun",
        exampleDe: "Der Bahnhof ist sehr groß und modern.",
        exampleEn: "The train station is very big and modern.",
        grammarNote: "Masculine noun (der). Compound: die Bahn (train) + der Hof (yard) -> der Bahnhof.",
      },
      {
        id: "v16",
        german: "Straße",
        english: "street",
        article: "die",
        plural: "die Straßen",
        ipa: "/ˈʃtʁaːsə/",
        partOfSpeech: "noun",
        exampleDe: "Die Straße heißt Friedrichstraße.",
        exampleEn: "The street is called Friedrichstrasse.",
        grammarNote: "Feminine noun (die). ~90% of inanimate nouns ending in '-e' are feminine.",
      },
      {
        id: "v17",
        german: "Rathaus",
        english: "town hall",
        article: "das",
        plural: "die Rathäuser",
        ipa: "/ˈʁaːtˌhaʊs/",
        partOfSpeech: "noun",
        exampleDe: "Das Rathaus steht am Marktplatz.",
        exampleEn: "The town hall stands on the market square.",
        grammarNote: "Neuter noun (das). Compound ending in 'das Haus' -> das Rathaus.",
      },
      {
        id: "v18",
        german: "Kaffee",
        english: "coffee",
        article: "der",
        plural: "die Kaffees",
        ipa: "/ˈkafe/",
        partOfSpeech: "noun",
        exampleDe: "Der Kaffee schmeckt hervorragend.",
        exampleEn: "The coffee tastes superb.",
        grammarNote: "Masculine noun (der Kaffee). Most alcoholic and caffeinated beverages are masculine (der Tee, der Wein, der Saft; exception: das Bier!).",
      },
      {
        id: "v19",
        german: "Wasser",
        english: "water",
        article: "das",
        plural: "die Wässer",
        ipa: "/ˈvasɐ/",
        partOfSpeech: "noun",
        exampleDe: "Das Wasser mit Kohlensäure, bitte.",
        exampleEn: "The sparkling water, please.",
        grammarNote: "Neuter noun (das Wasser).",
      },
      {
        id: "v20",
        german: "Zeitung",
        english: "newspaper",
        article: "die",
        plural: "die Zeitungen",
        ipa: "/ˈtsaɪ̯tʊŋ/",
        partOfSpeech: "noun",
        exampleDe: "Die Zeitung liegt auf dem Tisch.",
        exampleEn: "The newspaper is lying on the table.",
        grammarNote: "Feminine noun (die). 100% rule: ALL nouns ending in '-ung' are feminine (die).",
      },
    ],
    grammar: {
      title: "The Gender Matrix: Colour-Coded Articles",
      explanation: "In German, nouns have grammatical gender, NOT biological gender! A table is masculine ('der Tisch'), a door is feminine ('die Tür'), and a window is neuter ('das Fenster'). The easiest way to learn German nouns is ALWAYS with their definite article and color coding.",
      ruleHighlight: "Compound Noun Law: In compound words, the LAST word always determines the grammatical gender: die Bahn + DER Hof = DER Bahnhof!",
      tables: [
        {
          caption: "High-Yield Gender Endings Cheat Sheet",
          headers: ["Gender", "Article", "Color Code", "Reliable Endings & Patterns"],
          rows: [
            ["Masculine", "der", "Blue", "-ling, -or, -ist, -ismus, days/months/seasons (der Montag, der Sommer)"],
            ["Feminine", "die", "Rose / Pink", "-ung, -heit, -keit, -schaft, -tät, -ion, ~90% of words ending in -e"],
            ["Neuter", "das", "Green", "-chen, -lein (diminutives), -ment, -um, infinitives used as nouns (das Essen)"],
          ],
        },
      ],
      examples: [
        {
          de: "Die Wohnung (die), die Freiheit (die), die Universität (die).",
          en: "The apartment, the freedom, the university.",
          breakdown: "All take 'die' because of suffixes -ung, -heit, -tät.",
        },
        {
          de: "Das Mädchen (das), das Dokument (das), das Museum (das).",
          en: "The girl, the document, the museum.",
          breakdown: "All take 'das' because of suffixes -chen, -ment, -um.",
        },
      ],
    },
    dialogue: {
      title: "Orientierung in Wien",
      context: "A tourist asks a local resident for directions near St. Stephen's Cathedral in Vienna.",
      lines: [
        {
          speaker: "Tourist",
          avatar: "T",
          avatarBg: "from-cyan-600 to-blue-600",
          german: "Entschuldigung! Wo ist hier der nächste Bahnhof?",
          english: "Excuse me! Where is the nearest train station around here?",
        },
        {
          speaker: "Wienerin",
          avatar: "W",
          avatarBg: "from-purple-600 to-pink-600",
          german: "Gehen Sie diese Straße geradeaus. Das Rathaus ist links, und der Bahnhof ist direkt dahinter.",
          english: "Go straight down this street. The town hall is on the left, and the station is right behind it.",
        },
        {
          speaker: "Tourist",
          avatar: "T",
          avatarBg: "from-cyan-600 to-blue-600",
          german: "Vielen Dank! Ist die Straße sehr lang?",
          english: "Thank you very much! Is the street very long?",
        },
        {
          speaker: "Wienerin",
          avatar: "W",
          avatarBg: "from-purple-600 to-pink-600",
          german: "Nein, nur fünf Minuten zu Fuß. Bitteschön!",
          english: "No, only five minutes on foot. You're welcome!",
        },
      ],
    },
    culture: {
      title: "Why Germans Capitalize Every Noun",
      location: "DACH Region",
      flag: "🇩🇪 🇦🇹 🇨🇭",
      content: "German is the only major modern language that capitalizes EVERY single noun (Substantiv), whether proper or common: 'das Haus', 'der Hund', 'die Zeit'. This historic spelling rule makes it exceptionally easy to spot nouns while reading German texts!",
      proTip: "Never memorize a German noun in isolation! Always learn the article + noun + plural as a single phonetic unit: 'der Bahnhof, die Bahnhöfe'.",
    },
    keyTakeaways: [
      "Always learn nouns with their article: der (blue), die (pink), das (green).",
      "Nouns ending in -ung, -heit, -keit, -schaft, -tät are 100% feminine (die).",
      "Diminutives ending in -chen or -lein are 100% neuter (das).",
      "Every single German noun is capitalized in written text.",
    ],
  },

  "a1-u1-l4": {
    id: "a1-u1-l4",
    unitId: "a1-u1",
    levelCode: "a1",
    orderIndex: 4,
    slug: "a1-u1-l4-im-cafe",
    title: "At the Café: Ordering & Numbers",
    titleDe: "Im Café: Bestellen & Zahlen 1–10",
    type: "dialogue",
    estMinutes: 15,
    xpReward: 30,
    summary: "Order coffee, pastries, and water like a local. Master numbers 1 to 10, polite ordering structures (ich hätte gerne...), and the classic German billing ritual: 'Zusammen oder getrennt?'.",
    vocabulary: [
      {
        id: "v21",
        german: "bestellen",
        english: "to order",
        partOfSpeech: "verb",
        exampleDe: "Wir möchten gerne bestellen.",
        exampleEn: "We would like to order.",
        grammarNote: "Regular verb: ich bestelle, du bestellst, wir bestellen.",
      },
      {
        id: "v22",
        german: "die Rechnung",
        english: "the bill / check",
        article: "die",
        plural: "die Rechnungen",
        partOfSpeech: "noun",
        exampleDe: "Die Rechnung, bitte!",
        exampleEn: "The bill, please!",
        grammarNote: "Feminine noun (-ung ending).",
      },
      {
        id: "v23",
        german: "zahlen",
        english: "to pay",
        partOfSpeech: "verb",
        exampleDe: "Ich möchte zahlen.",
        exampleEn: "I would like to pay.",
        grammarNote: "Don't confuse with 'zählen' (to count)!",
      },
      {
        id: "v24",
        german: "zusammen",
        english: "together (single bill)",
        partOfSpeech: "adverb",
        exampleDe: "Zusammen oder getrennt? - Zusammen, bitte.",
        exampleEn: "Together or split? - Together, please.",
        grammarNote: "Opposite of 'getrennt' (split).",
      },
      {
        id: "v25",
        german: "getrennt",
        english: "separately / split",
        partOfSpeech: "adverb",
        exampleDe: "Wir zahlen getrennt.",
        exampleEn: "We are paying separately.",
        grammarNote: "Standard practice in Germany; the waiter will calculate each person's exact items on the spot.",
      },
      {
        id: "v26",
        german: "lecker",
        english: "delicious / tasty",
        partOfSpeech: "adjective",
        exampleDe: "Der Kuchen ist sehr lecker!",
        exampleEn: "The cake is very delicious!",
        grammarNote: "In Austria and Switzerland, people often use 'fein' or 'köstlich'.",
      },
    ],
    grammar: {
      title: "Polite Requests: 'Ich möchte...' vs. 'Ich hätte gerne...'",
      explanation: "In German cafes and bakeries, avoid saying 'Ich will' (I want), which sounds demanding. Instead, use the polite Konjunktiv II form 'Ich hätte gerne...' (I would like to have) or 'Ich möchte...' (I would like).",
      ruleHighlight: "Numbers 1 to 10 in German: eins, zwei, drei, vier, fünf, sechs, sieben, acht, neun, zehn.",
      tables: [
        {
          caption: "Numbers 1 to 10 Pronunciation & Spelling",
          headers: ["Number", "German", "IPA", "English"],
          rows: [
            ["1", "eins", "/aɪ̯ns/", "one"],
            ["2", "zwei", "/tsvaɪ̯/", "two"],
            ["3", "drei", "/dʁaɪ̯/", "three"],
            ["4", "vier", "/fiːɐ̯/", "four"],
            ["5", "fünf", "/fʏnf/", "five"],
            ["6", "sechs", "/zɛks/", "six"],
            ["7", "sieben", "/ˈziːbn̩/", "seven"],
            ["8", "acht", "/axt/", "eight"],
            ["9", "neun", "/nɔɪ̯n/", "nine"],
            ["10", "zehn", "/tseːn/", "ten"],
          ],
        },
      ],
      examples: [
        {
          de: "Ich hätte gerne einen Kaffee und zwei Croissants.",
          en: "I would like to have one coffee and two croissants.",
          breakdown: "'Kaffee' is masculine in accusative -> 'einen Kaffee'.",
        },
        {
          de: "Stimmt so!",
          en: "Keep the change! (Literally: It is right as it is)",
          breakdown: "Used when handing money with the tip included.",
        },
      ],
    },
    dialogue: {
      title: "Im Café Einstein in Berlin",
      context: "Sophie and David order breakfast and pay the bill at a classic café.",
      lines: [
        {
          speaker: "Kellner",
          avatar: "K",
          avatarBg: "from-amber-700 to-amber-900",
          german: "Guten Tag! Was darf es sein?",
          english: "Good day! What may it be for you?",
        },
        {
          speaker: "Sophie",
          avatar: "S",
          avatarBg: "from-pink-600 to-rose-600",
          german: "Ich hätte gerne einen Cappuccino und ein Stück Käsekuchen, bitte.",
          english: "I would like a cappuccino and a piece of cheesecake, please.",
        },
        {
          speaker: "David",
          avatar: "D",
          avatarBg: "from-blue-600 to-cyan-600",
          german: "Für mich bitte einen schwarzen Kaffee und ein Mineralwasser mit Gas.",
          english: "For me please a black coffee and a sparkling mineral water.",
        },
        {
          speaker: "Kellner",
          avatar: "K",
          avatarBg: "from-amber-700 to-amber-900",
          german: "Sehr gerne, kommt sofort! ... Später: Zahlen Sie zusammen oder getrennt?",
          english: "Very gladly, coming right up! ... Later: Are you paying together or split?",
        },
        {
          speaker: "Sophie",
          avatar: "S",
          avatarBg: "from-pink-600 to-rose-600",
          german: "Zusammen, bitte. Machen Sie 15 Euro! (Stimmt so).",
          english: "Together, please. Make it 15 euros! (Keep the change).",
        },
      ],
    },
    culture: {
      title: "The Tipping Etiquette & Cash vs. Card in Germany",
      location: "Cafes & Restaurants in DACH",
      flag: "🇩🇪 🇦🇹 🇨🇭",
      content: "In Germany, service is already included by law in the bill, but tipping ('Trinkgeld' — literally: drink money) of 5% to 10% is customary for good service. You never leave coins on the table when departing; instead, you state the rounded total when handing cash to the server: e.g. for a €13.20 bill, hand a €20 note and say '15 Euro, bitte'.",
      proTip: "While card acceptance has grown since 2020, many smaller bakeries, cafes, and beer gardens in Germany still operate under 'Nur Barzahlung' (Cash only). Always carry €20–€30 in cash!",
    },
    keyTakeaways: [
      "Use 'Ich hätte gerne...' (I would like to have) to order food and drinks politely.",
      "Water in Germany is carbonated by default ('mit Kohlensäure'); ask for 'stilles Wasser' if you want non-sparkling.",
      "Expect the question: 'Zusammen oder getrennt?' (Together or separate?).",
      "Round up the bill by 5–10% and tell the waiter the final total directly.",
    ],
  },
};

/* ─── Helper Functions & Local Storage Progress Sync ─────────────────────── */

export function getLevel(levelCode: string): LevelItem | undefined {
  return CEFR_LEVELS.find((l) => l.code.toLowerCase() === levelCode.toLowerCase());
}

export function getUnitsForLevel(levelCode: string): UnitItem[] {
  if (levelCode.toLowerCase() === "a1") return A1_UNITS;
  // Fallback for other levels
  return [
    {
      id: `${levelCode}-u1`,
      levelCode: levelCode as any,
      orderIndex: 1,
      slug: `${levelCode}-u1-intro`,
      title: `Unit 1: ${levelCode.toUpperCase()} Core Proficiency`,
      titleDe: `Einheit 1: ${levelCode.toUpperCase()} Kernkompetenz`,
      description: `Structured curriculum units for CEFR ${levelCode.toUpperCase()}.`,
      iconName: "BookOpen",
      totalLessons: 6,
      lessons: [
        { id: `${levelCode}-u1-l1`, orderIndex: 1, slug: `${levelCode}-u1-l1`, title: "Core Terminology", titleDe: "Grundlagen", type: "vocabulary", estMinutes: 15, xpReward: 30 },
        { id: `${levelCode}-u1-l2`, orderIndex: 2, slug: `${levelCode}-u1-l2`, title: "Grammar Deep-Dive", titleDe: "Grammatik-Vertiefung", type: "grammar", estMinutes: 20, xpReward: 35 },
      ],
    },
  ];
}

export function getLesson(lessonId: string): LessonContent | undefined {
  return LESSONS_DATABASE[lessonId];
}

export function getNextLesson(lessonId: string): { id: string; title: string } | null {
  const current = LESSONS_DATABASE[lessonId];
  if (!current) return null;

  const currentUnit = A1_UNITS.find((u) => u.id === current.unitId);
  if (!currentUnit) return null;

  const currentIndex = currentUnit.lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex >= 0 && currentIndex < currentUnit.lessons.length - 1) {
    const next = currentUnit.lessons[currentIndex + 1];
    return { id: next.id, title: next.title };
  }

  return null;
}

export function getPreviousLesson(lessonId: string): { id: string; title: string } | null {
  const current = LESSONS_DATABASE[lessonId];
  if (!current) return null;

  const currentUnit = A1_UNITS.find((u) => u.id === current.unitId);
  if (!currentUnit) return null;

  const currentIndex = currentUnit.lessons.findIndex((l) => l.id === lessonId);
  if (currentIndex > 0) {
    const prev = currentUnit.lessons[currentIndex - 1];
    return { id: prev.id, title: prev.title };
  }

  return null;
}

/* ─── Client Progress Persistence (localStorage + Supabase fallback) ─────── */

const PROGRESS_STORAGE_KEY = "deutschpfad_completed_lessons";
const BOOKMARKS_STORAGE_KEY = "deutschpfad_bookmarked_lessons";

export function getCompletedLessons(): string[] {
  if (typeof window === "undefined") return ["a1-u1-l1"]; // Default sample for SSR
  try {
    const saved = localStorage.getItem(PROGRESS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : ["a1-u1-l1"];
  } catch {
    return ["a1-u1-l1"];
  }
}

export function isLessonCompleted(lessonId: string): boolean {
  return getCompletedLessons().includes(lessonId);
}

export function markLessonAsCompleted(lessonId: string): string[] {
  if (typeof window === "undefined") return [lessonId];
  const list = getCompletedLessons();
  if (!list.includes(lessonId)) {
    const updated = [...list, lessonId];
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(updated));
    
    // Add XP to user profile in localStorage
    try {
      const userProfileStr = localStorage.getItem("deutschpfad_user_profile");
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr);
        userProfile.xp_points = (userProfile.xp_points || 0) + 30;
        localStorage.setItem("deutschpfad_user_profile", JSON.stringify(userProfile));
      }
    } catch {
      // Ignore
    }

    return updated;
  }
  return list;
}

export function getBookmarkedLessons(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function toggleLessonBookmark(lessonId: string): boolean {
  if (typeof window === "undefined") return false;
  const list = getBookmarkedLessons();
  const index = list.indexOf(lessonId);
  let updated: string[];
  let isNowBookmarked = false;

  if (index >= 0) {
    updated = list.filter((id) => id !== lessonId);
    isNowBookmarked = false;
  } else {
    updated = [...list, lessonId];
    isNowBookmarked = true;
  }

  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
  return isNowBookmarked;
}

export function isLessonBookmarked(lessonId: string): boolean {
  return getBookmarkedLessons().includes(lessonId);
}

export function calculateLevelCompletionPercentage(levelCode: string): number {
  const completed = getCompletedLessons();
  if (levelCode.toLowerCase() === "a1") {
    // Total A1 sample lessons across units
    const totalA1Lessons = 36;
    const completedInA1 = completed.filter((id) => id.startsWith("a1-")).length;
    // Base demonstration percentage
    return Math.min(100, Math.max(15, Math.round((completedInA1 / totalA1Lessons) * 100) + 12));
  }
  return 0;
}
