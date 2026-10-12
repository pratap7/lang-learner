import { createClient } from "@/lib/supabase/client";

export type SkillSection = "reading" | "listening" | "grammar" | "vocabulary" | "writing" | "speaking";
export type CefrBand = "A1" | "A2" | "B1" | "B2" | "C1";

export interface TestQuestionItem {
  id: string;
  level: CefrBand;
  section: SkillSection;
  topic: string;
  prompt: string;
  contextText?: string; // Reading passage or dialogue context
  audioText?: string;   // Text to be spoken natively via Web Speech API
  options: string[];
  correctAnswer: number; // 0-indexed option index
  explanation: string;
  points: number;
  writingRubric?: {
    taskPrompt: string;
    minWords: number;
    recommendedMinutes: number;
    criteria: string[];
  };
  speakingPrompt?: {
    taskPrompt: string;
    prepSeconds: number;
    targetPoints: string[];
  };
}

export interface TestAttemptRecord {
  id: string;
  testType: "placement" | "unit_quiz" | "mock_exam";
  title: string;
  level: string;
  unitId?: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  recommendedLevel?: CefrBand;
  durationSeconds: number;
  completedAt: string;
  sectionScores: {
    section: SkillSection;
    label: string;
    score: number;
    maxScore: number;
    percentage: number;
    timeSeconds: number;
  }[];
  answers: Record<string, {
    userAnswer: number | string;
    isCorrect: boolean;
    flagged?: boolean;
    timeSpentSeconds?: number;
  }>;
  weakTopics: {
    topic: string;
    section: SkillSection;
    missedCount: number;
    totalCount: number;
    advice: string;
  }[];
  questionReview: {
    id: string;
    level: CefrBand;
    section: SkillSection;
    topic: string;
    prompt: string;
    contextText?: string;
    options: string[];
    userAnswer: number | string;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
  }[];
}

const STORAGE_KEY = "deutschpfad_test_attempts_v1";

/* ─────────────────────────────────────────────────────────────────────────────
   ORIGINAL QUESTION BANK (A1 to C1)
───────────────────────────────────────────────────────────────────────────── */

export const ORIGINAL_PLACEMENT_POOL: TestQuestionItem[] = [
  // A1 Questions (Beginner)
  {
    id: "pl-a1-01",
    level: "A1",
    section: "grammar",
    topic: "Articles & Gender",
    prompt: "Welcher Artikel passt? '___ Tisch ist sehr groß und modern.'",
    options: ["Der", "Die", "Das", "Den"],
    correctAnswer: 0,
    explanation: "'Tisch' is a masculine noun in nominative case (subject of sentence), so it takes the definite article 'Der'.",
    points: 1,
  },
  {
    id: "pl-a1-02",
    level: "A1",
    section: "vocabulary",
    topic: "Introductions & Greetings",
    prompt: "Wie antwortet man höflich auf: 'Wie geht es Ihnen?'",
    options: ["Ich heiße Markus.", "Sehr gut, danke. Und Ihnen?", "Auf Wiedersehen!", "Ich komme aus Spanien."],
    correctAnswer: 1,
    explanation: "'Sehr gut, danke. Und Ihnen?' ('Very good, thank you. And you?') is the standard polite reply to 'Wie geht es Ihnen?'.",
    points: 1,
  },
  {
    id: "pl-a1-03",
    level: "A1",
    section: "grammar",
    topic: "Verb Conjugation",
    prompt: "Ergänze die passende Form: 'Wir ___ Deutsch am Goethe-Institut.'",
    options: ["lernt", "lerne", "lernen", "lernst"],
    correctAnswer: 2,
    explanation: "For the pronoun 'wir' (we), regular verbs end in '-en' -> 'lernen'.",
    points: 1,
  },
  {
    id: "pl-a1-04",
    level: "A1",
    section: "reading",
    topic: "Reading Notices",
    contextText: "Bäckerei Schmidt: Montag bis Freitag von 07:00 bis 18:00 geöffnet. Samstag von 07:00 bis 13:00. Sonntag geschlossen.",
    prompt: "Kann man am Sonntag um 10:00 Uhr Brot kaufen?",
    options: ["Ja, bis 13:00 Uhr.", "Nein, sonntags ist geschlossen.", "Ja, bis 18:00 Uhr.", "Nur mit Vorbestellung."],
    correctAnswer: 1,
    explanation: "The notice clearly states 'Sonntag geschlossen' (Sunday closed).",
    points: 1,
  },
  {
    id: "pl-a1-05",
    level: "A1",
    section: "grammar",
    topic: "Accusative Prepositions",
    prompt: "Welcher Satz ist grammatikalisch korrekt?",
    options: ["Ich kaufe das Buch für meinen Bruder.", "Ich kaufe das Buch für mein Bruder.", "Ich kaufe das Buch für meinem Bruder.", "Ich kaufe das Buch für meines Bruders."],
    correctAnswer: 0,
    explanation: "The preposition 'für' always requires the accusative case. Masculine singular in accusative is 'meinen Bruder'.",
    points: 1,
  },
  {
    id: "pl-a1-06",
    level: "A1",
    section: "vocabulary",
    topic: "Telling Time",
    prompt: "Wie sagt man umgangssprachlich '14:30 Uhr'?",
    options: ["Viertel nach zwei", "Halb drei", "Halb zwei", "Viertel vor drei"],
    correctAnswer: 1,
    explanation: "In German, 'halb drei' means half an hour before three o'clock (2:30 / 14:30).",
    points: 1,
  },

  // A2 Questions (Elementary)
  {
    id: "pl-a2-01",
    level: "A2",
    section: "grammar",
    topic: "Perfekt Tense",
    prompt: "Welches Hilfsverb ist richtig? 'Gestern ___ wir nach Berlin gefahren.'",
    options: ["haben", "sind", "waren", "werden"],
    correctAnswer: 1,
    explanation: "Verbs indicating a change of location (fahren, gehen, fliegen) form the Perfekt tense with 'sein' -> 'wir sind gefahren'.",
    points: 1,
  },
  {
    id: "pl-a2-02",
    level: "A2",
    section: "grammar",
    topic: "Modal Verbs in Past (Präteritum)",
    prompt: "Welche Form ist richtig? 'Als Kind ___ ich jeden Tag Fußball spielen.'",
    options: ["wollt", "wollte", "gewollt", "willte"],
    correctAnswer: 1,
    explanation: "The Präteritum first-person singular of 'wollen' is 'ich wollte'.",
    points: 1,
  },
  {
    id: "pl-a2-03",
    level: "A2",
    section: "grammar",
    topic: "Dative Verbs",
    prompt: "Ergänze das Pronomen: 'Kannst du ___ bitte helfen? Ich verstehe die Übung nicht.'",
    options: ["mich", "mir", "mein", "ich"],
    correctAnswer: 1,
    explanation: "The verb 'helfen' always takes a Dative object -> 'mir helfen'.",
    points: 1,
  },
  {
    id: "pl-a2-04",
    level: "A2",
    section: "reading",
    topic: "Travel Schedule",
    contextText: "Durchsage: ICE 574 nach Hamburg Hauptbahnhof hat heute circa 20 Minuten Verspätung. Grund dafür ist eine Stellwerkstörung bei Kassel.",
    prompt: "Warum kommt der Zug später an?",
    options: ["Wegen schlechtem Wetter.", "Wegen eines technischen Problems bei Kassel.", "Wegen eines Streiks.", "Der Zug fällt komplett aus."],
    correctAnswer: 1,
    explanation: "'Stellwerkstörung' refers to a technical signal-box malfunction near Kassel.",
    points: 1,
  },
  {
    id: "pl-a2-05",
    level: "A2",
    section: "grammar",
    topic: "Subordinating Conjunctions (weil)",
    prompt: "Welcher Satz hat die richtige Wortstellung?",
    options: [
      "Ich bleibe zu Hause, weil ich bin krank.",
      "Ich bleibe zu Hause, weil ich krank bin.",
      "Ich bleibe zu Hause, weil bin ich krank.",
      "Weil ich bin krank, ich bleibe zu Hause."
    ],
    correctAnswer: 1,
    explanation: "The conjunction 'weil' kicks the conjugated verb to the very end of the subordinate clause: '... weil ich krank bin.'",
    points: 1,
  },
  {
    id: "pl-a2-06",
    level: "A2",
    section: "vocabulary",
    topic: "Daily Routine & Household",
    prompt: "Was bedeutet das Verb 'aufräumen'?",
    options: ["Die Wohnung sauber machen und Dinge an ihren Platz stellen", "Ein leckeres Abendessen kochen", "Geld bei der Bank abheben", "Ein Auto reparieren"],
    correctAnswer: 0,
    explanation: "'Aufräumen' means to tidy up or put things away in their proper place.",
    points: 1,
  },

  // B1 Questions (Intermediate)
  {
    id: "pl-b1-01",
    level: "B1",
    section: "grammar",
    topic: "Konjunktiv II (Polite requests & wishes)",
    prompt: "Welche Form drückt einen höflichen Wunsch aus? 'Wenn ich mehr Freizeit hätte, ___ ich gerne Klavier lernen.'",
    options: ["werde", "würde", "wurde", "wäre"],
    correctAnswer: 1,
    explanation: "Hypothetical wishes in present tense use 'würde' + Infinitiv ('würde ich lernen') or the Konjunktiv II form.",
    points: 1,
  },
  {
    id: "pl-b1-02",
    level: "B1",
    section: "grammar",
    topic: "Relative Clauses",
    prompt: "Ergänze das Relativpronomen: 'Das ist die Kollegin, mit ___ ich gestern telefoniert habe.'",
    options: ["der", "die", "den", "dessen"],
    correctAnswer: 0,
    explanation: "'Kollegin' is feminine. After the dative preposition 'mit', feminine relative pronoun is 'der'.",
    points: 1,
  },
  {
    id: "pl-b1-03",
    level: "B1",
    section: "grammar",
    topic: "Passiv (Vorgangspassiv)",
    prompt: "Wie lautet der Satz im Passiv Präsens? 'Die Handwerker renovieren das Büro.'",
    options: [
      "Das Büro wird von den Handwerkern renoviert.",
      "Das Büro wurde von den Handwerkern renoviert.",
      "Das Büro ist renoviert worden.",
      "Das Büro wird die Handwerker renovieren."
    ],
    correctAnswer: 0,
    explanation: "Passive present tense formula: 'werden' (Präsens) + Partizip II ('wird renoviert') with 'von' + Dativ agent.",
    points: 1,
  },
  {
    id: "pl-b1-04",
    level: "B1",
    section: "vocabulary",
    topic: "Connectors & Argumentation",
    prompt: "Welche Konjunktion passt? 'Er hat die Prüfung bestanden, ___ er fast gar nicht gelernt hatte.'",
    options: ["obwohl", "deshalb", "damit", "sodass"],
    correctAnswer: 0,
    explanation: "'Obwohl' (although / even though) introduces a concessive clause expressing unexpected contrast.",
    points: 1,
  },
  {
    id: "pl-b1-05",
    level: "B1",
    section: "reading",
    topic: "Workplace Email",
    contextText: "Liebes Team, aus aktuellem Anlass möchten wir daran erinnern, dass Dienstreisen ab sofort mindestens zwei Wochen im Voraus über das interne Portal eingereicht und von der Teamleitung freigegeben werden müssen.",
    prompt: "Was ist neu bezüglich der Dienstreisen?",
    options: [
      "Dienstreisen sind komplett verboten.",
      "Reisen müssen mindestens zwei Wochen vorher digital beantragt werden.",
      "Man darf nur noch mit der Bahn reisen.",
      "Die Teamleitung übernimmt alle Reisebuchungen."
    ],
    correctAnswer: 1,
    explanation: "The message mandates submitting business trips at least two weeks ahead via the internal portal.",
    points: 1,
  },
  {
    id: "pl-b1-06",
    level: "B1",
    section: "grammar",
    topic: "Infinitiv mit 'zu'",
    prompt: "In welchem Satz ist die 'um ... zu' Konstruktion korrekt verwendet?",
    options: [
      "Er geht zur Sprachschule, um Deutsch zu lernen.",
      "Er geht zur Sprachschule, um lernt Deutsch.",
      "Er geht zur Sprachschule, damit zu lernen Deutsch.",
      "Er geht zur Sprachschule, um Deutsch lernen."
    ],
    correctAnswer: 0,
    explanation: "'Um ... zu + Infinitiv' expresses purpose when the subject in both clauses is identical: 'um Deutsch zu lernen'.",
    points: 1,
  },

  // B2 Questions (Upper Intermediate)
  {
    id: "pl-b2-01",
    level: "B2",
    section: "grammar",
    topic: "Partizipialattribute",
    prompt: "Wie lässt sich der Relativsatz verkürzen? 'Die Maßnahmen, die gestern beschlossen wurden, treten ab morgen in Kraft.'",
    options: [
      "Die gestern beschlossenen Maßnahmen treten ab morgen in Kraft.",
      "Die gestern beschließende Maßnahmen treten ab morgen in Kraft.",
      "Die gestern beschließen Maßnahmen treten ab morgen in Kraft.",
      "Die Maßnahmen gestern beschlossen treten ab morgen in Kraft."
    ],
    correctAnswer: 0,
    explanation: "Past passive relative clauses transform into extended participle I/II attributes: 'Die gestern beschlossenen Maßnahmen'.",
    points: 1,
  },
  {
    id: "pl-b2-02",
    level: "B2",
    section: "grammar",
    topic: "Feste Nomen-Verb-Verbindungen",
    prompt: "Welche Nomen-Verb-Verbindung bedeutet 'entscheiden'?",
    options: [
      "Eine Entscheidung treffen",
      "Eine Entscheidung machen",
      "Eine Entscheidung bringen",
      "Eine Entscheidung ziehen"
    ],
    correctAnswer: 0,
    explanation: "The idiomatic functional verb structure is 'eine Entscheidung treffen'.",
    points: 1,
  },
  {
    id: "pl-b2-03",
    level: "B2",
    section: "grammar",
    topic: "Zweiteilige Konnektoren",
    prompt: "Ergänze das Konnektoren-Paar: 'Die neue Software ist ___ extrem benutzerfreundlich, ___ auch sehr kostengünstig.'",
    options: ["weder ... noch", "nicht nur ... sondern", "entweder ... oder", "zwar ... aber"],
    correctAnswer: 1,
    explanation: "'Nicht nur ..., sondern auch' combines two positive reinforcing aspects (user-friendly AND cost-effective).",
    points: 1,
  },
  {
    id: "pl-b2-04",
    level: "B2",
    section: "vocabulary",
    topic: "Advanced Synonyms & Register",
    prompt: "Was bedeutet das gehobene Verb 'gewährleisten' im beruflichen Kontext?",
    options: ["garantieren / sicherstellen", "ablehnen", "verzögern", "untersuchen"],
    correctAnswer: 0,
    explanation: "'Gewährleisten' means to ensure, guarantee, or safeguard a standard or outcome.",
    points: 1,
  },
  {
    id: "pl-b2-05",
    level: "B2",
    section: "grammar",
    topic: "Konjunktiv I (Indirekte Rede)",
    prompt: "Welche Form steht im Konjunktiv I? 'Die Sprecherin teilte mit, das Unternehmen ___ im laufenden Geschäftsjahr schwarze Zahlen schreiben.'",
    options: ["werde", "wird", "würde", "sei"],
    correctAnswer: 0,
    explanation: "In journalistic reported speech (indirekte Rede), third-person singular future uses Konjunktiv I: 'werde schreiben'.",
    points: 1,
  },
  {
    id: "pl-b2-06",
    level: "B2",
    section: "reading",
    topic: "Scientific / Economic Commentary",
    contextText: "Die fortschreitende Digitalisierung birgt zweifelsohne mannigfaltige Chancen, setzt jedoch zugleich eine grundlegende Transformation herkömmlicher Betriebsabläufe voraus, der sich viele mittelständische Betriebe noch nicht gewachsen sehen.",
    prompt: "Welche Grundaussage trifft der Text?",
    options: [
      "Digitalisierung hat ausschließlich negative Konsequenzen.",
      "Der Mittelstand beherrscht die digitale Transformation bereits fehlerfrei.",
      "Digitalisierung bietet Vorteile, erfordert aber Umstrukturierungen, die viele Betriebe überfordern.",
      "Betriebsabläufe sollten keinesfalls modernisiert werden."
    ],
    correctAnswer: 2,
    explanation: "The text highlights dual realities: valuable opportunities ('mannigfaltige Chancen') coupled with taxing organizational demands.",
    points: 1,
  },

  // C1 Questions (Advanced)
  {
    id: "pl-c1-01",
    level: "C1",
    section: "grammar",
    topic: "Nominalstil & Präpositionen mit Genitiv",
    prompt: "Ergänze die passende Genitiv-Präposition: '___ unvorhergesehener Verzögerungen in der Lieferkette konnte der Terminplan eingehalten werden.'",
    options: ["Ungeachtet", "Infolge", "Anlässlich", "Hinsichtlich"],
    correctAnswer: 0,
    explanation: "'Ungeachtet' (+ Genitiv) means 'notwithstanding / despite' and conveys that despite the delays, the deadline was met.",
    points: 1,
  },
  {
    id: "pl-c1-02",
    level: "C1",
    section: "grammar",
    topic: "Passiversatzformen (sein + zu + Infinitiv)",
    prompt: "Was drückt der Satz 'Die Richtlinien sind unverzüglich umzusetzen.' aus?",
    options: [
      "Die Richtlinien müssen unverzüglich umgesetzt werden.",
      "Die Richtlinien können eventuell umgesetzt werden.",
      "Die Richtlinien dürfen nicht umgesetzt werden.",
      "Die Richtlinien wurden bereits umgesetzt."
    ],
    correctAnswer: 0,
    explanation: "The passive alternative 'sein + zu + Infinitiv' expresses strict necessity / obligation (müssen + Passiv).",
    points: 1,
  },
  {
    id: "pl-c1-03",
    level: "C1",
    section: "vocabulary",
    topic: "Nuanced Idioms & Rhetoric",
    prompt: "Was bedeutet die Redewendung 'Den Nagel auf den Kopf treffen'?",
    options: [
      "Einen handwerklichen Fehler begehen",
      "Eine Sache exakt und treffend auf den Punkt bringen",
      "Sich in Gefahr begeben",
      "Einen Streit absichtlich eskalieren"
    ],
    correctAnswer: 1,
    explanation: "'Den Nagel auf den Kopf treffen' means to describe or identify a problem exactly and accurately (hit the nail on the head).",
    points: 1,
  },
  {
    id: "pl-c1-04",
    level: "C1",
    section: "grammar",
    topic: "Subjektlose Passivkonstruktionen",
    prompt: "Welcher Satz ist grammatikalisch einwandfrei formuliert?",
    options: [
      "Es wurde gestern bis spät in die Nacht über das Vorhaben debattiert.",
      "Wurde gestern bis spät in die Nacht über das Vorhaben debattiert worden.",
      "Es hat gestern bis spät in die Nacht über das Vorhaben debattiert.",
      "Gestern wurde es bis spät in die Nacht über das Vorhaben debattiert."
    ],
    correctAnswer: 0,
    explanation: "In an impersonal passive with 'Es' occupying the Vorfeld position: 'Es wurde gestern ... debattiert.'",
    points: 1,
  },
  {
    id: "pl-c1-05",
    level: "C1",
    section: "reading",
    topic: "Philosophical / Stylistic Text Analysis",
    contextText: "Die vermeintliche Alternativlosigkeit gegenwärtiger technologischer Pfadabhängigkeiten erweist sich bei näherer Betrachtung als Resultat diskursiver Verengungen, welche gesellschaftliche Gestaltungskraft sukzessive erlahmen lassen.",
    prompt: "Welcher Vorwurf wird in der Passage formuliert?",
    options: [
      "Technologie löst jedes gesellschaftliche Problem automatisch.",
      "Der gesellschaftliche Diskurs engt Denkspielräume ein und lähmt dadurch aktive Mitgestaltung.",
      "Pfadabhängigkeiten sind in Demokratien unmöglich.",
      "Technologische Entwicklungen sollten gänzlich gestoppt werden."
    ],
    correctAnswer: 1,
    explanation: "The passage critiques 'diskursiver Verengungen' that narrow the spectrum of alternatives and paralyze collective civic agency.",
    points: 1,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   UNIT QUIZZES (10 Questions each, 70% Pass Mark)
───────────────────────────────────────────────────────────────────────────── */

export interface UnitQuizDefinition {
  id: string;
  unitId: string;
  levelCode: string;
  title: string;
  titleDe: string;
  description: string;
  questions: TestQuestionItem[];
}

export const UNIT_QUIZZES: UnitQuizDefinition[] = [
  {
    id: "quiz-a1-u1",
    unitId: "a1-u1",
    levelCode: "A1",
    title: "Unit 1: Greetings & Basics Quiz",
    titleDe: "Einheit 1: Begrüßung & Grundlagen Quiz",
    description: "10 essential questions testing polite German greetings, introductions, and present tense verb forms. Pass mark: 70%.",
    questions: [
      {
        id: "q-u1-1",
        level: "A1",
        section: "grammar",
        topic: "Personal Pronouns",
        prompt: "Ergänze: 'Guten Tag, wie heißen ___?'",
        options: ["Sie", "ihr", "du", "er"],
        correctAnswer: 0,
        explanation: "In polite formal address with capitalized verb form 'heißen', the pronoun is 'Sie'.",
        points: 1,
      },
      {
        id: "q-u1-2",
        level: "A1",
        section: "vocabulary",
        topic: "Farewells",
        prompt: "Welcher Abschiedsgruß ist formell?",
        options: ["Tschüss!", "Bis bald!", "Auf Wiedersehen!", "Ciao!"],
        correctAnswer: 2,
        explanation: "'Auf Wiedersehen' is the standard polite, formal farewell in German.",
        points: 1,
      },
      {
        id: "q-u1-3",
        level: "A1",
        section: "grammar",
        topic: "Verb Conjugation (sein)",
        prompt: "Ergänze die richtige Form: 'Ich ___ Student an der Universität.'",
        options: ["bist", "bin", "ist", "sind"],
        correctAnswer: 1,
        explanation: "First person singular of 'sein' is 'ich bin'.",
        points: 1,
      },
      {
        id: "q-u1-4",
        level: "A1",
        section: "vocabulary",
        topic: "Countries & Origins",
        prompt: "Welche Präposition passt? 'Ich komme ___ Deutschland.'",
        options: ["aus", "von", "in", "nach"],
        correctAnswer: 0,
        explanation: "Origin from a country or town uses 'aus': 'kommen aus Deutschland'.",
        points: 1,
      },
      {
        id: "q-u1-5",
        level: "A1",
        section: "grammar",
        topic: "Question Words (W-Fragen)",
        prompt: "Welches Fragewort fragt nach einem Ort? '___ wohnst du?'",
        options: ["Wer", "Wo", "Wie", "Was"],
        correctAnswer: 1,
        explanation: "'Wo' means 'Where' and asks about a stationary location.",
        points: 1,
      },
      {
        id: "q-u1-6",
        level: "A1",
        section: "grammar",
        topic: "Verb Conjugation (wohnen)",
        prompt: "Welche Endung hat 'du' im Präsens? 'Wo wohn___ du?'",
        options: ["-e", "-st", "-t", "-en"],
        correctAnswer: 1,
        explanation: "Second person singular regular ending is '-st': 'du wohnst'.",
        points: 1,
      },
      {
        id: "q-u1-7",
        level: "A1",
        section: "vocabulary",
        topic: "Courtesy Phrases",
        prompt: "Jemand sagt 'Vielen Dank!'. Wie antwortest du höflich?",
        options: ["Guten Morgen!", "Bitte sehr / Gern geschehen!", "Auf Wiederhören!", "Keine Ahnung."],
        correctAnswer: 1,
        explanation: "'Gern geschehen' or 'Bitte sehr' means 'You are very welcome!'.",
        points: 1,
      },
      {
        id: "q-u1-8",
        level: "A1",
        section: "grammar",
        topic: "Yes/No Questions (Ja/Nein-Fragen)",
        prompt: "Wie beginnt eine Ja/Nein-Frage im Deutschen?",
        options: [
          "Mit dem konjugierten Verb an Position 1",
          "Mit dem Fragewort (W-Wort)",
          "Mit dem Subjekt",
          "Mit dem Artikel"
        ],
        correctAnswer: 0,
        explanation: "In German Ja/Nein-Fragen, the conjugated verb occupies Position 1 (e.g. 'Lernst du Deutsch?').",
        points: 1,
      },
      {
        id: "q-u1-9",
        level: "A1",
        section: "reading",
        topic: "Short Profile",
        contextText: "Hallo! Mein Name ist Lukas Meyer. Ich bin 28 Jahre alt, komme aus Wien und wohne seit zwei Jahren in Berlin.",
        prompt: "Woher kommt Lukas?",
        options: ["Aus Berlin", "Aus Wien", "Aus Zürich", "Aus München"],
        correctAnswer: 1,
        explanation: "Lukas states: 'komme aus Wien' (origin: Vienna).",
        points: 1,
      },
      {
        id: "q-u1-10",
        level: "A1",
        section: "vocabulary",
        topic: "Numbers 1-10",
        prompt: "Wie schreibt man die Zahl 7 auf Deutsch?",
        options: ["sechs", "acht", "sieben", "zehn"],
        correctAnswer: 2,
        explanation: "The number 7 is 'sieben'.",
        points: 1,
      },
    ],
  },
  {
    id: "quiz-a1-u2",
    unitId: "a1-u2",
    levelCode: "A1",
    title: "Unit 2: Family & Daily Life Quiz",
    titleDe: "Einheit 2: Familie & Alltag Quiz",
    description: "10 questions on family members, possessive pronouns (mein/dein), and definite articles. Pass mark: 70%.",
    questions: [
      {
        id: "q-u2-1",
        level: "A1",
        section: "vocabulary",
        topic: "Family Members",
        prompt: "Die Schwester meiner Mutter ist meine ___.",
        options: ["Tante", "Oma", "Kusine", "Tochter"],
        correctAnswer: 0,
        explanation: "The sister of one's mother is an aunt ('Tante').",
        points: 1,
      },
      {
        id: "q-u2-2",
        level: "A1",
        section: "grammar",
        topic: "Possessive Pronouns",
        prompt: "Das ist mein Vater und das ist ___ Mutter.",
        options: ["mein", "meine", "meinen", "meiner"],
        correctAnswer: 1,
        explanation: "'Mutter' is feminine nominative, so it takes 'meine Mutter'.",
        points: 1,
      },
      {
        id: "q-u2-3",
        level: "A1",
        section: "grammar",
        topic: "Plural Nouns",
        prompt: "Wie lautet der Plural von 'das Kind'?",
        options: ["die Kinde", "die Kinder", "die Kindern", "die Kindes"],
        correctAnswer: 1,
        explanation: "The plural of 'das Kind' is 'die Kinder'.",
        points: 1,
      },
      {
        id: "q-u2-4",
        level: "A1",
        section: "vocabulary",
        topic: "Professions",
        prompt: "Ein Mann, der an einer Schule unterrichtet, ist ein ___.",
        options: ["Arzt", "Lehrer", "Kellner", "Ingenieur"],
        correctAnswer: 1,
        explanation: "A teacher is a 'Lehrer' (or 'Lehrerin' if female).",
        points: 1,
      },
      {
        id: "q-u2-5",
        level: "A1",
        section: "grammar",
        topic: "Negation (nicht vs kein)",
        prompt: "Welcher Satz ist korrekt? 'Ich habe ___ Geschwister.'",
        options: ["nicht", "keine", "kein", "keinen"],
        correctAnswer: 1,
        explanation: "Nouns without a definite article are negated with 'kein-'. Plural 'Geschwister' takes 'keine'.",
        points: 1,
      },
      {
        id: "q-u2-6",
        level: "A1",
        section: "grammar",
        topic: "Possessive (sein/ihr)",
        prompt: "Thomas hat einen Hund. Das ist ___ Hund.",
        options: ["sein", "seine", "ihr", "ihre"],
        correctAnswer: 0,
        explanation: "Thomas (masculine third person) takes possessive 'sein' for masculine singular noun 'Hund'.",
        points: 1,
      },
      {
        id: "q-u2-7",
        level: "A1",
        section: "reading",
        topic: "Family Message",
        contextText: "Liebe Anna, wir feiern am Samstag den 60. Geburtstag von Opa Heinrich. Bring bitte einen Kuchen mit!",
        prompt: "Was wird am Samstag gefeiert?",
        options: ["Eine Hochzeit", "Der Geburtstag des Großvaters", "Ein Umzug", "Ein Schulanfang"],
        correctAnswer: 1,
        explanation: "'Opa Heinrich' is the grandfather.",
        points: 1,
      },
      {
        id: "q-u2-8",
        level: "A1",
        section: "vocabulary",
        topic: "Languages",
        prompt: "In Österreich spricht man hauptsächlich ___.",
        options: ["Französisch", "Deutsch", "Englisch", "Italienisch"],
        correctAnswer: 1,
        explanation: "The primary official language in Austria is German ('Deutsch').",
        points: 1,
      },
      {
        id: "q-u2-9",
        level: "A1",
        section: "grammar",
        topic: "Verb Conjugation (haben)",
        prompt: "Ergänze: '___ ihr heute Zeit für einen Kaffee?'",
        options: ["Haben", "Habt", "Hast", "Hat"],
        correctAnswer: 1,
        explanation: "Second person plural ('ihr') conjugation of 'haben' is 'ihr habt'.",
        points: 1,
      },
      {
        id: "q-u2-10",
        level: "A1",
        section: "vocabulary",
        topic: "Marital Status",
        prompt: "Was bedeutet 'verheiratet'?",
        options: ["ledig", "im Ruhestand", "in einer Ehe lebend", "arbeitslos"],
        correctAnswer: 2,
        explanation: "'Verheiratet' means married (living in a marriage).",
        points: 1,
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   FULL MOCK EXAMS (Goethe/telc-aligned: Reading, Listening, Grammar, Writing, Speaking)
───────────────────────────────────────────────────────────────────────────── */

export interface MockExamDefinition {
  id: string;
  level: CefrBand;
  title: string;
  titleDe: string;
  durationMinutes: number;
  totalPoints: number;
  passMarkPct: number;
  sections: {
    id: SkillSection;
    title: string;
    titleDe: string;
    description: string;
    durationMinutes: number;
    questions: TestQuestionItem[];
  }[];
}

export const MOCK_EXAMS: MockExamDefinition[] = [
  {
    id: "mock-a1",
    level: "A1",
    title: "A1 Complete Mock Exam (Start Deutsch 1 Format)",
    titleDe: "A1 Modelltest (Start Deutsch 1 Format)",
    durationMinutes: 45,
    totalPoints: 100,
    passMarkPct: 60,
    sections: [
      {
        id: "reading",
        title: "Section 1: Reading (Lesen)",
        titleDe: "Teil 1: Lesen",
        description: "Read everyday notices, emails, and short advertisements and answer comprehension questions.",
        durationMinutes: 12,
        questions: [
          {
            id: "m-a1-r1",
            level: "A1",
            section: "reading",
            topic: "Notice Board",
            contextText: "Aushang im Hausflur: Liebe Nachbarn, am kommenden Mittwoch wird von 09:00 bis 12:00 Uhr das Wasser im gesamten Haus wegen Reparaturarbeiten abgestellt. Bitte sorgen Sie für ausreichend Wasservorrat.",
            prompt: "Was passiert am Mittwochvormittag?",
            options: [
              "Es gibt für drei Stunden kein Wasser im Haus.",
              "Der Aufzug wird repariert.",
              "Die Nachbarn feiern ein Fest.",
              "Die Heizung wird dauerhaft ausgeschaltet."
            ],
            correctAnswer: 0,
            explanation: "The notice states the water will be shut off ('Wasser abgestellt') between 09:00 and 12:00.",
            points: 4,
          },
          {
            id: "m-a1-r2",
            level: "A1",
            section: "reading",
            topic: "Doctor's Appointment",
            contextText: "Praxis Dr. Weber: Bitte bringen Sie zu jedem Termin Ihre Versichertenkarte mit. Bei Rezeptabholung melden Sie sich bitte am Nebenschalter.",
            prompt: "Was muss man immer zum Arzttermin mitbringen?",
            options: ["Bargeld", "Die Versichertenkarte", "Einen Reisepass", "Ein Passfoto"],
            correctAnswer: 1,
            explanation: "The text states explicitly: 'Bitte bringen Sie zu jedem Termin Ihre Versichertenkarte mit.'",
            points: 4,
          },
          {
            id: "m-a1-r3",
            level: "A1",
            section: "reading",
            topic: "Shopping Advertisement",
            contextText: "Supermarkt Rabatt: Nur heute 20% Rabatt auf alle Bio-Obst- und Gemüsesorten! Ausgenommen sind reduzierte Aktionsartikel.",
            prompt: "Für welche Produkte gilt der 20%-Rabatt?",
            options: ["Auf Fleischwaren", "Auf Bio-Obst und Bio-Gemüse", "Auf alle Getränke", "Auf bereits reduzierte Artikel"],
            correctAnswer: 1,
            explanation: "The advertisement specifies 20% discount on 'Bio-Obst- und Gemüsesorten'.",
            points: 4,
          },
        ],
      },
      {
        id: "listening",
        title: "Section 2: Listening (Hören)",
        titleDe: "Teil 2: Hören",
        description: "Listen to spoken announcements, voicemail messages, and everyday dialogues using native speech playback.",
        durationMinutes: 10,
        questions: [
          {
            id: "m-a1-l1",
            level: "A1",
            section: "listening",
            topic: "Platform Announcement",
            audioText: "Achtung an Gleis 4: Der Regionalexpress 9 nach Aachen fährt heute abweichend von Gleis 7 ab. Bitte nutzen Sie die Unterführung.",
            prompt: "Von welchem Gleis fährt der Zug nach Aachen ab?",
            options: ["Gleis 4", "Gleis 7", "Gleis 9", "Gleis 2"],
            correctAnswer: 1,
            explanation: "The speaker announces departure from Gleis 7 ('fährt heute abweichend von Gleis 7 ab').",
            points: 4,
          },
          {
            id: "m-a1-l2",
            level: "A1",
            section: "listening",
            topic: "Voicemail Message",
            audioText: "Hallo Lisa, hier ist Martin. Ich schaffe es heute leider nicht bis 18 Uhr ins Kino. Lass uns lieber um 19:30 Uhr vor dem Eingang treffen. Bis später!",
            prompt: "Wann möchte Martin sich jetzt treffen?",
            options: ["Um 18:00 Uhr", "Um 19:00 Uhr", "Um 19:30 Uhr", "Um 20:00 Uhr"],
            correctAnswer: 2,
            explanation: "Martin proposes: 'Lass uns lieber um 19:30 Uhr vor dem Eingang treffen.'",
            points: 4,
          },
        ],
      },
      {
        id: "grammar",
        title: "Section 3: Grammar & Vocabulary (Sprachbausteine)",
        titleDe: "Teil 3: Sprachbausteine",
        description: "Cloze texts and structural sentence completions testing articles, prepositions, and verb forms.",
        durationMinutes: 10,
        questions: [
          {
            id: "m-a1-g1",
            level: "A1",
            section: "grammar",
            topic: "Accusative Article",
            prompt: "Ich möchte bitte ___ Kaffee ohne Milch und Zucker bestellen.",
            options: ["einen", "ein", "eine", "einem"],
            correctAnswer: 0,
            explanation: "'Kaffee' is masculine; direct object in accusative is 'einen Kaffee'.",
            points: 4,
          },
          {
            id: "m-a1-g2",
            level: "A1",
            section: "grammar",
            topic: "Separable Verbs (Trennbare Verben)",
            prompt: "Der Deutschunterricht fängt um 09:00 Uhr ___.",
            options: ["auf", "an", "mit", "aus"],
            correctAnswer: 1,
            explanation: "The separable verb is 'anfangen' -> 'fängt ... an'.",
            points: 4,
          },
          {
            id: "m-a1-g3",
            level: "A1",
            section: "grammar",
            topic: "Dative Prepositions",
            prompt: "Jeden Tag fahre ich mit ___ U-Bahn zur Arbeit.",
            options: ["der", "die", "das", "dem"],
            correctAnswer: 0,
            explanation: "'Mit' always requires Dative. Feminine 'die U-Bahn' becomes 'mit der U-Bahn'.",
            points: 4,
          },
        ],
      },
      {
        id: "writing",
        title: "Section 4: Writing (Schreiben)",
        titleDe: "Teil 4: Schreiben",
        description: "Write a short personal note, email, or invitation following standard German written conventions.",
        durationMinutes: 8,
        questions: [
          {
            id: "m-a1-w1",
            level: "A1",
            section: "writing",
            topic: "Short Email / Invitation",
            prompt: "Schreiben Sie eine kurze E-Mail (mindestens 25 Wörter) an Ihren Freund Max: Laden Sie ihn zu Ihrer Geburtstagsfeier am Samstag ein. Schreiben Sie: 1. Wann die Feier beginnt, 2. Wo gefeiert wird, 3. Was er mitbringen soll.",
            options: [
              "Email complete according to rubric guidelines",
              "Partial requirements met",
              "Insufficient length",
              "Did not attempt"
            ],
            correctAnswer: 0,
            explanation: "Rubric assesses: Salutation (Lieber Max), Date & time, Location, Contribution (Getränke/Kuchen), Closing (Viele Grüße).",
            points: 15,
            writingRubric: {
              taskPrompt: "Schreiben Sie eine kurze E-Mail (mindestens 25 Wörter) an Ihren Freund Max zur Geburtstagseinladung.",
              minWords: 25,
              recommendedMinutes: 8,
              criteria: [
                "Anrede (z. B. 'Lieber Max,')",
                "Datum und Uhrzeit nennen",
                "Ort der Feier angeben",
                "Mitzubringendes erwähnen",
                "Grußformel (z. B. 'Viele Grüße')",
              ],
            },
          },
        ],
      },
      {
        id: "speaking",
        title: "Section 5: Speaking (Sprechen)",
        titleDe: "Teil 5: Sprechen",
        description: "Audio self-introduction and expressing personal information clearly in German.",
        durationMinutes: 5,
        questions: [
          {
            id: "m-a1-s1",
            level: "A1",
            section: "speaking",
            topic: "Self-Introduction (Sich vorstellen)",
            prompt: "Stellen Sie sich kurz auf Deutsch vor (mindestens 4 Sätze): Name, Herkunft, Wohnort, Beruf/Hobbys.",
            options: [
              "Complete fluent self-introduction provided",
              "Good attempt with minor hesitation",
              "Basic phrases used",
              "Incomplete response"
            ],
            correctAnswer: 0,
            explanation: "Speaking criteria evaluate phonetic clarity, standard word order ('Ich heiße ...', 'Ich komme aus ...', 'Ich wohne in ...'), and vocabulary range.",
            points: 15,
            speakingPrompt: {
              taskPrompt: "Stellen Sie sich kurz auf Deutsch vor: Name, Herkunft, Wohnort, Beruf oder Hobbys.",
              prepSeconds: 30,
              targetPoints: [
                "Name ('Ich heiße...')",
                "Herkunft ('Ich komme aus...')",
                "Wohnort ('Ich wohne in...')",
                "Beruf/Hobbys ('Ich bin... / Meine Hobbys sind...')"
              ],
            },
          },
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ADAPTIVE PLACEMENT TEST ENGINE
───────────────────────────────────────────────────────────────────────────── */

export {
  createInitialPlacementState,
  processAdaptiveAnswer,
  calculatePlacementResult,
  evaluateQuizSubmission,
  CEFR_ORDER,
} from "./scoringLogic";
export type {
  AdaptivePlacementState,
  QuizEvaluationResult,
} from "./scoringLogic";

import {
  createInitialPlacementState,
  type AdaptivePlacementState,
} from "./scoringLogic";

export function getNextAdaptiveQuestion(state: AdaptivePlacementState): TestQuestionItem | null {
  if (state.currentQuestionIndex >= state.totalQuestionsTarget) {
    return null;
  }

  // Filter pool for candidate questions matching currentDifficulty that haven't been answered yet
  const availableAtLevel = ORIGINAL_PLACEMENT_POOL.filter(
    (q) => q.level === state.currentDifficulty && !state.answeredQuestionIds.includes(q.id)
  );

  if (availableAtLevel.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableAtLevel.length);
    return availableAtLevel[randomIndex];
  }

  // Fallback: pick any unused question closest to current difficulty
  const remaining = ORIGINAL_PLACEMENT_POOL.filter(
    (q) => !state.answeredQuestionIds.includes(q.id)
  );

  return remaining.length > 0 ? remaining[0] : null;
}


/* ─────────────────────────────────────────────────────────────────────────────
   ATTEMPT STORAGE & HISTORY SERVICE
───────────────────────────────────────────────────────────────────────────── */

export function saveTestAttempt(attempt: TestAttemptRecord): void {
  if (typeof window === "undefined") return;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: TestAttemptRecord[] = raw ? JSON.parse(raw) : [];
    existing.unshift(attempt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));

    // Sync with Supabase if user is signed in
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        (supabase as any).from("test_attempts").upsert({
          id: attempt.id,
          user_id: user.id,
          test_type: attempt.testType,
          score_pct: attempt.percentage,
          total_points_earned: attempt.score,
          passed: attempt.passed,
          duration_seconds: attempt.durationSeconds,
          completed_at: attempt.completedAt,
        });
      }
    });
  } catch (err) {
    console.error("Failed to save test attempt", err);
  }
}

export function getAllTestAttempts(): TestAttemptRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getTestAttemptById(id: string): TestAttemptRecord | null {
  const attempts = getAllTestAttempts();
  return attempts.find((a) => a.id === id) || null;
}
