export type WritingTaskType = "formal_email" | "informal_letter" | "opinion_text";
export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export interface WritingTask {
  id: string;
  slug: string;
  type: WritingTaskType;
  title: string;
  titleDe: string;
  level: CefrLevel;
  scenario: string;
  recipient: string;
  prompt: string;
  bulletPoints: string[];
  minWords: number;
  maxWords: number;
  sampleOpening: string;
  sampleSignOff: string;
  helpfulPhrases: {
    de: string;
    en: string;
  }[];
}

export const WRITING_TASKS: WritingTask[] = [
  // ─── FORMAL EMAILS ────────────────────────────────────────────────────────
  {
    id: "wt-formal-a1",
    slug: "termin-absagen-a1",
    type: "formal_email",
    title: "Rescheduling an Appointment",
    titleDe: "Termin bei der Sprachschule verschieben",
    level: "A1",
    scenario: "You have a German course placement appointment on Friday at 10:00 AM, but you are ill and cannot attend.",
    recipient: "Sprachschule Berlin · Frau Weber",
    prompt: "Write a short, polite email to Frau Weber explaining why you cannot come and asking for a new appointment next week.",
    bulletPoints: [
      "Grund für Ihr Schreiben (Krankheit, Absage)",
      "Entschuldigung für die kurzfristige Nachricht",
      "Bitte um einen neuen Termin nächste Woche",
    ],
    minWords: 30,
    maxWords: 60,
    sampleOpening: "Sehr geehrte Frau Weber,",
    sampleSignOff: "Mit freundlichen Grüßen\n[Ihr Name]",
    helpfulPhrases: [
      { de: "Ich kann leider am Freitag nicht kommen, weil ich krank bin.", en: "Unfortunately I cannot come on Friday because I am ill." },
      { de: "Es tut mir sehr leid.", en: "I am very sorry." },
      { de: "Können wir den Termin auf nächste Woche verschieben?", en: "Could we postpone the appointment to next week?" },
      { de: "Vielen Dank für Ihr Verständnis.", en: "Thank you for your understanding." },
    ],
  },
  {
    id: "wt-formal-a2",
    slug: "wohnung-anfrage-a2",
    type: "formal_email",
    title: "Apartment Inquiry & Viewing Request",
    titleDe: "Wohnungsanfrage und Besichtigungstermin",
    level: "A2",
    scenario: "You found a 2-room apartment online in Munich. Write to the landlord Herr Schneider to introduce yourself and request a viewing.",
    recipient: "Vermieter Herr Schneider",
    prompt: "Write a formal email expressing your interest in the flat, giving 2 details about yourself (job, non-smoker), and asking when a viewing is possible.",
    bulletPoints: [
      "Interesse an der 2-Zimmer-Wohnung bekunden",
      "Kurze Vorstellung Ihrer Person (Beruf, ruhige Mieter/in, keine Haustiere)",
      "Frage nach einem Besichtigungstermin und nötigen Unterlagen (Schufa, Gehalt)",
    ],
    minWords: 60,
    maxWords: 100,
    sampleOpening: "Sehr geehrter Herr Schneider,",
    sampleSignOff: "Mit freundlichen Grüßen\n[Ihr Name]",
    helpfulPhrases: [
      { de: "Ich habe Ihre Anzeige im Internet gesehen und interessiere mich sehr für die Wohnung.", en: "I saw your advertisement online and am very interested in the apartment." },
      { de: "Ich arbeite als Ingenieur und suche ein langfristiges Zuhause.", en: "I work as an engineer and am looking for a long-term home." },
      { de: "Wäre eine Besichtigung am Wochenende möglich?", en: "Would a viewing on the weekend be possible?" },
      { de: "Über eine positive Rückmeldung würde ich mich freuen.", en: "I would be delighted by a positive response." },
    ],
  },
  {
    id: "wt-formal-b1",
    slug: "reklamation-b1",
    type: "formal_email",
    title: "Complaint & Refund Claim",
    titleDe: "Beschwerde über eine fehlerhafte Lieferung",
    level: "B1",
    scenario: "You ordered an electronic tablet online, but it arrived damaged with a scratched display and missing charger.",
    recipient: "Kundenservice TechMarkt Online",
    prompt: "Write a formal complaint letter detailing the defects, specifying the order number, and requesting either an immediate replacement or full refund.",
    bulletPoints: [
      "Angabe der Bestellnummer und des Kaufdatums",
      "Präzise Beschreibung der Schäden (zerkratztes Display, fehlendes Ladekabel)",
      "Forderung: Ersatzlieferung oder Rückerstattung innerhalb von 14 Tagen",
    ],
    minWords: 90,
    maxWords: 140,
    sampleOpening: "Sehr geehrte Damen und Herren,",
    sampleSignOff: "Mit freundlichen Grüßen\n[Ihr Name]",
    helpfulPhrases: [
      { de: "Leider entspricht die gelieferte Ware nicht meinen Erwartungen.", en: "Unfortunately the delivered goods do not meet my expectations." },
      { de: "Als ich das Paket öffnete, stellte ich erhebliche Mängel fest.", en: "When I opened the package, I noticed significant defects." },
      { de: "Ich fordere Sie hiermit auf, mir ein fehlerfreies Ersatzgerät zuzusenden.", en: "I hereby request that you send me a defect-free replacement device." },
      { de: "Sollte dies nicht möglich sein, bitte ich um Rückerstattung des Kaufpreises.", en: "Should this not be possible, I request a refund of the purchase price." },
    ],
  },
  {
    id: "wt-formal-b2",
    slug: "bewerbung-praktikum-b2",
    type: "formal_email",
    title: "Internship Cover Letter",
    titleDe: "Bewerbungsschreiben für ein Fachpraktikum",
    level: "B2",
    scenario: "You are applying for a 6-month marketing or software engineering internship at a medium-sized company in Frankfurt.",
    recipient: "Frau Dr. Lindner (Personalabteilung)",
    prompt: "Write a polished professional cover email stating your motivations, current studies/experience, key competencies, and availability.",
    bulletPoints: [
      "Bezugnahme auf die ausgeschriebene Praktikumsstelle",
      "Erläuterung Ihrer bisherigen Studienschwerpunkte und praktischen Erfahrungen",
      "Darlegung Ihrer Motivation für dieses spezifische Unternehmen",
      "Verfügbarkeit und Hinweis auf die beigefügten Bewerbungsunterlagen",
    ],
    minWords: 130,
    maxWords: 190,
    sampleOpening: "Sehr geehrte Frau Dr. Lindner,",
    sampleSignOff: "Mit freundlichen Grüßen\n[Ihr Name]",
    helpfulPhrases: [
      { de: "Mit großem Interesse habe ich Ihre Stellenausschreibung für das Praktikum gelesen.", en: "With great interest I read your internship posting." },
      { de: "Während meines Studiums konnte ich bereits fundierte Kenntnisse im Bereich... erwerben.", en: "During my studies I was already able to acquire solid knowledge in the area of..." },
      { de: "Besonders reizt mich an Ihrem Unternehmen die internationale Ausrichtung.", en: "What particularly attracts me to your company is the international orientation." },
      { de: "Über die Gelegenheit zu einem persönlichen Gespräch freue ich mich sehr.", en: "I look forward to the opportunity for a personal interview." },
    ],
  },

  // ─── INFORMAL LETTERS ─────────────────────────────────────────────────────
  {
    id: "wt-informal-a1",
    slug: "geburtstag-einladung-a1",
    type: "informal_letter",
    title: "Birthday Party Invitation",
    titleDe: "Einladung zur Geburtstagsparty",
    level: "A1",
    scenario: "You are having your birthday party on Saturday evening at your apartment. Invite your friend Jonas.",
    recipient: "Dein Freund Jonas",
    prompt: "Write a warm, informal message inviting Jonas to your party, stating the time, place, and asking what he wants to drink.",
    bulletPoints: [
      "Einladung aussprechen (Wann: Samstag um 19:00 Uhr, Wo: bei dir zu Hause)",
      "Essen und Getränke erwähnen (Pizza und Kuchen)",
      "Bitte um Rückmeldung bis Donnerstag",
    ],
    minWords: 30,
    maxWords: 60,
    sampleOpening: "Lieber Jonas,",
    sampleSignOff: "Liebe Grüße / Bis Samstag!\n[Dein Name]",
    helpfulPhrases: [
      { de: "Ich habe am Samstag Geburtstag und möchte gerne feiern.", en: "It's my birthday on Saturday and I would like to celebrate." },
      { de: "Kommst du auch zu meiner Party?", en: "Are you also coming to my party?" },
      { de: "Sag mir bitte bis Donnerstag Bescheid, ob du Zeit hast.", en: "Please let me know by Thursday if you have time." },
      { de: "Ich freue mich auf dich!", en: "I'm looking forward to seeing you!" },
    ],
  },
  {
    id: "wt-informal-a2",
    slug: "urlaubsgruesse-a2",
    type: "informal_letter",
    title: "Holiday Postcard / Letter from Vienna",
    titleDe: "Urlaubsgrüße aus Wien",
    level: "A2",
    scenario: "You are spending a long weekend in Vienna. Write an email to your friend Julia telling her about your trip.",
    recipient: "Deine Freundin Julia",
    prompt: "Write an informal letter describing your journey, the hotel, the weather, what you visited today, and plans for tomorrow.",
    bulletPoints: [
      "Anreise und Unterkunft beschreiben",
      "Sehenswürdigkeiten und Wiener Kaffeehauskultur erwähnen",
      "Frage nach Julias Wohlbefinden und Treffen nach der Rückkehr",
    ],
    minWords: 60,
    maxWords: 100,
    sampleOpening: "Liebe Julia,",
    sampleSignOff: "Herzliche Grüße aus Wien,\n[Dein Name]",
    helpfulPhrases: [
      { de: "Ich bin gestern gut in Wien angekommen.", en: "I arrived well in Vienna yesterday." },
      { de: "Das Wetter ist herrlich und die Altstadt ist wunderschön.", en: "The weather is wonderful and the old town is beautiful." },
      { de: "Heute Nachmittag habe ich Sachertorte in einem traditionellen Café gegessen.", en: "This afternoon I ate Sachertorte in a traditional café." },
      { de: "Lass uns bald nach meiner Rückkehr einen Kaffee trinken!", en: "Let's grab a coffee soon after my return!" },
    ],
  },
  {
    id: "wt-informal-b1",
    slug: "ratschlag-umzug-b1",
    type: "informal_letter",
    title: "Advice for a Friend's New Job & Move",
    titleDe: "Ratschläge für den Umzug und neuen Job",
    level: "B1",
    scenario: "Your friend Max is moving to Hamburg next month for a new job and feels stressed about finding accommodation and settling in.",
    recipient: "Dein Freund Max",
    prompt: "Write a supportive email giving Max practical advice on house-hunting, calming his anxiety, and offering to help him move.",
    bulletPoints: [
      "Glückwünsche zum neuen Arbeitsplatz",
      "Tipps für die Wohnungssuche in Hamburg (Portale, WGs, Stadtteile)",
      "Hilfsangebot für das Umzugswochenende",
    ],
    minWords: 90,
    maxWords: 140,
    sampleOpening: "Lieber Max,",
    sampleSignOff: "Viele liebe Grüße und Kopf hoch,\n[Dein Name]",
    helpfulPhrases: [
      { de: "Herzlichen Glückwunsch zu deiner neuen Stelle in Hamburg!", en: "Congratulations on your new position in Hamburg!" },
      { de: "Mach dir nicht zu viele Sorgen wegen der Wohnungssuche.", en: "Don't worry too much about the apartment hunt." },
      { de: "An deiner Stelle würde ich zuerst nach einer Übergangs-WG schauen.", en: "In your place, I would look for a temporary flatshare first." },
      { de: "Wenn du beim Kistenschleppen Hilfe brauchst, sag mir einfach Bescheid.", en: "If you need help carrying boxes, just let me know." },
    ],
  },

  // ─── OPINION TEXTS ────────────────────────────────────────────────────────
  {
    id: "wt-opinion-a2",
    slug: "mein-hobby-a2",
    type: "opinion_text",
    title: "My Favorite Leisure Activity",
    titleDe: "Mein Hobby und gesunde Freizeitgestaltung",
    level: "A2",
    scenario: "You are posting in an online German language learner forum discussing leisure activities and sports.",
    recipient: "Sprachforum / Leserinnen und Leser",
    prompt: "Share your thoughts on how people spend their free time today, describe your favorite hobby, why you enjoy it, and why hobbies are important.",
    bulletPoints: [
      "Ihr liebstes Hobby vorstellen (wie oft, mit wem)",
      "Warum Ihnen diese Aktivität Spaß macht (Ausgleich, Energie)",
      "Ihre Meinung: Verbringen Menschen heute zu viel Zeit vor Bildschirmen?",
    ],
    minWords: 60,
    maxWords: 100,
    sampleOpening: "Hallo liebe Community,",
    sampleSignOff: "Was meint ihr dazu? Ich freue mich auf eure Kommentare!\n[Ihr Name]",
    helpfulPhrases: [
      { de: "In meiner Freizeit mache ich am liebsten...", en: "In my free time I like to do... the most." },
      { de: "Meiner Meinung nach ist Bewegung sehr wichtig für die Gesundheit.", en: "In my opinion, exercise is very important for health." },
      { de: "Dabei kann ich mich nach der Arbeit wunderbar entspannen.", en: "I can relax wonderfully after work doing this." },
      { de: "Ich denke, dass viele Menschen zu viel Zeit am Handy verbringen.", en: "I think that many people spend too much time on their phones." },
    ],
  },
  {
    id: "wt-opinion-b1",
    slug: "homeoffice-b1",
    type: "opinion_text",
    title: "Home Office vs. Working in the Office",
    titleDe: "Homeoffice vs. Präsenzarbeit im Büro",
    level: "B1",
    scenario: "Write a structured forum contribution or blog comment on the pros and cons of remote work versus working on-site.",
    recipient: "Online-Magazin 'Arbeitswelt von morgen'",
    prompt: "Present arguments for and against remote work, describe your own situation/experience, and formulate your personal conclusion.",
    bulletPoints: [
      "Vorteile von Homeoffice (Zeitersparnis, Flexibilität, Konzentration)",
      "Nachteile und Risiken (soziale Isolation, Trennung von Arbeit und Freizeit)",
      "Eigene Erfahrungen oder Situation in Ihrem Heimatland",
      "Abschließendes Fazit: Ist ein hybrides Modell die beste Lösung?",
    ],
    minWords: 90,
    maxWords: 150,
    sampleOpening: "Zu dem Thema 'Homeoffice oder Büro?' möchte ich meine Meinung äußern.",
    sampleSignOff: "Zusammenfassend lässt sich sagen, dass ein ausgewogenes Gleichgewicht der Schlüssel zum Erfolg ist.",
    helpfulPhrases: [
      { de: "Einerseits spart man durch das Homeoffice den täglichen Arbeitsweg.", en: "On the one hand, remote work saves the daily commute." },
      { de: "Andererseits fehlt vielen Beschäftigten der persönliche Austausch mit Kollegen.", en: "On the other hand, many employees miss personal exchange with colleagues." },
      { de: "Aus meiner persönlichen Sicht halte ich ein Hybridmodell für optimal.", en: "From my personal perspective, I consider a hybrid model optimal." },
      { de: "Es ist jedoch wichtig, feste Grenzen zwischen Arbeitszeit und Freizeit zu ziehen.", en: "However, it is important to draw firm boundaries between work and free time." },
    ],
  },
  {
    id: "wt-opinion-b2",
    slug: "oepnv-kostenlos-b2",
    type: "opinion_text",
    title: "Free Public Transport for All?",
    titleDe: "Kostenloser öffentlicher Nahverkehr in Großstädten?",
    level: "B2",
    scenario: "You are writing a commentary for a city magazine debate on whether public transit should be completely funded by taxes and free for passengers.",
    recipient: "Redaktion 'Stadt & Umwelt'",
    prompt: "Analyze the ecological, social, and fiscal dimensions of ticket-free public transportation. Conclude with a differentiated perspective.",
    bulletPoints: [
      "Ökologische Argumente (Reduzierung des Individualverkehrs, CO2-Einsparung)",
      "Finanzierungsproblematik (Infrastrukturkosten, Kapazitätsgrenzen, Steuerlast)",
      "Vergleich mit Initiativen wie dem 49-Euro-Ticket (Deutschlandticket)",
      "Persönlicher Lösungsvorschlag für zukunftsfähige Mobilität",
    ],
    minWords: 140,
    maxWords: 200,
    sampleOpening: "Die Debatte um einen kostenfreien öffentlichen Personennahverkehr (ÖPNV) berührt fundamentale Fragen der Klimapolitik.",
    sampleSignOff: "Mein Fazit: Nicht der Nulltarif, sondern verlässliche Qualität und Netzausbau bewegen Menschen zum Umsteigen.",
    helpfulPhrases: [
      { de: "Befürworter argumentieren vor allem mit dem massiven Klimaschutzeffekt.", en: "Proponents argue primarily with the massive climate protection effect." },
      { de: "Kritiker wenden allerdings ein, dass die Finanzierungslücke enorm wäre.", en: "Critics object, however, that the financing gap would be enormous." },
      { de: "Ohne einen massiven Ausbau der Taktung droht eine Überlastung der Züge.", en: "Without a massive expansion of service frequency, trains risk being overwhelmed." },
      { de: "Meines Erachtens ist ein bezahlbares Ticket in Kombination mit hoher Pünktlichkeit der sinnvollste Weg.", en: "In my opinion, an affordable ticket paired with high punctuality is the most sensible path." },
    ],
  },
  {
    id: "wt-opinion-c1",
    slug: "digitalisierung-schule-c1",
    type: "opinion_text",
    title: "Digitalization in Education: Curse or Blessing?",
    titleDe: "Digitalisierung im Bildungswesen – Chance oder Scheininnovation?",
    level: "C1",
    scenario: "Compose an essay for an educational journal evaluating tablets and AI tools in elementary and secondary schools.",
    recipient: "Pädagogische Rundschau",
    prompt: "Examine whether digital devices enhance pedagogy or foster cognitive distraction and social inequality. Present a nuanced thesis.",
    bulletPoints: [
      "Chancen für individuelles Lernen und Medienkompetenz der Schülerinnen und Schüler",
      "Kritische Aspekte: Aufmerksamkeitsspanne, motorische Fertigkeiten, Chancengerechtigkeit",
      "Die veränderte Rolle der Lehrkräfte als Lernbegleiter",
      "Synthese und bildungspolitische Empfehlung",
    ],
    minWords: 180,
    maxWords: 260,
    sampleOpening: "In kaum einem Bereich klafft die Diskrepanz zwischen technologischer Euphorie und ernüchternder Unterrichtsrealität so weit auseinander wie in der schulischen Digitalisierung.",
    sampleSignOff: "Es steht außer Zweifel, dass digitale Werkzeuge das Lehren bereichern können – sie dürfen jedoch die pädagogische Beziehung niemals ersetzen.",
    helpfulPhrases: [
      { de: "Man muss differenzieren zwischen reiner Geräteaustattung und durchdachten didaktischen Konzepten.", en: "One must differentiate between sheer device distribution and well-conceived pedagogical concepts." },
      { de: "Zahlreiche Studien belegen, dass analoge Schreibprozesse die Gedächtnisbildung signifikant vertiefen.", en: "Numerous studies prove that analog handwriting processes significantly deepen memory formation." },
      { de: "Es gilt zu verhindern, dass die sozioökonomische Spaltung der Schülerschaft verschärft wird.", en: "It is crucial to prevent exacerbating socioeconomic disparities among students." },
      { de: "Zusammenfassend lässt sich konstatieren, dass Technik lediglich Mittel zum Zweck sein darf.", en: "In conclusion, it can be stated that technology must remain merely a means to an end." },
    ],
  },
];

export function getWritingTaskById(id: string): WritingTask | undefined {
  return WRITING_TASKS.find((t) => t.id === id || t.slug === id);
}

export function getWritingTasks(filter?: {
  type?: WritingTaskType | "ALL";
  level?: CefrLevel | "ALL";
}): WritingTask[] {
  return WRITING_TASKS.filter((task) => {
    if (filter?.type && filter.type !== "ALL" && task.type !== filter.type) return false;
    if (filter?.level && filter.level !== "ALL" && task.level !== filter.level) return false;
    return true;
  });
}
