export type CefrLevel = "A1" | "A2" | "B1" | "B2";
export type StoryCategory = "daily" | "travel" | "culture" | "mystery" | "society";

export interface StorySentence {
  id: number;
  textDe: string;
  textEn: string;
  startTimeSeconds: number;
  endTimeSeconds: number;
}

export interface StoryVocabularyWord {
  word: string;
  baseForm: string;
  article?: "der" | "die" | "das" | null;
  plural?: string | null;
  english: string;
  partOfSpeech: "noun" | "verb" | "adjective" | "phrase" | "adverb";
  grammarNote?: string;
  exampleDe?: string;
  exampleEn?: string;
}

export interface StoryQuestion {
  id: string;
  questionDe: string;
  questionEn: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GradedStory {
  id: string;
  slug: string;
  title: string;
  titleDe: string;
  level: CefrLevel;
  category: StoryCategory;
  summary: string;
  coverEmoji: string;
  readingTimeMinutes: number;
  wordCount: number;
  sentences: StorySentence[];
  vocabularyMap: Record<string, StoryVocabularyWord>;
  questions: StoryQuestion[];
  culturalTip?: string;
}

export const GRADED_STORIES: GradedStory[] = [
  // ─── STORY 1: A1 · Ein Samstag in Berlin ─────────────────────────────────
  {
    id: "story-berlin-a1",
    slug: "ein-samstag-in-berlin",
    title: "A Saturday in Berlin",
    titleDe: "Ein Samstag in Berlin",
    level: "A1",
    category: "daily",
    summary: "Follow Lukas through a sunny Saturday in Berlin: drinking coffee in Prenzlauer Berg, browsing the Mauerpark flea market, and riding the U-Bahn.",
    coverEmoji: "☕",
    readingTimeMinutes: 3,
    wordCount: 135,
    culturalTip: "Sonntags sind in Deutschland fast alle Geschäfte geschlossen. Daher ist der Samstag der beliebteste Tag für Einkäufe und Flohmärkte.",
    sentences: [
      {
        id: 0,
        textDe: "Es ist Samstagmorgen in Berlin und die Sonne scheint.",
        textEn: "It is Saturday morning in Berlin and the sun is shining.",
        startTimeSeconds: 0,
        endTimeSeconds: 4,
      },
      {
        id: 1,
        textDe: "Lukas wacht um acht Uhr auf und öffnet das Fenster.",
        textEn: "Lukas wakes up at eight o'clock and opens the window.",
        startTimeSeconds: 4,
        endTimeSeconds: 8,
      },
      {
        id: 2,
        textDe: "Er geht in ein gemütliches Café im Prenzlauer Berg.",
        textEn: "He goes to a cozy café in Prenzlauer Berg.",
        startTimeSeconds: 8,
        endTimeSeconds: 12,
      },
      {
        id: 3,
        textDe: "Er bestellt einen heißen Cappuccino mit Hafermilch und ein frisches Croissant.",
        textEn: "He orders a hot cappuccino with oat milk and a fresh croissant.",
        startTimeSeconds: 12,
        endTimeSeconds: 17,
      },
      {
        id: 4,
        textDe: "Der Kellner lächelt freundlich und bringt das Frühstück.",
        textEn: "The waiter smiles kindly and brings the breakfast.",
        startTimeSeconds: 17,
        endTimeSeconds: 21,
      },
      {
        id: 5,
        textDe: "Danach fährt Lukas mit der U-Bahn zum berühmten Mauerpark.",
        textEn: "After that, Lukas rides the subway to the famous Mauerpark.",
        startTimeSeconds: 21,
        endTimeSeconds: 26,
      },
      {
        id: 6,
        textDe: "Auf dem Flohmarkt kauft er ein altes Buch über die Berliner Geschichte.",
        textEn: "At the flea market, he buys an old book about Berlin's history.",
        startTimeSeconds: 26,
        endTimeSeconds: 31,
      },
      {
        id: 7,
        textDe: "Am Nachmittag trifft er seine Freunde im Park zum Picknick.",
        textEn: "In the afternoon, he meets his friends in the park for a picnic.",
        startTimeSeconds: 31,
        endTimeSeconds: 36,
      },
      {
        id: 8,
        textDe: "Es ist ein perfekter und entspannter Tag in der Hauptstadt.",
        textEn: "It is a perfect and relaxing day in the capital city.",
        startTimeSeconds: 36,
        endTimeSeconds: 41,
      },
    ],
    vocabularyMap: {
      sonne: {
        word: "die Sonne",
        baseForm: "Sonne",
        article: "die",
        plural: "die Sonnen",
        english: "the sun",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun ('die'). Idiom: 'Die Sonne scheint' (The sun is shining).",
        exampleDe: "Die Sonne scheint den ganzen Tag.",
        exampleEn: "The sun is shining all day.",
      },
      fenster: {
        word: "das Fenster",
        baseForm: "Fenster",
        article: "das",
        plural: "die Fenster",
        english: "the window",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun ('das'). Plural identical to singular ('die Fenster').",
        exampleDe: "Bitte öffne das Fenster.",
        exampleEn: "Please open the window.",
      },
      café: {
        word: "das Café",
        baseForm: "Café",
        article: "das",
        plural: "die Cafés",
        english: "the café",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun. Notice the accent aigu: das Café.",
        exampleDe: "Wir treffen uns im Café.",
        exampleEn: "We meet at the café.",
      },
      cappuccino: {
        word: "der Cappuccino",
        baseForm: "Cappuccino",
        article: "der",
        plural: "die Cappuccinos",
        english: "the cappuccino",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun ('der'). Akkusativ: 'einen Cappuccino'.",
        exampleDe: "Ich möchte einen Cappuccino, bitte.",
        exampleEn: "I would like a cappuccino, please.",
      },
      kellner: {
        word: "der Kellner",
        baseForm: "Kellner",
        article: "der",
        plural: "die Kellner",
        english: "the waiter",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun ('der'). Feminine counterpart: 'die Kellnerin'.",
        exampleDe: "Der Kellner bringt die Rechnung.",
        exampleEn: "The waiter brings the bill.",
      },
      frühstück: {
        word: "das Frühstück",
        baseForm: "Frühstück",
        article: "das",
        plural: "die Frühstücke",
        english: "the breakfast",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun ('das'). Verb: 'frühstücken' (to have breakfast).",
        exampleDe: "Das Frühstück ist fertig.",
        exampleEn: "Breakfast is ready.",
      },
      u_bahn: {
        word: "die U-Bahn",
        baseForm: "U-Bahn",
        article: "die",
        plural: "die U-Bahnen",
        english: "the subway / metro",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun ('die'). Dativ with 'mit': 'mit der U-Bahn'.",
        exampleDe: "Ich fahre jeden Tag mit der U-Bahn.",
        exampleEn: "I ride the subway every day.",
      },
      flohmarkt: {
        word: "der Flohmarkt",
        baseForm: "Flohmarkt",
        article: "der",
        plural: "die Flohmärkte",
        english: "the flea market",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun ('der'). Dativ with 'auf': 'auf dem Flohmarkt'.",
        exampleDe: "Sonntags gehe ich gerne auf den Flohmarkt.",
        exampleEn: "On Sundays I like going to the flea market.",
      },
      buch: {
        word: "das Buch",
        baseForm: "Buch",
        article: "das",
        plural: "die Bücher",
        english: "the book",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun ('das'). Irregular plural with Umlaut: 'die Bücher'.",
        exampleDe: "Das Buch ist sehr interessant.",
        exampleEn: "The book is very interesting.",
      },
      hauptstadt: {
        word: "die Hauptstadt",
        baseForm: "Hauptstadt",
        article: "die",
        plural: "die Hauptstädte",
        english: "the capital city",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun ('die'). Berlin ist die Hauptstadt von Deutschland.",
        exampleDe: "Berlin ist eine lebendige Hauptstadt.",
        exampleEn: "Berlin is a lively capital.",
      },
    },
    questions: [
      {
        id: "q-berlin-1",
        questionDe: "Was bestellt Lukas im Café?",
        questionEn: "What does Lukas order at the café?",
        options: [
          "Einen schwarzen Tee und Brot",
          "Einen Cappuccino mit Hafermilch und ein Croissant",
          "Ein großes Glas Orangensaft und Kuchen",
          "Eine Cola und eine Pizza",
        ],
        correctIndex: 1,
        explanation: "In sentence 4, Lukas orders a cappuccino with oat milk and a fresh croissant ('einen heißen Cappuccino mit Hafermilch und ein frisches Croissant').",
      },
      {
        id: "q-berlin-2",
        questionDe: "Wie fährt Lukas zum Mauerpark?",
        questionEn: "How does Lukas travel to Mauerpark?",
        options: [
          "Mit dem Fahrrad",
          "Zu Fuß durch die Stadt",
          "Mit der U-Bahn",
          "Mit dem Taxi",
        ],
        correctIndex: 2,
        explanation: "Sentence 6 mentions: 'Danach fährt Lukas mit der U-Bahn zum berühmten Mauerpark.'",
      },
      {
        id: "q-berlin-3",
        questionDe: "Was kauft Lukas auf dem Flohmarkt?",
        questionEn: "What does Lukas buy at the flea market?",
        options: [
          "Eine alte Gitarre",
          "Ein altes Buch über Berliner Geschichte",
          "Eine Kaffeetasse aus Holz",
          "Neue Kleidung für den Sommer",
        ],
        correctIndex: 1,
        explanation: "Sentence 7 confirms: 'Auf dem Flohmarkt kauft er ein altes Buch über die Berliner Geschichte.'",
      },
    ],
  },

  // ─── STORY 2: A1 · Die neue Nachbarin ────────────────────────────────────
  {
    id: "story-nachbarin-a1",
    slug: "die-neue-nachbarin",
    title: "The New Neighbor",
    titleDe: "Die neue Nachbarin",
    level: "A1",
    category: "daily",
    summary: "Sara has just moved into a 3rd-floor apartment in Munich. When she meets her friendly neighbor Herr Meier in the hallway, a warm conversation begins.",
    coverEmoji: "🚪",
    readingTimeMinutes: 3,
    wordCount: 140,
    culturalTip: "In deutschen Mehrfamilienhäusern stellt man sich neuen Nachbarn oft kurz vor und beachtet die Hausordnung (Ruhezeiten ab 22:00 Uhr).",
    sentences: [
      {
        id: 0,
        textDe: "Sara wohnt seit drei Tagen in ihrer neuen Wohnung in München.",
        textEn: "Sara has been living in her new apartment in Munich for three days.",
        startTimeSeconds: 0,
        endTimeSeconds: 5,
      },
      {
        id: 1,
        textDe: "Die Wohnung liegt im dritten Stock eines alten, schönen Hauses.",
        textEn: "The apartment is on the third floor of an old, beautiful building.",
        startTimeSeconds: 5,
        endTimeSeconds: 10,
      },
      {
        id: 2,
        textDe: "Im Hausflur trifft sie einen älteren Mann mit einer Brille.",
        textEn: "In the hallway, she meets an older man with glasses.",
        startTimeSeconds: 10,
        endTimeSeconds: 14,
      },
      {
        id: 3,
        textDe: "„Guten Tag! Ich bin Herr Meier. Sind Sie neu hier eingezogen?“",
        textEn: "\"Good day! I am Herr Meier. Did you move in here recently?\"",
        startTimeSeconds: 14,
        endTimeSeconds: 19,
      },
      {
        id: 4,
        textDe: "Sara lächelt und antwortet: „Ja, mein Name ist Sara. Ich komme aus Schweden.“",
        textEn: "Sara smiles and replies: \"Yes, my name is Sara. I come from Sweden.\"",
        startTimeSeconds: 19,
        endTimeSeconds: 25,
      },
      {
        id: 5,
        textDe: "Herr Meier freut sich: „Herzlich willkommen in unserem Haus!“",
        textEn: "Herr Meier is pleased: \"Welcome to our building!\"",
        startTimeSeconds: 25,
        endTimeSeconds: 29,
      },
      {
        id: 6,
        textDe: "Er bietet Sara seine Hilfe an, falls sie Werkzeug oder einen Rat braucht.",
        textEn: "He offers Sara his help in case she needs tools or advice.",
        startTimeSeconds: 29,
        endTimeSeconds: 34,
      },
      {
        id: 7,
        textDe: "Sara bedankt sich herzlich und fühlt sich sofort willkommen.",
        textEn: "Sara thanks him warmly and immediately feels welcomed.",
        startTimeSeconds: 34,
        endTimeSeconds: 39,
      },
    ],
    vocabularyMap: {
      wohnung: {
        word: "die Wohnung",
        baseForm: "Wohnung",
        article: "die",
        plural: "die Wohnungen",
        english: "the apartment / flat",
        partOfSpeech: "noun",
        grammarNote: "All nouns ending in '-ung' are feminine ('die').",
        exampleDe: "Die Wohnung hat drei Zimmer.",
        exampleEn: "The apartment has three rooms.",
      },
      nachbarin: {
        word: "die Nachbarin",
        baseForm: "Nachbarin",
        article: "die",
        plural: "die Nachbarinnen",
        english: "the female neighbor",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun with '-in' suffix. Masculine: 'der Nachbar'.",
        exampleDe: "Meine Nachbarin ist sehr freundlich.",
        exampleEn: "My neighbor is very friendly.",
      },
      hausflur: {
        word: "der Hausflur",
        baseForm: "Hausflur",
        article: "der",
        plural: "die Hausflure",
        english: "the hallway / entrance hall",
        partOfSpeech: "noun",
        grammarNote: "Compound noun: das Haus + der Flur = der Hausflur.",
        exampleDe: "Die Schuhe stehen im Hausflur.",
        exampleEn: "The shoes are in the hallway.",
      },
      brille: {
        word: "die Brille",
        baseForm: "Brille",
        article: "die",
        plural: "die Brillen",
        english: "the glasses / eyeglasses",
        partOfSpeech: "noun",
        grammarNote: "In German 'die Brille' is singular (unlike English 'pair of glasses').",
        exampleDe: "Wo ist meine Brille?",
        exampleEn: "Where are my glasses?",
      },
      hilfe: {
        word: "die Hilfe",
        baseForm: "Hilfe",
        article: "die",
        plural: "die Hilfen",
        english: "the help / assistance",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun. Phrase: 'Danke für Ihre Hilfe!'",
        exampleDe: "Brauchen Sie Hilfe?",
        exampleEn: "Do you need help?",
      },
      werkzeug: {
        word: "das Werkzeug",
        baseForm: "Werkzeug",
        article: "das",
        plural: "die Werkzeuge",
        english: "the tool / tools",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun ('das'). Das Zeug zum Werken.",
        exampleDe: "Hast du das passende Werkzeug?",
        exampleEn: "Do you have the right tool?",
      },
    },
    questions: [
      {
        id: "q-nachb-1",
        questionDe: "In welchem Stockwerk liegt Saras Wohnung?",
        questionEn: "On which floor is Sara's apartment?",
        options: ["Im Erdgeschoss", "Im ersten Stock", "Im dritten Stock", "Unter dem Dach"],
        correctIndex: 2,
        explanation: "Sentence 2 states: 'Die Wohnung liegt im dritten Stock eines alten, schönen Hauses.'",
      },
      {
        id: "q-nachb-2",
        questionDe: "Aus welchem Land kommt Sara?",
        questionEn: "Which country does Sara come from?",
        options: ["Aus Deutschland", "Aus Schweden", "Aus Österreich", "Aus Frankreich"],
        correctIndex: 1,
        explanation: "Sara introduces herself in sentence 5: 'Ich komme aus Schweden.'",
      },
      {
        id: "q-nachb-3",
        questionDe: "Was bietet Herr Meier Sara an?",
        questionEn: "What does Herr Meier offer Sara?",
        options: [
          "Einen Kuchen zum Essen",
          "Seine Hilfe und Werkzeug",
          "Ein Ticket für die U-Bahn",
          "Ein Zimmer in seiner Wohnung",
        ],
        correctIndex: 1,
        explanation: "Sentence 7 confirms: 'Er bietet Sara seine Hilfe an, falls sie Werkzeug oder einen Rat braucht.'",
      },
    ],
  },

  // ─── STORY 3: A2 · Das Geheimnis im Schwarzwald ──────────────────────────
  {
    id: "story-schwarzwald-a2",
    slug: "das-geheimnis-im-schwarzwald",
    title: "The Secret in the Black Forest",
    titleDe: "Das Geheimnis im Schwarzwald",
    level: "A2",
    category: "mystery",
    summary: "During a weekend hike in the dense Black Forest, Felix and Mia discover a secluded wooden cabin holding a vintage postcard from 1954.",
    coverEmoji: "🌲",
    readingTimeMinutes: 4,
    wordCount: 175,
    culturalTip: "Der Schwarzwald in Baden-Württemberg ist bekannt für Kuckucksuhren, dichte Tannenwälder und das weltberühmte Wandernetzwerk.",
    sentences: [
      {
        id: 0,
        textDe: "Am vergangenen Wochenende machten Felix und Mia einen Ausflug in den Schwarzwald.",
        textEn: "Last weekend, Felix and Mia took a trip to the Black Forest.",
        startTimeSeconds: 0,
        endTimeSeconds: 5,
      },
      {
        id: 1,
        textDe: "Der Nebel lag dicht zwischen den hohen Tannen, als sie den Wanderweg verließen.",
        textEn: "The fog lay thick between the tall fir trees when they left the hiking trail.",
        startTimeSeconds: 5,
        endTimeSeconds: 11,
      },
      {
        id: 2,
        textDe: "Nach einer halben Stunde entdeckten sie plötzlich eine kleine, verlassene Holzhütte.",
        textEn: "After half an hour, they suddenly discovered a small, abandoned wooden cabin.",
        startTimeSeconds: 11,
        endTimeSeconds: 17,
      },
      {
        id: 3,
        textDe: "Die alte Holztür war nur angelehnt, und sie traten vorsichtig hinein.",
        textEn: "The old wooden door was slightly open, and they stepped inside cautiously.",
        startTimeSeconds: 17,
        endTimeSeconds: 22,
      },
      {
        id: 4,
        textDe: "Auf einem staubigen Tisch lag ein ledernes Tagebuch und eine Postkarte aus dem Jahr 1954.",
        textEn: "On a dusty table lay a leather journal and a postcard from the year 1954.",
        startTimeSeconds: 22,
        endTimeSeconds: 28,
      },
      {
        id: 5,
        textDe: "Auf der Postkarte stand eine kurze Nachricht: „Ich werde auf dich am Wasserfall warten.“",
        textEn: "On the postcard was a short message: \"I will wait for you by the waterfall.\"",
        startTimeSeconds: 28,
        endTimeSeconds: 34,
      },
      {
        id: 6,
        textDe: "Mia und Felix sahen sich überrascht an und beschlossen, dem Pfad zum Wasserfall zu folgen.",
        textEn: "Mia and Felix looked at each other in surprise and decided to follow the path to the waterfall.",
        startTimeSeconds: 34,
        endTimeSeconds: 41,
      },
    ],
    vocabularyMap: {
      ausflug: {
        word: "der Ausflug",
        baseForm: "Ausflug",
        article: "der",
        plural: "die Ausflüge",
        english: "the excursion / day trip",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun ('der'). Verb: 'einen Ausflug machen'.",
        exampleDe: "Wir machen morgen einen Ausflug an den See.",
        exampleEn: "We are taking a day trip to the lake tomorrow.",
      },
      nebel: {
        word: "der Nebel",
        baseForm: "Nebel",
        article: "der",
        plural: "die Nebel",
        english: "the fog / mist",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun ('der'). Adjective: 'neblig' (foggy).",
        exampleDe: "Am Morgen war dichter Nebel im Tal.",
        exampleEn: "In the morning there was thick fog in the valley.",
      },
      wanderweg: {
        word: "der Wanderweg",
        baseForm: "Wanderweg",
        article: "der",
        plural: "die Wanderwege",
        english: "the hiking path / trail",
        partOfSpeech: "noun",
        grammarNote: "Compound noun: wandern + der Weg = der Wanderweg.",
        exampleDe: "Dieser Wanderweg ist sehr gut markiert.",
        exampleEn: "This hiking path is marked very well.",
      },
      hütte: {
        word: "die Hütte",
        baseForm: "Hütte",
        article: "die",
        plural: "die Hütten",
        english: "the cabin / hut",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun ('die'). E.g., 'die Berghütte' (mountain cabin).",
        exampleDe: "Die Wanderer übernachteten in der Hütte.",
        exampleEn: "The hikers stayed overnight in the cabin.",
      },
      wasserfall: {
        word: "der Wasserfall",
        baseForm: "Wasserfall",
        article: "der",
        plural: "die Wasserfälle",
        english: "the waterfall",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun. Das Wasser + der Fall = der Wasserfall.",
        exampleDe: "Der Wasserfall rauscht laut.",
        exampleEn: "The waterfall rushes loudly.",
      },
      tagebuch: {
        word: "das Tagebuch",
        baseForm: "Tagebuch",
        article: "das",
        plural: "die Tagebücher",
        english: "the diary / journal",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun ('das'). Der Tag + das Buch = das Tagebuch.",
        exampleDe: "Sie schreibt jeden Abend in ihr Tagebuch.",
        exampleEn: "She writes in her diary every evening.",
      },
    },
    questions: [
      {
        id: "q-schwarz-1",
        questionDe: "Wohin machten Felix und Mia ihren Ausflug?",
        questionEn: "Where did Felix and Mia take their trip?",
        options: ["An die Ostsee", "In den Schwarzwald", "In die Alpen", "Nach Berlin"],
        correctIndex: 1,
        explanation: "Sentence 1 states: 'Felix und Mia machten einen Ausflug in den Schwarzwald.'",
      },
      {
        id: "q-schwarz-2",
        questionDe: "Was fanden sie auf dem staubigen Tisch in der Hütte?",
        questionEn: "What did they find on the dusty table in the cabin?",
        options: [
          "Eine alte Kamera und Geld",
          "Ein ledernes Tagebuch und eine Postkarte von 1954",
          "Eine Landkarte und einen Kompass",
          "Ein altes Radio",
        ],
        correctIndex: 1,
        explanation: "Sentence 5 explains: 'Auf einem staubigen Tisch lag ein ledernes Tagebuch und eine Postkarte aus dem Jahr 1954.'",
      },
      {
        id: "q-schwarz-3",
        questionDe: "Was beschlossen die beiden am Ende zu tun?",
        questionEn: "What did the two decide to do in the end?",
        options: [
          "Sofort nach Hause zu fahren",
          "Die Polizei anzurufen",
          "Dem Pfad zum Wasserfall zu folgen",
          "In der Hütte zu übernachten",
        ],
        correctIndex: 2,
        explanation: "Sentence 7 confirms: '... und beschlossen, dem Pfad zum Wasserfall zu folgen.'",
      },
    ],
  },

  // ─── STORY 4: A2 · Ein Nachmittag in Wien ────────────────────────────────
  {
    id: "story-wien-a2",
    slug: "ein-nachmittag-in-wien",
    title: "An Afternoon in Vienna",
    titleDe: "Ein Nachmittag in Wien",
    level: "A2",
    category: "culture",
    summary: "Experience the timeless elegance of Vienna: ordering a Melange in a traditional coffee house, savoring Sachertorte, and listening to classical violin music near Stephansdom.",
    coverEmoji: "🎻",
    readingTimeMinutes: 3,
    wordCount: 155,
    culturalTip: "In Wien nennt man das Café 'Kaffeehaus'. Traditionell serviert der Ober zur Wiener Melange immer ein Glas stilles Wasser mit einem Löffel darauf.",
    sentences: [
      {
        id: 0,
        textDe: "Wien ist berühmt für seine prächtige Architektur und die gemütliche Kaffeehauskultur.",
        textEn: "Vienna is famous for its magnificent architecture and cozy coffee house culture.",
        startTimeSeconds: 0,
        endTimeSeconds: 6,
      },
      {
        id: 1,
        textDe: "Anna betritt das traditionsreiche Café Central im Herzen der österreichischen Hauptstadt.",
        textEn: "Anna enters the traditional Café Central in the heart of the Austrian capital.",
        startTimeSeconds: 6,
        endTimeSeconds: 12,
      },
      {
        id: 2,
        textDe: "Hohe Marmorsäulen und leise Klaviermusik schaffen eine unvergleichliche Atmosphäre.",
        textEn: "High marble columns and soft piano music create an incomparable atmosphere.",
        startTimeSeconds: 12,
        endTimeSeconds: 18,
      },
      {
        id: 3,
        textDe: "Der Ober im Frack bringt ihr eine Wiener Melange und ein Stück Sachertorte mit Schlagobers.",
        textEn: "The waiter in a tailcoat brings her a Wiener Melange and a slice of Sachertorte with whipped cream.",
        startTimeSeconds: 18,
        endTimeSeconds: 25,
      },
      {
        id: 4,
        textDe: "In Österreich sagt man nicht Schlagsahne, sondern Schlagobers.",
        textEn: "In Austria, people do not say 'Schlagsahne', but rather 'Schlagobers'.",
        startTimeSeconds: 25,
        endTimeSeconds: 30,
      },
      {
        id: 5,
        textDe: "Nach dem Genuss spaziert sie zum Stephansdom, wo ein Straßenmusiker auf der Geige spielt.",
        textEn: "After savoring it, she strolls to St. Stephen's Cathedral, where a busker plays the violin.",
        startTimeSeconds: 30,
        endTimeSeconds: 37,
      },
    ],
    vocabularyMap: {
      architektur: {
        word: "die Architektur",
        baseForm: "Architektur",
        article: "die",
        plural: "die Architekturen",
        english: "the architecture",
        partOfSpeech: "noun",
        grammarNote: "Nouns ending in '-ur' are feminine ('die').",
        exampleDe: "Die gotische Architektur ist beeindruckend.",
        exampleEn: "The Gothic architecture is impressive.",
      },
      kaffeehaus: {
        word: "das Kaffeehaus",
        baseForm: "Kaffeehaus",
        article: "das",
        plural: "die Kaffeehäuser",
        english: "the coffee house",
        partOfSpeech: "noun",
        grammarNote: "Neuter noun ('das'). A core Austrian cultural institution.",
        exampleDe: "Sie verbrachten Stunden im Kaffeehaus.",
        exampleEn: "They spent hours in the coffee house.",
      },
      melange: {
        word: "die Melange",
        baseForm: "Melange",
        article: "die",
        plural: "die Melangen",
        english: "Wiener Melange (Austrian milk coffee)",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun. Similar to a cappuccino with frothed milk.",
        exampleDe: "Eine Wiener Melange bitte!",
        exampleEn: "A Wiener Melange, please!",
      },
      schlagobers: {
        word: "das Schlagobers",
        baseForm: "Schlagobers",
        article: "das",
        plural: null,
        english: "whipped cream (Austrian German)",
        partOfSpeech: "noun",
        grammarNote: "Austrian standard German for 'die Schlagsahne'.",
        exampleDe: "Möchten Sie Sachertorte mit Schlagobers?",
        exampleEn: "Would you like Sachertorte with whipped cream?",
      },
      geige: {
        word: "die Geige",
        baseForm: "Geige",
        article: "die",
        plural: "die Geigen",
        english: "the violin",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun ('die'). Synonymous with 'die Violine'.",
        exampleDe: "Er spielt wunderschön Geige.",
        exampleEn: "He plays violin beautifully.",
      },
    },
    questions: [
      {
        id: "q-wien-1",
        questionDe: "Wie heißt das österreichische Wort für Schlagsahne?",
        questionEn: "What is the Austrian word for whipped cream?",
        options: ["Schlagsahne", "Schlagobers", "Milchschaum", "Kaffeecreme"],
        correctIndex: 1,
        explanation: "Sentence 5 highlights: 'In Österreich sagt man nicht Schlagsahne, sondern Schlagobers.'",
      },
      {
        id: "q-wien-2",
        questionDe: "Welches Instrument spielt der Straßenmusiker am Stephansdom?",
        questionEn: "Which instrument does the street musician play at St. Stephen's Cathedral?",
        options: ["Die Gitarre", "Das Klavier", "Die Geige", "Die Trompete"],
        correctIndex: 2,
        explanation: "Sentence 6 mentions: '... wo ein Straßenmusiker auf der Geige spielt.'",
      },
    ],
  },

  // ─── STORY 5: B1 · Der verlorene Koffer ───────────────────────────────────
  {
    id: "story-koffer-b1",
    slug: "der-verlorene-koffer",
    title: "The Lost Suitcase at the Central Station",
    titleDe: "Der verlorene Koffer am Hauptbahnhof",
    level: "B1",
    category: "travel",
    summary: "David arrives at Frankfurt Central Station after a long train ride, only to find someone mistakenly took his black suitcase from the overhead rack.",
    coverEmoji: "🧳",
    readingTimeMinutes: 4,
    wordCount: 180,
    culturalTip: "Bei Verlust im Zug hilft das Fundbüro der Deutschen Bahn (DB Fundservice). Koffer sollten immer einen Kofferanhänger mit Kontaktdaten tragen.",
    sentences: [
      {
        id: 0,
        textDe: "Als der ICE aus Hamburg pünktlich im Frankfurter Hauptbahnhof einfuhr, atmete David erleichtert auf.",
        textEn: "When the ICE from Hamburg pulled into Frankfurt Central Station on time, David breathed a sigh of relief.",
        startTimeSeconds: 0,
        endTimeSeconds: 6,
      },
      {
        id: 1,
        textDe: "Doch als er sein Gepäck aus der oberen Ablage nehmen wollte, traf ihn der Schock.",
        textEn: "Yet when he wanted to take his luggage from the overhead rack, shock hit him.",
        startTimeSeconds: 6,
        endTimeSeconds: 12,
      },
      {
        id: 2,
        textDe: "Sein schwarzer Hartschalenkoffer war verschwunden, und an dessen Stelle stand ein fast identisches Modell.",
        textEn: "His black hard-shell suitcase had vanished, and in its place stood an almost identical model.",
        startTimeSeconds: 12,
        endTimeSeconds: 19,
      },
      {
        id: 3,
        textDe: "Offensichtlich hatte ein anderer Fahrgast in der Eile versehentlich den falschen Koffer gegriffen.",
        textEn: "Evidently, another passenger had grabbed the wrong suitcase by mistake in the rush.",
        startTimeSeconds: 19,
        endTimeSeconds: 26,
      },
      {
        id: 4,
        textDe: "David begab sich sofort zum Fundbüro der Deutschen Bahn, um den Vorfall zu melden.",
        textEn: "David went immediately to the Deutsche Bahn lost-and-found office to report the incident.",
        startTimeSeconds: 26,
        endTimeSeconds: 32,
      },
      {
        id: 5,
        textDe: "Glücklicherweise hatte der andere Reisende denselben Fehler bemerkt und den Koffer bereits abgegeben.",
        textEn: "Fortunately, the other traveler had noticed the same mistake and had already handed in the suitcase.",
        startTimeSeconds: 32,
        endTimeSeconds: 40,
      },
    ],
    vocabularyMap: {
      gepäck: {
        word: "das Gepäck",
        baseForm: "Gepäck",
        article: "das",
        plural: null,
        english: "the luggage / baggage",
        partOfSpeech: "noun",
        grammarNote: "Uncountable neuter noun ('das Gepäck'). E.g., 'Handgepäck'.",
        exampleDe: "Wo kann ich mein Gepäck aufgeben?",
        exampleEn: "Where can I check in my luggage?",
      },
      fundbüro: {
        word: "das Fundbüro",
        baseForm: "Fundbüro",
        article: "das",
        plural: "die Fundbüros",
        english: "the lost and found office",
        partOfSpeech: "noun",
        grammarNote: "Compound noun: der Fund (finding) + das Büro = das Fundbüro.",
        exampleDe: "Ich habe meine Brieftasche im Fundbüro abgeholt.",
        exampleEn: "I picked up my wallet at the lost and found office.",
      },
      koffer: {
        word: "der Koffer",
        baseForm: "Koffer",
        article: "der",
        plural: "die Koffer",
        english: "the suitcase",
        partOfSpeech: "noun",
        grammarNote: "Masculine noun ('der'). Plural has no ending: 'die Koffer'.",
        exampleDe: "Mein Koffer wiegt zwanzig Kilo.",
        exampleEn: "My suitcase weighs twenty kilos.",
      },
      ansage: {
        word: "die Ansage",
        baseForm: "Ansage",
        article: "die",
        plural: "die Ansagen",
        english: "the announcement",
        partOfSpeech: "noun",
        grammarNote: "Feminine noun formed from the separable verb 'ansagen' (to announce).",
        exampleDe: "Haben Sie die Durchsage am Gleis gehört?",
        exampleEn: "Did you hear the announcement on the platform?",
      },
      reisende: {
        word: "der Reisende",
        baseForm: "Reisende",
        article: "der",
        plural: "die Reisenden",
        english: "the traveler",
        partOfSpeech: "noun",
        grammarNote: "Nominalized adjective. Follows weak/mixed adjective declension.",
        exampleDe: "Viele Reisende warten im Hauptbahnhof.",
        exampleEn: "Many travelers are waiting in the main station.",
      },
    },
    questions: [
      {
        id: "q-koffer-1",
        questionDe: "Warum war Davids Koffer verschwunden?",
        questionEn: "Why had David's suitcase vanished?",
        options: [
          "Ein Dieb hatte ihn gestohlen",
          "Ein anderer Fahrgast hatte ihn versehentlich verwechselt",
          "Der Koffer war aus dem Zug gefallen",
          "David hatte ihn in Hamburg vergessen",
        ],
        correctIndex: 1,
        explanation: "Sentence 4 states: 'Offensichtlich hatte ein anderer Fahrgast in der Eile versehentlich den falschen Koffer gegriffen.'",
      },
      {
        id: "q-koffer-2",
        questionDe: "Wohin ging David, um den Koffer wiederzufinden?",
        questionEn: "Where did David go to recover the suitcase?",
        options: ["Zur Hotelrezeption", "Zum Fundbüro der Deutschen Bahn", "Zur Autovermietung", "Nach Hause"],
        correctIndex: 1,
        explanation: "Sentence 5 confirms: 'David begab sich sofort zum Fundbüro der Deutschen Bahn...'",
      },
    ],
  },
];

export function getStoryById(id: string): GradedStory | undefined {
  return GRADED_STORIES.find((s) => s.id === id || s.slug === id);
}

export function getStoriesByLevel(level: CefrLevel | "ALL"): GradedStory[] {
  if (level === "ALL") return GRADED_STORIES;
  return GRADED_STORIES.filter((s) => s.level === level);
}

export interface ReadingSessionRecord {
  storyId: string;
  durationSeconds: number;
  wordsRead: number;
  calculatedWpm: number;
  completedAt: string;
  questionsScorePct: number;
}

export interface StoryRecommendation {
  story: GradedStory;
  recommendationScore: number;
  matchingFlashcardWordsCount: number;
  matchingWordsList: string[];
  recommendationReason: string;
  isCompleted: boolean;
}

const STORAGE_READING_SESSIONS_KEY = "deutschpfad_reading_sessions_v1";
const STORAGE_COMPLETED_STORIES_KEY = "deutschpfad_completed_stories_v1";

export function getCompletedStoryIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETED_STORIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordCompletedStory(
  storyId: string,
  durationSeconds: number,
  questionsScorePct: number = 100
): ReadingSessionRecord {
  const story = GRADED_STORIES.find((s) => s.id === storyId);
  const wordsRead = story ? story.wordCount : 120;
  const minutes = Math.max(0.1, durationSeconds / 60);
  const calculatedWpm = Math.round(wordsRead / minutes);

  const session: ReadingSessionRecord = {
    storyId,
    durationSeconds,
    wordsRead,
    calculatedWpm,
    completedAt: new Date().toISOString(),
    questionsScorePct,
  };

  if (typeof window !== "undefined") {
    try {
      const completed = getCompletedStoryIds();
      if (!completed.includes(storyId)) {
        completed.push(storyId);
        localStorage.setItem(STORAGE_COMPLETED_STORIES_KEY, JSON.stringify(completed));
      }

      const rawSessions = localStorage.getItem(STORAGE_READING_SESSIONS_KEY);
      const sessions: ReadingSessionRecord[] = rawSessions ? JSON.parse(rawSessions) : [];
      sessions.unshift(session);
      localStorage.setItem(STORAGE_READING_SESSIONS_KEY, JSON.stringify(sessions.slice(0, 50)));
    } catch {}
  }

  return session;
}

export function getTotalReadingStats(): {
  totalSecondsRead: number;
  totalWordsRead: number;
  completedStoriesCount: number;
  averageWpm: number;
} {
  const completed = getCompletedStoryIds();
  let totalSeconds = 480;
  let totalWords = 650;
  let avgWpm = 95;

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_READING_SESSIONS_KEY);
      if (raw) {
        const sessions: ReadingSessionRecord[] = JSON.parse(raw);
        if (sessions.length > 0) {
          totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);
          totalWords = sessions.reduce((sum, s) => sum + s.wordsRead, 0);
          avgWpm = Math.round(sessions.reduce((sum, s) => sum + s.calculatedWpm, 0) / sessions.length);
        }
      }
    } catch {}
  }

  return {
    totalSecondsRead: totalSeconds,
    totalWordsRead: totalWords,
    completedStoriesCount: completed.length,
    averageWpm: avgWpm,
  };
}

export function getRecommendedStories(
  userLevel: CefrLevel = "A1",
  limit: number = 3,
  customSavedWords?: string[]
): StoryRecommendation[] {
  const completedIds = getCompletedStoryIds();
  let savedWordsList: string[] = customSavedWords || [];

  if (savedWordsList.length === 0 && typeof window !== "undefined") {
    try {
      const rawCards = localStorage.getItem("deutschpfad_flashcards_v1");
      if (rawCards) {
        const parsed = JSON.parse(rawCards);
        if (Array.isArray(parsed)) {
          savedWordsList = parsed.map((f: { german?: string }) =>
            (f.german || "").toLowerCase().replace(/^(der|die|das)\s+/, "")
          );
        }
      }
    } catch {
      savedWordsList = ["kaffee", "wohnung", "u-bahn", "buch"];
    }
  }

  if (savedWordsList.length === 0) {
    savedWordsList = ["kaffee", "wohnung", "u-bahn", "buch"];
  }

  const recommendations: StoryRecommendation[] = GRADED_STORIES.map((story) => {
    let score = 0;
    const isCompleted = completedIds.includes(story.id);

    if (story.level === userLevel) {
      score += 50;
    } else if (
      (userLevel === "A1" && story.level === "A2") ||
      (userLevel === "A2" && story.level === "B1")
    ) {
      score += 25;
    }

    const storyVocabKeys = Object.keys(story.vocabularyMap);
    const matchingWords: string[] = [];

    storyVocabKeys.forEach((key) => {
      const vocab = story.vocabularyMap[key];
      const cleanWord = vocab.baseForm.toLowerCase();
      if (savedWordsList.some((sw) => cleanWord.includes(sw) || sw.includes(cleanWord))) {
        matchingWords.push(vocab.word);
        score += 20;
      }
    });

    if (!isCompleted) {
      score += 30;
    }

    let recommendationReason = `Matches your target CEFR level (${story.level})`;
    if (matchingWords.length > 0) {
      recommendationReason = `Reinforces ${matchingWords.length} words from your active flashcards!`;
    } else if (!isCompleted && story.level === userLevel) {
      recommendationReason = `Fresh ${story.level} reading practice suited for your level`;
    }

    return {
      story,
      recommendationScore: score,
      matchingFlashcardWordsCount: matchingWords.length,
      matchingWordsList: matchingWords,
      recommendationReason,
      isCompleted,
    };
  });

  return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, limit);
}

