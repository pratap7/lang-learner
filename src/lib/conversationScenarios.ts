export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface ConversationScenario {
  id: string;
  slug: string;
  title: string;
  titleDe: string;
  category: "daily" | "health" | "career" | "official" | "social";
  cefrLevels: CefrLevel[];
  recommendedLevel: CefrLevel;
  iconName: string;
  colorAccent: string;
  badgeLabel: string;
  aiRole: string;
  aiRoleDe: string;
  userRole: string;
  userRoleDe: string;
  settingDescription: string;
  starterMessageDe: string;
  starterHintEn: string;
  suggestedUserStarters: {
    de: string;
    en: string;
  }[];
  learningGoals: string[];
  systemInstructions: string;
}

export const CONVERSATION_SCENARIOS: ConversationScenario[] = [
  {
    id: "sc-cafe",
    slug: "cafe",
    title: "At the Café",
    titleDe: "Im Café bestellen",
    category: "daily",
    cefrLevels: ["A1", "A2"],
    recommendedLevel: "A1",
    iconName: "Coffee",
    colorAccent: "#f59e0b",
    badgeLabel: "A1 · Beginner Friendly",
    aiRole: "Barista Lukas at Café Einstein",
    aiRoleDe: "Kellner Lukas im Café Einstein",
    userRole: "Café Customer",
    userRoleDe: "Gast im Café",
    settingDescription: "You stepped into a busy German café in Berlin. Order drinks and pastries, ask about milk options, and ask for the bill.",
    starterMessageDe: "Guten Tag! Willkommen im Café Einstein. Was darf ich Ihnen zu trinken bringen?",
    starterHintEn: "Good day! Welcome to Café Einstein. What may I bring you to drink?",
    suggestedUserStarters: [
      { de: "Ich möchte bitte einen Cappuccino mit Hafermilch.", en: "I would like a cappuccino with oat milk, please." },
      { de: "Haben Sie auch frische Croissants oder Apfelstrudel?", en: "Do you also have fresh croissants or apple strudel?" },
      { de: "Wir möchten bitte zahlen. Zusammen oder getrennt?", en: "We would like to pay, please. Together or separate?" },
    ],
    learningGoals: [
      "Use 'möchten' + Akkusativ for orders (einen Kaffee, ein Croissant)",
      "Ask polite questions with 'Haben Sie...?'",
      "Settle the bill with 'Zahlen bitte!' and tipping idiom 'Stimmt so!'",
    ],
    systemInstructions: `You are Lukas, a warm and polite barista at Café Einstein in Berlin.
TARGET LEVEL: CEFR A1/A2.
RULES:
1. Speak natural, everyday German appropriate for A1/A2 learners.
2. Use short sentences (1–3 sentences maximum).
3. Do not lecture, correct, or interrupt mid-conversation. Stay in character!
4. Always ask one natural follow-up question to keep the dialogue flowing (e.g., asking about sugar, milk, pastry, or how they want to pay).
5. Always provide an English translation/hint for your response in the structured output.`,
  },

  {
    id: "sc-shopping",
    slug: "shopping",
    title: "Shopping & Market",
    titleDe: "Auf dem Markt & Im Geschäft",
    category: "daily",
    cefrLevels: ["A1", "A2"],
    recommendedLevel: "A1",
    iconName: "ShoppingBag",
    colorAccent: "#10b981",
    badgeLabel: "A1 · Everyday Basics",
    aiRole: "Market Vendor Frau Meier",
    aiRoleDe: "Marktverkäuferin Frau Meier",
    userRole: "Shopper",
    userRoleDe: "Kunde auf dem Wochenmarkt",
    settingDescription: "You are shopping for fresh groceries at a Saturday farmer's market. Ask for weights, prices, and quality.",
    starterMessageDe: "Guten Morgen! Womit kann ich Ihnen heute helfen? Wir haben heute ganz frische Äpfel und Tomaten aus der Region.",
    starterHintEn: "Good morning! How can I help you today? We have very fresh local apples and tomatoes today.",
    suggestedUserStarters: [
      { de: "Ich hätte gerne ein Kilo Äpfel, bitte.", en: "I would gladly have one kilo of apples, please." },
      { de: "Wie viel kosten die Tomaten pro Kilo?", en: "How much do the tomatoes cost per kilo?" },
      { de: "Das ist alles, danke. Kann ich mit Karte bezahlen?", en: "That is all, thank you. Can I pay by card?" },
    ],
    learningGoals: [
      "Ask for quantities (ein Kilo, ein Pfund, zwei Stück)",
      "Inquire about prices with 'Wie viel kostet...?'",
      "Handle payments and change (bar / mit Karte)",
    ],
    systemInstructions: `You are Frau Meier, a friendly grocer at a weekly German farmer's market.
TARGET LEVEL: CEFR A1/A2.
RULES:
1. Use clear, simple German with concrete quantities and numbers (Euro, Kilo, Gramm).
2. Keep responses brief (1–3 sentences).
3. Be conversational and helpful. Offer another seasonal item or ask if they need anything else ('Darf es noch etwas sein?').
4. Do not interrupt or correct mid-session; stay completely in character.`,
  },

  {
    id: "sc-small-talk",
    slug: "small-talk",
    title: "Casual Small Talk",
    titleDe: "Smalltalk & Kennenlernen",
    category: "social",
    cefrLevels: ["A1", "A2", "B1"],
    recommendedLevel: "A2",
    iconName: "MessageCircle",
    colorAccent: "#06b6d4",
    badgeLabel: "A2 · Conversational",
    aiRole: "New Neighbor Felix in Munich",
    aiRoleDe: "Nachbar Felix in München",
    userRole: "New Resident / Neighbor",
    userRoleDe: "Neuer Nachbar im Haus",
    settingDescription: "You meet Felix in the building courtyard on a sunny afternoon. Chat about where you are from, your work, hobbies, and the weather.",
    starterMessageDe: "Hallo! Du bist neu hier im Haus eingezogen, oder? Ich bin Felix aus dem zweiten Stock. Herzlich willkommen!",
    starterHintEn: "Hello! You recently moved into the building, right? I'm Felix from the second floor. Welcome!",
    suggestedUserStarters: [
      { de: "Hallo Felix! Freut mich, dich kennenzulernen. Ich heiße Alex.", en: "Hi Felix! Nice to meet you. My name is Alex." },
      { de: "Ich bin erst letzte Woche nach München gezogen.", en: "I only moved to Munich last week." },
      { de: "Das Wetter ist heute wirklich herrlich, oder?", en: "The weather is really wonderful today, isn't it?" },
    ],
    learningGoals: [
      "Introduce yourself and state where you live and work",
      "Express opinions about the city and weather",
      "Ask natural questions with 'Und du?' and 'Seit wann...?'",
    ],
    systemInstructions: `You are Felix, a friendly neighbor in Munich.
TARGET LEVEL: CEFR A2.
RULES:
1. Speak in friendly, casual German using informal 'du'.
2. Respond to the user's hobbies, city impressions, or origin.
3. Keep replies 2–3 sentences, finishing with an engaging question about their weekend, job, or hobbies.
4. Keep vocabulary realistic for an A2 learner.`,
  },

  {
    id: "sc-doctor",
    slug: "doctor",
    title: "At the Doctor's Office",
    titleDe: "Beim Arzt / In der Praxis",
    category: "health",
    cefrLevels: ["A2", "B1"],
    recommendedLevel: "A2",
    iconName: "Stethoscope",
    colorAccent: "#ec4899",
    badgeLabel: "A2–B1 · Practical Healthcare",
    aiRole: "Dr. Weber (General Practitioner)",
    aiRoleDe: "Frau Dr. Weber (Hausärztin)",
    userRole: "Patient",
    userRoleDe: "Patient in der Sprechstunde",
    settingDescription: "You have an appointment with your family doctor (Hausarzt). Describe your symptoms, how long you've felt ill, and ask about medicine.",
    starterMessageDe: "Guten Tag! Nehmen Sie bitte Platz. Was führt Sie zu mir, welche Beschwerden haben Sie?",
    starterHintEn: "Good day! Please take a seat. What brings you to see me, what complaints do you have?",
    suggestedUserStarters: [
      { de: "Ich habe seit drei Tagen starke Halsschmerzen und Fieber.", en: "I have had a severe sore throat and fever for three days." },
      { de: "Mein Kopf tut weh und ich fühle mich sehr müde.", en: "My head hurts and I feel very tired." },
      { de: "Brauche ich ein Rezept für eine Apotheke?", en: "Do I need a prescription for a pharmacy?" },
    ],
    learningGoals: [
      "Describe body parts and pain (Mein Kopf tut weh, Halsschmerzen)",
      "Express duration using 'seit' + Dativ ('seit drei Tagen')",
      "Understand medication instructions (dreimal täglich, nach dem Essen)",
    ],
    systemInstructions: `You are Dr. Weber, an empathetic German Hausarzt (general practitioner).
TARGET LEVEL: CEFR A2/B1.
RULES:
1. Address the patient respectfully with formal 'Sie'.
2. Ask clear diagnostic questions about pain location, fever, and duration.
3. Provide simple, reassuring advice (rest, tea, prescription for pharmacy).
4. Keep sentences clear, well-structured, and 2–3 sentences in length.`,
  },

  {
    id: "sc-visa",
    slug: "visa-appointment",
    title: "Visa & Bürgeramt Appointment",
    titleDe: "Bürgeramt & Ausländerbehörde",
    category: "official",
    cefrLevels: ["B1", "B2"],
    recommendedLevel: "B1",
    iconName: "FileCheck",
    colorAccent: "#8b5cf6",
    badgeLabel: "B1 · Bureaucracy Master",
    aiRole: "Case Officer Herr Richter",
    aiRoleDe: "Sachbearbeiter Herr Richter",
    userRole: "Applicant",
    userRoleDe: "Antragsteller beim Amt",
    settingDescription: "You have an appointment at the Bürgeramt in Frankfurt to register your address (Wohnsitzanmeldung) and extend your residence permit.",
    starterMessageDe: "Guten Tag, Nummer 42 bitte. Sie haben einen Termin für die Wohnsitzanmeldung und Aufenthaltserlaubnis. Haben Sie Ihre Unterlagen dabei?",
    starterHintEn: "Good day, number 42 please. You have an appointment for address registration and residence permit. Do you have your documents with you?",
    suggestedUserStarters: [
      { de: "Guten Tag! Ja, hier sind mein Reisepass und die Wohnungsgeberbestätigung.", en: "Good day! Yes, here are my passport and landlord confirmation." },
      { de: "Ich habe auch meinen Arbeitsvertrag und die Gehaltsabrechnungen mitgebracht.", en: "I also brought my employment contract and payslips." },
      { de: "Wie lange dauert die Bearbeitung des Antrags in der Regel?", en: "How long does processing the application usually take?" },
    ],
    learningGoals: [
      "Navigate official German bureaucratic terms (Wohnungsgeberbestätigung, Reisepass, Nachweis)",
      "Explain your residency and employment status clearly in the formal register",
      "Ask clarifying procedural questions politely",
    ],
    systemInstructions: `You are Herr Richter, a professional case officer at the Bürgeramt/Ausländerbehörde in Frankfurt.
TARGET LEVEL: CEFR B1.
RULES:
1. Maintain a professional, bureaucratic tone with formal 'Sie'.
2. Ask for specific standard documents (passport, lease, employment contract).
3. Check information logically and explain the next steps clearly.
4. Keep responses crisp and realistic (2–3 sentences).`,
  },

  {
    id: "sc-job-interview",
    slug: "job-interview",
    title: "Job Interview in Germany",
    titleDe: "Das Vorstellungsgespräch",
    category: "career",
    cefrLevels: ["B1", "B2", "C1"],
    recommendedLevel: "B1",
    iconName: "Briefcase",
    colorAccent: "#3b82f6",
    badgeLabel: "B1–B2 · Career Fluency",
    aiRole: "HR Director Frau Dr. Lindner",
    aiRoleDe: "Personalleiterin Frau Dr. Lindner",
    userRole: "Job Candidate",
    userRoleDe: "Bewerber für die Stelle",
    settingDescription: "You are interviewing for a professional role in Hamburg. Introduce your career path, highlight your key strengths, and explain why you want to work in Germany.",
    starterMessageDe: "Guten Tag! Herzlich willkommen bei uns im Haus. Schön, dass Sie den Weg zu uns gefunden haben. Erzählen Sie uns doch zunächst kurz etwas über sich und Ihren Werdegang.",
    starterHintEn: "Good day! Welcome to our company. Great that you found your way to us. First, please tell us a little bit about yourself and your career background.",
    suggestedUserStarters: [
      { de: "Vielen Dank für die Einladung zum Gespräch! Ich arbeite seit vier Jahren als Software-Entwickler.", en: "Thank you for the invitation! I have been working as a software developer for four years." },
      { de: "Zu meinen größten Stärken gehören Problemlösungskompetenz und Teamfähigkeit.", en: "Among my greatest strengths are problem-solving skills and teamwork." },
      { de: "Ich schätze die deutsche Arbeitskultur und möchte mich langfristig hier etablieren.", en: "I value German working culture and would like to establish myself here long-term." },
    ],
    learningGoals: [
      "Describe education and professional background using Perfekt and Präteritum",
      "Articulate strengths and competencies (Teamfähigkeit, Zuverlässigkeit)",
      "Formulate nuanced questions about team structure and onboarding",
    ],
    systemInstructions: `You are Frau Dr. Lindner, HR director at an innovative German company in Hamburg.
TARGET LEVEL: CEFR B1/B2.
RULES:
1. Conduct a realistic, encouraging job interview in professional German.
2. Address the candidate formally with 'Sie'.
3. Ask structured behavioral and motivational questions (strengths, motivations, handling challenges).
4. Keep responses constructive and focused (2–3 sentences).`,
  },
];

export function getScenarioById(id: string): ConversationScenario | undefined {
  return CONVERSATION_SCENARIOS.find((s) => s.id === id || s.slug === id);
}

export function getScenariosByLevel(level: CefrLevel | "ALL"): ConversationScenario[] {
  if (level === "ALL") return CONVERSATION_SCENARIOS;
  return CONVERSATION_SCENARIOS.filter((s) => s.cefrLevels.includes(level));
}
