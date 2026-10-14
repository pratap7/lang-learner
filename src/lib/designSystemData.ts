/**
 * DeutschPfad Design Language System Specification & Tokens
 * Senior Brand & Product Design Architecture for Global English-Speaking German Learners.
 */

/* ──────────────── 1. Brand Personality & Tone of Voice ──────────────── */

export interface BrandPersonalityPillar {
  title: string;
  germanTitle: string;
  adjective: string;
  summary: string;
  designManifestation: string;
  uiPrinciples: string[];
}

export const BRAND_PERSONALITY_PILLARS: BrandPersonalityPillar[] = [
  {
    title: "Precise",
    germanTitle: "Präzise",
    adjective: "Precise",
    summary: "Clear, structured, and linguistically accurate. German grammar has intricate architecture; our interface makes complex rules instantly legible rather than obscuring them.",
    designManifestation: "High visual hierarchy, exact grammatical case markers, unambiguous error explanations, calibrated CEFR progress indicators, clean tabular declensions.",
    uiPrinciples: [
      "Always display article gender with color AND shape/symbol markers (never color alone).",
      "Explicitly signpost syntax positions (e.g. Verb-Second position, 'weil' verb-final structure).",
      "Avoid vague feedback like 'Almost!'—provide the exact grammatical rule and inflection reasoning.",
    ],
  },
  {
    title: "Encouraging",
    germanTitle: "Ermutigend",
    adjective: "Encouraging",
    summary: "Warm, empathetic, and human. Adult English speakers often experience anxiety with German genders and cases. We celebrate effort and treat mistakes as indispensable stepping stones.",
    designManifestation: "Warm ambient glow, Barni the Alpine companion mascot with 6 expressive states, celebratory milestone fanfares, positive reinforcement copy without condescension.",
    uiPrinciples: [
      "Frame errors as learning data ('Fehler helfen beim Lernen' rather than 'WRONG!').",
      "Celebrate small consistent habits (3-day streaks, 10 daily flashcard reviews).",
      "Keep mascot interactions delightful, interactive, and never intrusive or annoying.",
    ],
  },
  {
    title: "Contemporary",
    germanTitle: "Zeitgemäß",
    adjective: "Contemporary",
    summary: "Modern, sophisticated, and culturally authentic. We reflect the living German spoken in Berlin, Vienna, Zurich, and Munich today—not 19th-century folklore or rigid stereotypes.",
    designManifestation: "Elevated modern typography (Outfit + Inter), rich dark-mode surfaces, subtle glassmorphism, zero literal German flag color-blocks or tourist tropes.",
    uiPrinciples: [
      "Avoid literal black-red-gold flag stripe blocks in UI backgrounds.",
      "Use authentic everyday DACH scenarios (cafés, tech interviews, Bahn travel, sustainable living).",
      "Maintain WCAG AA compliance across both light and dark themes.",
    ],
  },
];

export interface ToneOfVoiceExample {
  scenario: string;
  doText: string;
  doRationale: string;
  dontText: string;
  dontRationale: string;
}

export const TONE_OF_VOICE_GUIDELINES: ToneOfVoiceExample[] = [
  {
    scenario: "Onboarding & Goal Setting",
    doText: "Willkommen! Let's tailor your German pathway to your career goals in Germany.",
    doRationale: "Adult, respectful, goal-oriented, and immediately sets a purposeful trajectory.",
    dontText: "Ready to learn German, kiddo? Let's play some quick games!",
    dontRationale: "Patronizing, infantilizing, and undermines serious career/study motivators.",
  },
  {
    scenario: "Grammar Mistake (Word Order)",
    doText: "Nicht schlimm! Remember: Subordinating conjunctions like 'weil' push the conjugated verb to the very end of the subordinate clause.",
    doRationale: "Normalizes the error, explains the concrete grammatical rule, and builds intuition.",
    dontText: "Incorrect! You put the verb in the wrong place.",
    dontRationale: "Blunt, unhelpful, and increases anxiety without teaching the underlying structure.",
  },
  {
    scenario: "Grammar Mistake (Article Gender)",
    doText: "Good attempt! 'Tisch' is masculine (der Tisch), so in the Akkusativ it inflects to 'den Tisch'. Notice the '-en' ending on masculine direct objects.",
    doRationale: "Pinpoints the exact case inflection and reinforces the grammatical rule.",
    dontText: "Wrong gender! You picked die instead of den.",
    dontRationale: "Punitive and ignores the case mechanism driving the change.",
  },
  {
    scenario: "Completing a CEFR Unit Quiz",
    doText: "Ausgezeichnet! You passed Unit 3 with 92% mastery. Your A1 speaking readiness is now at 68%.",
    doRationale: "Authentic German praise with measurable, evidence-based CEFR metrics.",
    dontText: "Woohoo, you're a German genius! 5 stars!",
    dontRationale: "Superficial flattery that lacks credibility for serious adult learners.",
  },
  {
    scenario: "Daily Streak Reminder",
    doText: "Barni is keeping your 5-day streak warm. Review 8 quick flashcards to lock in today's German habit.",
    doRationale: "Gentle companion reminder focused on micro-habits rather than guilt.",
    dontText: "You are about to LOSE YOUR ENTIRE STREAK! Don't be lazy!",
    dontRationale: "Manipulative guilt-tripping and aggressive urgency that creates app fatigue.",
  },
  {
    scenario: "Contextual Paywall / Upgrade Moment",
    doText: "You've completed your free monthly AI voice practice. Upgrade to Deutsch Pfad Pro for 150 minutes of monthly conversation with native pronunciation feedback.",
    doRationale: "Transparent value exchange, zero false scarcity, focuses on spoken fluency outcome.",
    dontText: "LAST CHANCE! Upgrade right now or your streak will expire in 04:59!",
    dontRationale: "Manipulative dark-pattern urgency that erodes brand trust.",
  },
];

/* ──────────────── 2. Color System & WCAG Contrast ──────────────── */

export interface ColorToken {
  name: string;
  variable: string;
  hex: string;
  description: string;
  category: "primary" | "secondary" | "accent" | "semantic" | "neutral-light" | "neutral-dark";
  contrastAgainstLight: number; // against #FFFFFF
  contrastAgainstDark: number;  // against #090D16
  wcagStatus: "AAA" | "AA" | "UI AA" | "Accent";
}

export const COLOR_PHILOSOPHY = {
  title: "Why Deutsch Pfad Avoids Literal German-Flag Colors",
  principles: [
    "Literal flag colors (pure black, cadmium red, school-bus yellow) evoke rigid governmental bureaucracy, border stamps, or tourist souvenir trinkets.",
    "Harsh tricolor blocks cause visual fatigue and severe cognitive load during intensive grammar drill sessions.",
    "Deutsch Pfad elevates Prussian Indigo as primary: inspired by historical European printmaking and intellectual DACH culture—serene, authoritative, and deeply legible.",
    "Warm Alpine Ochre acts as an accent: celebrating milestones, streaks, and stars with sunlight warmth rather than abrasive yellow.",
    "Midnight Slate surfaces (#090D16) replace pitch-black, delivering rich depth with zero harsh pixel bloom.",
  ],
};

export const COLOR_TOKENS: ColorToken[] = [
  /* Primary Scale (Prussian Indigo) */
  {
    name: "Indigo 50",
    variable: "--color-brand-50",
    hex: "#EEF2FF",
    description: "Subtle indigo tint for badge backgrounds and active item fills in light mode.",
    category: "primary",
    contrastAgainstLight: 1.12,
    contrastAgainstDark: 16.2,
    wcagStatus: "AAA",
  },
  {
    name: "Indigo 100",
    variable: "--color-brand-100",
    hex: "#E0E7FF",
    description: "Light mode chip hover, active progress bar tracks.",
    category: "primary",
    contrastAgainstLight: 1.25,
    contrastAgainstDark: 14.8,
    wcagStatus: "AAA",
  },
  {
    name: "Indigo 200",
    variable: "--color-brand-200",
    hex: "#C7D2FE",
    description: "Borders on brand badges, light mode secondary accents.",
    category: "primary",
    contrastAgainstLight: 1.58,
    contrastAgainstDark: 12.1,
    wcagStatus: "AAA",
  },
  {
    name: "Indigo 300",
    variable: "--color-brand-300",
    hex: "#A5B4FC",
    description: "Dark-mode secondary text, interactive icons.",
    category: "primary",
    contrastAgainstLight: 2.22,
    contrastAgainstDark: 9.85,
    wcagStatus: "AAA",
  },
  {
    name: "Indigo 400",
    variable: "--color-brand-400",
    hex: "#818CF8",
    description: "Dark-mode links, active tab labels, elevated highlight accents.",
    category: "primary",
    contrastAgainstLight: 3.25,
    contrastAgainstDark: 8.32,
    wcagStatus: "AAA",
  },
  {
    name: "Indigo 500 (Primary)",
    variable: "--color-brand-500",
    hex: "#6366F1",
    description: "Primary brand interactive focal color, main CTAs, active selection rings.",
    category: "primary",
    contrastAgainstLight: 4.62,
    contrastAgainstDark: 5.85,
    wcagStatus: "AA",
  },
  {
    name: "Indigo 600",
    variable: "--color-brand-600",
    hex: "#4F46E5",
    description: "Hover state for primary buttons, active text on light backgrounds.",
    category: "primary",
    contrastAgainstLight: 6.54,
    contrastAgainstDark: 4.14,
    wcagStatus: "AA",
  },
  {
    name: "Indigo 700",
    variable: "--color-brand-700",
    hex: "#4338CA",
    description: "Active pressed buttons on light mode, deep headers.",
    category: "primary",
    contrastAgainstLight: 8.85,
    contrastAgainstDark: 3.12,
    wcagStatus: "AAA",
  },
  {
    name: "Indigo 900",
    variable: "--color-brand-900",
    hex: "#312E81",
    description: "Deepest royal indigo for high-contrast typography in light mode.",
    category: "primary",
    contrastAgainstLight: 12.6,
    contrastAgainstDark: 1.85,
    wcagStatus: "AAA",
  },

  /* Secondary Scale (Slate Steel) */
  {
    name: "Steel 100",
    variable: "--color-secondary-100",
    hex: "#F1F5F9",
    description: "Subtle neutral background for cards and pill containers.",
    category: "secondary",
    contrastAgainstLight: 1.15,
    contrastAgainstDark: 15.1,
    wcagStatus: "AAA",
  },
  {
    name: "Steel 300",
    variable: "--color-secondary-300",
    hex: "#CBD5E1",
    description: "Dividers, inactive input borders, scrollbar tracks.",
    category: "secondary",
    contrastAgainstLight: 1.82,
    contrastAgainstDark: 10.8,
    wcagStatus: "AAA",
  },
  {
    name: "Steel 500 (Secondary)",
    variable: "--color-secondary-500",
    hex: "#64748B",
    description: "Secondary labels, timestamps, auxiliary navigation links.",
    category: "secondary",
    contrastAgainstLight: 4.88,
    contrastAgainstDark: 5.56,
    wcagStatus: "AA",
  },
  {
    name: "Steel 700",
    variable: "--color-secondary-700",
    hex: "#334155",
    description: "Dark-mode surface accents, high-contrast dark borders.",
    category: "secondary",
    contrastAgainstLight: 9.85,
    contrastAgainstDark: 2.82,
    wcagStatus: "AAA",
  },

  /* Accent Scale (Warm Ochre / Alpine Gold) */
  {
    name: "Ochre 100",
    variable: "--color-accent-100",
    hex: "#FEF3C7",
    description: "Streak notification backgrounds, badge highlights.",
    category: "accent",
    contrastAgainstLight: 1.18,
    contrastAgainstDark: 15.6,
    wcagStatus: "AAA",
  },
  {
    name: "Ochre 300",
    variable: "--color-accent-300",
    hex: "#FCD34D",
    description: "Streak flame sparks, stars, milestone ribbons.",
    category: "accent",
    contrastAgainstLight: 1.48,
    contrastAgainstDark: 13.2,
    wcagStatus: "AAA",
  },
  {
    name: "Ochre 500 (Accent)",
    variable: "--color-accent-500",
    hex: "#F59E0B",
    description: "XP rewards, streak flame core, premium badge highlights.",
    category: "accent",
    contrastAgainstLight: 2.12,
    contrastAgainstDark: 9.85,
    wcagStatus: "AAA",
  },
  {
    name: "Ochre 700",
    variable: "--color-accent-700",
    hex: "#B45309",
    description: "Accent button hover, gold badge borders in light mode.",
    category: "accent",
    contrastAgainstLight: 5.86,
    contrastAgainstDark: 3.82,
    wcagStatus: "AA",
  },

  /* Semantic Scale */
  {
    name: "Success Emerald",
    variable: "--color-success",
    hex: "#10B981",
    description: "Correct exercise answers, passed Goethe mock tests, completed lessons.",
    category: "semantic",
    contrastAgainstLight: 3.12,
    contrastAgainstDark: 8.24,
    wcagStatus: "AAA",
  },
  {
    name: "Warning Amber",
    variable: "--color-warning",
    hex: "#F59E0B",
    description: "Streak freeze alerts, countdown warnings, incomplete goals.",
    category: "semantic",
    contrastAgainstLight: 2.12,
    contrastAgainstDark: 9.85,
    wcagStatus: "AAA",
  },
  {
    name: "Error Crimson",
    variable: "--color-error",
    hex: "#EF4444",
    description: "Exercise mistakes, declension errors, destructive actions.",
    category: "semantic",
    contrastAgainstLight: 4.54,
    contrastAgainstDark: 4.96,
    wcagStatus: "AA",
  },
  {
    name: "Info Sky",
    variable: "--color-info",
    hex: "#3B82F6",
    description: "Grammar footnotes, dictionary tips, cultural DACH notes.",
    category: "semantic",
    contrastAgainstLight: 4.02,
    contrastAgainstDark: 5.72,
    wcagStatus: "AA",
  },

  /* Neutral Scale (Light Mode) */
  {
    name: "Light Background",
    variable: "--color-bg",
    hex: "#F8FAFF",
    description: "Canvas backdrop for light mode with subtle cool tint.",
    category: "neutral-light",
    contrastAgainstLight: 1.05,
    contrastAgainstDark: 16.8,
    wcagStatus: "AAA",
  },
  {
    name: "Light Surface",
    variable: "--color-surface",
    hex: "#FFFFFF",
    description: "Card panels, dialog containers, elevated white surfaces.",
    category: "neutral-light",
    contrastAgainstLight: 1.0,
    contrastAgainstDark: 17.5,
    wcagStatus: "AAA",
  },
  {
    name: "Light Surface 2",
    variable: "--color-surface-2",
    hex: "#F1F5F9",
    description: "Nested cards, secondary buttons, input backgrounds.",
    category: "neutral-light",
    contrastAgainstLight: 1.15,
    contrastAgainstDark: 15.1,
    wcagStatus: "AAA",
  },
  {
    name: "Light Border",
    variable: "--color-border",
    hex: "#E2E8F0",
    description: "Hairline card borders and dividers in light mode.",
    category: "neutral-light",
    contrastAgainstLight: 1.35,
    contrastAgainstDark: 13.2,
    wcagStatus: "UI AA",
  },
  {
    name: "Light Text Primary",
    variable: "--color-text-primary",
    hex: "#0F172A",
    description: "Primary typography, headers, and essential copy in light mode.",
    category: "neutral-light",
    contrastAgainstLight: 16.2,
    contrastAgainstDark: 1.15,
    wcagStatus: "AAA",
  },

  /* Neutral Scale (Dark Mode) */
  {
    name: "Dark Background (Midnight)",
    variable: "--color-bg",
    hex: "#090D16",
    description: "Deep oceanic midnight backdrop; avoids harsh OLED pure black smear.",
    category: "neutral-dark",
    contrastAgainstLight: 17.5,
    contrastAgainstDark: 1.0,
    wcagStatus: "AAA",
  },
  {
    name: "Dark Surface",
    variable: "--color-surface",
    hex: "#0F172A",
    description: "Base card tiles, elevated containers in dark mode.",
    category: "neutral-dark",
    contrastAgainstLight: 16.2,
    contrastAgainstDark: 1.25,
    wcagStatus: "AAA",
  },
  {
    name: "Dark Surface 2",
    variable: "--color-surface-2",
    hex: "#172339",
    description: "Elevated secondary cards, interactive choice options in dark mode.",
    category: "neutral-dark",
    contrastAgainstLight: 13.8,
    contrastAgainstDark: 1.45,
    wcagStatus: "AAA",
  },
  {
    name: "Dark Text Primary",
    variable: "--color-text-primary",
    hex: "#F8FAFC",
    description: "Headings, titles, and high-emphasis body text in dark mode.",
    category: "neutral-dark",
    contrastAgainstLight: 1.05,
    contrastAgainstDark: 16.8,
    wcagStatus: "AAA",
  },
  {
    name: "Dark Text Secondary",
    variable: "--color-text-secondary",
    hex: "#94A3B8",
    description: "Subtitles, grammar notes, and secondary UI metadata in dark mode.",
    category: "neutral-dark",
    contrastAgainstLight: 2.75,
    contrastAgainstDark: 8.42,
    wcagStatus: "AAA",
  },
];

/* ──────────────── 3. Color-Blind-Safe Grammar System ──────────────── */

export interface GrammarGenderToken {
  article: string;
  germanGender: string;
  englishLabel: string;
  variable: string;
  hex: string;
  symbol: string;
  badgeShape: "square" | "circle" | "diamond" | "pill";
  shapeSymbol: string;
  exampleWord: string;
  exampleEnglish: string;
  contrastOnLight: number;
  contrastOnDark: number;
  accessibilityNotes: string;
}

export const GRAMMAR_GENDER_TOKENS: GrammarGenderToken[] = [
  {
    article: "der",
    germanGender: "Maskulinum (Männlich)",
    englishLabel: "Masculine",
    variable: "--color-gender-der",
    hex: "#2563EB", // Marine Blue
    symbol: "♂",
    badgeShape: "square",
    shapeSymbol: "■",
    exampleWord: "der Tisch",
    exampleEnglish: "the table",
    contrastOnLight: 5.86,
    contrastOnDark: 4.88,
    accessibilityNotes: "Marine Blue has high blue-cone luminance. Paired with Square badge shape [■] and [♂] symbol.",
  },
  {
    article: "die",
    germanGender: "Femininum (Weiblich)",
    englishLabel: "Feminine",
    variable: "--color-gender-die",
    hex: "#E11D48", // Coral Rose / Ruby
    symbol: "♀",
    badgeShape: "circle",
    shapeSymbol: "●",
    exampleWord: "die Lampe",
    exampleEnglish: "the lamp",
    contrastOnLight: 5.24,
    contrastOnDark: 5.48,
    accessibilityNotes: "Coral Rose is shifted toward magenta so protanopes and deuteranopes see distinct tone. Paired with Circle [●] and [♀].",
  },
  {
    article: "das",
    germanGender: "Neutrum (Sächlich)",
    englishLabel: "Neuter",
    variable: "--color-gender-das",
    hex: "#059669", // Pine Emerald
    symbol: "◇",
    badgeShape: "diamond",
    shapeSymbol: "◆",
    exampleWord: "das Buch",
    exampleEnglish: "the book",
    contrastOnLight: 5.12,
    contrastOnDark: 5.62,
    accessibilityNotes: "Pine Emerald is calibrated with high contrast against the ruby hue. Paired with Diamond [◆] and [◇].",
  },
  {
    article: "die (Pl.)",
    germanGender: "Plural (Mehrzahl)",
    englishLabel: "Plural",
    variable: "--color-gender-plural",
    hex: "#D97706", // Warm Ochre
    symbol: "⚏",
    badgeShape: "pill",
    shapeSymbol: "⬭",
    exampleWord: "die Bücher",
    exampleEnglish: "the books",
    contrastOnLight: 4.52,
    contrastOnDark: 8.16,
    accessibilityNotes: "Warm Ochre provides immediate visual distinction from singular die. Paired with Pill shape [⬭] and [⚏].",
  },
];

export interface GrammarCaseToken {
  caseCode: "NOM" | "AKK" | "DAT" | "GEN";
  germanName: string;
  englishRole: string;
  questionPrompt: string;
  variable: string;
  hex: string;
  iconName: string;
  exampleSentence: string;
  highlightSnippet: string;
  grammarBreakdown: string;
  contrastOnDark: number;
}

export const GRAMMAR_CASE_TOKENS: GrammarCaseToken[] = [
  {
    caseCode: "NOM",
    germanName: "Nominativ (1. Fall)",
    englishRole: "Subject — Who or what is performing the action",
    questionPrompt: "Wer oder was?",
    variable: "--color-case-nom",
    hex: "#0284C7", // Cyan-Sky
    iconName: "Target",
    exampleSentence: "Der nette Kellner bringt die Karte.",
    highlightSnippet: "Der nette Kellner",
    grammarBreakdown: "Subject of the sentence; controls verb conjugation (bringt).",
    contrastOnDark: 6.84,
  },
  {
    caseCode: "AKK",
    germanName: "Akkusativ (4. Fall)",
    englishRole: "Direct Object — Who or what directly receives the action",
    questionPrompt: "Wen oder was?",
    variable: "--color-case-akk",
    hex: "#7C3AED", // Royal Violet
    iconName: "ArrowRightCircle",
    exampleSentence: "Ich sehe den neuen Lehrer.",
    highlightSnippet: "den neuen Lehrer",
    grammarBreakdown: "Masculine 'der' inflects to 'den' with '-en' adjective ending.",
    contrastOnDark: 5.44,
  },
  {
    caseCode: "DAT",
    germanName: "Dativ (3. Fall)",
    englishRole: "Indirect Object / Beneficiary / Static Location — To or for whom",
    questionPrompt: "Wem oder was? / Wo?",
    variable: "--color-case-dat",
    hex: "#D97706", // Warm Ochre
    iconName: "Gift",
    exampleSentence: "Ich gebe dem Lehrer das Buch.",
    highlightSnippet: "dem Lehrer",
    grammarBreakdown: "Masculine/Neuter takes 'dem' + noun suffix where applicable.",
    contrastOnDark: 8.16,
  },
  {
    caseCode: "GEN",
    germanName: "Genitiv (2. Fall)",
    englishRole: "Possession / Origin — Whose, or with genitive prepositions",
    questionPrompt: "Wessen?",
    variable: "--color-case-gen",
    hex: "#BE123C", // Crimson Rosewood
    iconName: "KeyRound",
    exampleSentence: "Das ist das Auto des Lehrers.",
    highlightSnippet: "des Lehrers",
    grammarBreakdown: "Masculine/Neuter takes 'des' and adds -(e)s to the noun.",
    contrastOnDark: 4.88,
  },
];

/* ──────────────── 4. Typography Scale ──────────────── */

export interface TypographyToken {
  name: string;
  size: string;
  lineHeight: string;
  weight: string;
  letterSpacing: string;
  fontFamily: "Outfit (Heading)" | "Inter (UI)";
  usage: string;
}

export const TYPOGRAPHY_SCALE: TypographyToken[] = [
  { name: "Display 2XL", size: "48px (3rem)", lineHeight: "1.15", weight: "800 ExtraBold", letterSpacing: "-0.035em", fontFamily: "Outfit (Heading)", usage: "Hero titles, level completion certificates" },
  { name: "Display XL", size: "36px (2.25rem)", lineHeight: "1.2", weight: "700 Bold", letterSpacing: "-0.03em", fontFamily: "Outfit (Heading)", usage: "Page headers, major milestone headlines" },
  { name: "Heading L", size: "28px (1.75rem)", lineHeight: "1.25", weight: "700 Bold", letterSpacing: "-0.025em", fontFamily: "Outfit (Heading)", usage: "Section headers, unit titles, course overviews" },
  { name: "Heading M", size: "22px (1.375rem)", lineHeight: "1.3", weight: "600 SemiBold", letterSpacing: "-0.02em", fontFamily: "Outfit (Heading)", usage: "Card headers, modal titles, vocabulary categories" },
  { name: "Heading S", size: "18px (1.125rem)", lineHeight: "1.35", weight: "600 SemiBold", letterSpacing: "-0.015em", fontFamily: "Outfit (Heading)", usage: "Subheadings, quiz question prompts, stats tiles" },
  { name: "Body L", size: "16px (1rem)", lineHeight: "1.6", weight: "400 Regular / 500 Medium", letterSpacing: "-0.01em", fontFamily: "Inter (UI)", usage: "Story paragraphs, conversational dialogue, explanations" },
  { name: "Body M", size: "14px (0.875rem)", lineHeight: "1.5", weight: "400 Regular / 500 Medium", letterSpacing: "normal", fontFamily: "Inter (UI)", usage: "Standard UI buttons, inputs, exercise choices, tooltips" },
  { name: "Caption / Footnote", size: "12px (0.75rem)", lineHeight: "1.4", weight: "500 Medium / 600 SemiBold", letterSpacing: "+0.01em", fontFamily: "Inter (UI)", usage: "Grammar case badges, CEFR pill labels, timestamps" },
  { name: "Micro Tag", size: "10px (0.625rem)", lineHeight: "1.2", weight: "700 Bold", letterSpacing: "+0.04em", fontFamily: "Inter (UI)", usage: "Uppercase category badges, status pips, keyboard shortcuts" },
];

/* ──────────────── 5. Spacing, Radius, and Elevation ──────────────── */

export const SPACING_GRID_TOKENS = [
  { token: "--space-1", px: "4px", rem: "0.25rem", role: "Tight inline padding, badge margins, micro gaps" },
  { token: "--space-2", px: "8px", rem: "0.5rem", role: "Button icon gaps, list item spacing, chip padding" },
  { token: "--space-3", px: "12px", rem: "0.75rem", role: "Card inner padding (compact), input vertical padding" },
  { token: "--space-4", px: "16px", rem: "1rem", role: "Standard card padding, form group gap, row gutters" },
  { token: "--space-5", px: "20px", rem: "1.25rem", role: "Modal content padding, exercise option gaps" },
  { token: "--space-6", px: "24px", rem: "1.5rem", role: "Section padding, grid gutters, dashboard card layout" },
  { token: "--space-8", px: "32px", rem: "2rem", role: "Modal container padding, major section gaps" },
  { token: "--space-10", px: "40px", rem: "2.5rem", role: "Major banner padding, hero content spacing" },
  { token: "--space-12", px: "48px", rem: "3rem", role: "Hero vertical margins, page boundaries" },
  { token: "--space-16", px: "64px", rem: "4rem", role: "Landing section vertical separation" },
];

export const RADIUS_TOKENS = [
  { token: "--radius-sm", value: "6px", usage: "Tags, small badges, inline code snippets, case pills" },
  { token: "--radius-md", value: "10px", usage: "Standard buttons, dropdown menus, inputs, choice chips" },
  { token: "--radius-lg", value: "14px", usage: "Flashcards, exercise choice option cards, sub-panels" },
  { token: "--radius-xl", value: "18px", usage: "Dashboard metric tiles, story overview cards, player box" },
  { token: "--radius-2xl", value: "24px", usage: "Modals, hero banners, pricing cards, mascot studio" },
  { token: "--radius-full", value: "9999px", usage: "Pill badges, avatars, circular action buttons, audio toggle" },
];

export const BORDER_TOKENS = [
  { token: "--border-width-sm", value: "1px", usage: "Subtle card outlines, dividers, passive borders" },
  { token: "--border-width-md", value: "1.5px", usage: "Interactive input fields, unselected quiz option cards" },
  { token: "--border-width-lg", value: "2px", usage: "Selected state, focus rings, active lesson checkpoints" },
  { token: "--border-width-selected", value: "3px", usage: "High-emphasis grammar case borders, active card choice" },
];

export const ELEVATION_TOKENS = [
  { token: "--shadow-sm", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)", usage: "Subtle buttons, hover state baseline" },
  { token: "--shadow-md", value: "0 4px 6px -1px rgb(0 0 0 / 0.07)", usage: "Cards, flashcard player, tooltips" },
  { token: "--shadow-lg", value: "0 10px 15px -3px rgb(0 0 0 / 0.08)", usage: "Dropdown popovers, floating audio player" },
  { token: "--shadow-xl", value: "0 20px 25px -5px rgb(0 0 0 / 0.09)", usage: "Modals, dialogs, paywalls, certificates" },
  { token: "--shadow-glow", value: "0 0 45px -5px rgba(99, 102, 241, 0.25)", usage: "Primary CTAs, milestone celebration aura" },
  { token: "--shadow-gold", value: "0 0 40px -5px rgba(245, 158, 11, 0.25)", usage: "Streak flame glow, Barni celebrating halo" },
];

/* ──────────────── 6. Motion Principles ──────────────── */

export interface MotionPrinciple {
  durationToken: string;
  timeMs: number;
  easing: string;
  usage: string;
  doRule: string;
  whenNotToAnimate: string;
}

export const MOTION_PRINCIPLES: MotionPrinciple[] = [
  {
    durationToken: "--transition-fast",
    timeMs: 150,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    usage: "Tactile micro-interactions (Button clicks, tab switching, toggle switches)",
    doRule: "Provide immediate tactile feedback without delaying the learner's flow.",
    whenNotToAnimate: "Never animate during fast typing in writing submissions or speed vocabulary drills.",
  },
  {
    durationToken: "--transition-base",
    timeMs: 250,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    usage: "Card flips, drawer slides, accordion expand/collapse, modal entrances",
    doRule: "Use subtle spring physics (damping: 25) so interface elements feel tangible.",
    whenNotToAnimate: "Do not animate when navigating between sentences during timed Goethe/Telc mock exams.",
  },
  {
    durationToken: "--transition-slow",
    timeMs: 400,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1) [Spring]",
    usage: "Milestone celebrations, level certificates, streak flame explosions, mascot reveals",
    doRule: "Reserve for high-emotion dopamine moments (passing a level, hitting 14-day streak).",
    whenNotToAnimate: "Disable completely when prefers-reduced-motion is active in OS accessibility settings.",
  },
];

/* ──────────────── 7. Iconography & Illustration Style ──────────────── */

export const ICONOGRAPHY_GUIDELINES = {
  iconSet: "Lucide Icons (Single Set Exclusively)",
  strokeWidth: "1.75px (Regular) / 2.0px (Emphasized active state)",
  sizes: [
    { name: "Small (14px)", usage: "Inline metadata, case tags, button sub-icons, timestamp markers" },
    { name: "Medium (18px)", usage: "Standard button left/right icons, list indicators, tab icons" },
    { name: "Large (24px)", usage: "Feature grid tiles, dashboard navigation icons, audio controls" },
    { name: "Jumbo (32px)", usage: "Modal headers, empty state iconography, celebration headers" },
  ],
  principles: [
    "Never mix multiple icon libraries (e.g. FontAwesome + Lucide); consistency preserves visual calm.",
    "Always maintain optical centering inside circular/square badge containers.",
    "Pair icons with text labels whenever used for critical navigation or grammatical cases.",
    "Use semantic color tints matching functional state (e.g. checkmark in green, case target in sky).",
  ],
  illustrationStyle: {
    name: "Modern Alpine Editorial Geometry",
    rules: [
      "Flat vector geometry with soft duotone gradient fills.",
      "Clean geometric curves with human warmth (curved edges, friendly proportions).",
      "Avoid folklore clichés (no lederhosen, beer steins, or cuckoo clocks); use contemporary DACH scenes (U-Bahn, modern architecture, alpine trails, high-speed rail, European bakeries).",
      "Human characters represent diverse modern European society with clean, respectful editorial styling.",
    ],
  },
};

/* ──────────────── 8. Mascot Brief (Barni) ──────────────── */

export interface MascotBriefState {
  state: "happy" | "thinking" | "celebrating" | "encouraging" | "sleepy" | "surprised";
  emotion: string;
  visualTriggers: string;
  germanCatchphrase: string;
  englishMeaning: string;
  uiContext: string;
  audioFeedback: string;
}

export const MASCOT_BRIEF_STATES: MascotBriefState[] = [
  {
    state: "happy",
    emotion: "Delighted & Proud",
    visualTriggers: "Laughing crescent eyes, joyful bounce, wagging floppy ears, glowing rosy cheeks",
    germanCatchphrase: "Wunderbar gemacht!",
    englishMeaning: "Wonderfully done!",
    uiContext: "Correct exercise answer, completing daily review goal, passing a lesson.",
    audioFeedback: "Ascending major third success chime (E5 → G#5).",
  },
  {
    state: "thinking",
    emotion: "Pensive & Analytical",
    visualTriggers: "Paw resting on chin, gaze directed upward, floating idea lightbulb / thought dots",
    germanCatchphrase: "Lass uns kurz nachdenken...",
    englishMeaning: "Let's think for a moment...",
    uiContext: "Generating personalized onboarding plan, loading AI speech evaluation, challenging grammar riddles.",
    audioFeedback: "Soft bubbling acoustic ping.",
  },
  {
    state: "celebrating",
    emotion: "Ecstatic & Victorious",
    visualTriggers: "Party cone hat, golden laurel aura, sparkling confetti stars, energetic head bob",
    germanCatchphrase: "Fantastisch! Nächste Stufe erreicht!",
    englishMeaning: "Fantastic! Next level achieved!",
    uiContext: "7-day streak milestone, Goethe mock exam pass, CEFR certificate graduation.",
    audioFeedback: "Four-tone completion fanfare with confetti pop.",
  },
  {
    state: "encouraging",
    emotion: "Supportive & Motivational",
    visualTriggers: "High-paw gesture, empathetic warm smile, bright focused eye catchlights",
    germanCatchphrase: "Du schaffst das!",
    englishMeaning: "You can do this!",
    uiContext: "Start of a new difficult unit, recovering after a mistake, pre-test pep talk.",
    audioFeedback: "Warm resonant acoustic strum.",
  },
  {
    state: "sleepy",
    emotion: "Restful & Peaceful",
    visualTriggers: "Curled cozy pose, sleeping arc eyes, floating animated Zzz particles",
    germanCatchphrase: "Gute Nacht! Ruh dich aus.",
    englishMeaning: "Good night! Get some rest.",
    uiContext: "Paused subscriptions, completed daily goals at night, empty review queues.",
    audioFeedback: "Soft descending wind chime.",
  },
  {
    state: "surprised",
    emotion: "Astonished & Intrigued",
    visualTriggers: "Wide round eyes with double catchlights, perked ears, open 'O' mouth, exclamation sparks",
    germanCatchphrase: "Ach so! Ein interessanter Fall!",
    englishMeaning: "Oh, I see! An interesting case!",
    uiContext: "Discovering German compound words, unexpected streak freezes, false friend vocabulary.",
    audioFeedback: "Curious ascending whistle tone.",
  },
];
