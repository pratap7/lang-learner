export interface DayActivity {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue, etc.
  minutesStudied: number;
  xpEarned: number;
  tasksCompleted: number;
  intensity: 0 | 1 | 2 | 3 | 4; // Heatmap intensity level
}

export interface MotivationalQuote {
  german: string;
  english: string;
  authorOrSource: string;
  context: string;
}

export const GERMAN_MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    german: "Übung macht den Meister.",
    english: "Practice makes perfect (literally: Practice makes the master).",
    authorOrSource: "Deutsches Sprichwort",
    context: "Every 15 minutes of deliberate practice compounds into instinctive fluency.",
  },
  {
    german: "Aller Anfang ist schwer, aber Beharrlichkeit führt zum Erfolg.",
    english: "All beginnings are difficult, but persistence leads to success.",
    authorOrSource: "Johann Wolfgang von Goethe",
    context: "German grammar may feel strict at first, but rules soon become second nature.",
  },
  {
    german: "Es ist noch kein Meister vom Himmel gefallen.",
    english: "No master has ever fallen from the sky.",
    authorOrSource: "Deutsches Sprichwort",
    context: "Even native Germans spent years mastering der/die/das. Keep going step by step.",
  },
  {
    german: "Wer fremde Sprachen nicht kennt, weiß nichts von seiner eigenen.",
    english: "He who knows no foreign languages knows nothing of his own.",
    authorOrSource: "Johann Wolfgang von Goethe",
    context: "Learning German will give you deep insight into the structure of thought and language.",
  },
  {
    german: "Schritt für Schritt kommt man ans Ziel.",
    english: "Step by step you reach your goal.",
    authorOrSource: "Deutsches Sprichwort",
    context: "Consistency beats cramming. A 20-minute daily streak outpaces weekend bursts.",
  },
  {
    german: "Wer nicht wagt, der nicht gewinnt.",
    english: "He who does not dare does not win.",
    authorOrSource: "Friedrich Schiller",
    context: "Don't be afraid to make grammatical mistakes when speaking; communication comes first.",
  },
];

export function getTodayQuote(): MotivationalQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayOfYear) % GERMAN_MOTIVATIONAL_QUOTES.length;
  return GERMAN_MOTIVATIONAL_QUOTES[index];
}

const STORAGE_KEY = "deutschpfad_activity_log";

export function getWeeklyActivity(): DayActivity[] {
  const days: DayActivity[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  // Generate last 7 days ending today
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = dayNames[d.getDay()];

    // Generate realistic seeded activity for the past days
    let minutes = 0;
    let xp = 0;
    let tasks = 0;

    if (i === 0) {
      // Today: read from today's session if available
      minutes = 15;
      xp = 45;
      tasks = 2;
    } else if (i === 1) {
      minutes = 25;
      xp = 70;
      tasks = 4;
    } else if (i === 2) {
      minutes = 20;
      xp = 60;
      tasks = 3;
    } else if (i === 3) {
      minutes = 30;
      xp = 90;
      tasks = 5;
    } else if (i === 4) {
      minutes = 0; // rest day protected by freeze
      xp = 0;
      tasks = 0;
    } else if (i === 5) {
      minutes = 25;
      xp = 75;
      tasks = 4;
    } else {
      minutes = 20;
      xp = 60;
      tasks = 3;
    }

    const intensity: 0 | 1 | 2 | 3 | 4 =
      minutes === 0 ? 0 : minutes < 15 ? 1 : minutes < 25 ? 2 : minutes < 35 ? 3 : 4;

    days.push({
      date: dateStr,
      dayLabel,
      minutesStudied: minutes,
      xpEarned: xp,
      tasksCompleted: tasks,
      intensity,
    });
  }

  return days;
}

// 12-week activity grid (84 days) for the GitHub/Duolingo style heatmap
export function getTwelveWeeksActivity(): { date: string; intensity: 0 | 1 | 2 | 3 | 4; minutes: number }[] {
  const list: { date: string; intensity: 0 | 1 | 2 | 3 | 4; minutes: number }[] = [];
  const today = new Date();

  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Seed realistic pattern: active most weekdays, lighter on some weekends
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const randomMod = (d.getDate() * 7 + i * 3) % 10;

    let minutes = 0;
    if (i < 14) {
      // Recent two weeks have strong activity
      minutes = isWeekend ? (randomMod > 4 ? 20 : 0) : randomMod > 1 ? 25 : 10;
    } else {
      // Past activity
      minutes = randomMod > 3 ? (isWeekend ? 15 : 20) : 0;
    }

    const intensity: 0 | 1 | 2 | 3 | 4 =
      minutes === 0 ? 0 : minutes < 15 ? 1 : minutes < 25 ? 2 : minutes < 35 ? 3 : 4;

    list.push({ date: dateStr, intensity, minutes });
  }

  return list;
}
