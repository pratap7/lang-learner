export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null; // YYYY-MM-DD
  freezeCredits: number;
  isFreezeEquipped: boolean;
  freezeUsedDates: string[];
  todayCompleted: boolean;
}

const STORAGE_KEY = "deutschpfad_streak_data";

export function getTodayDateStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function getYesterdayDateStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export function getStreakData(): StreakData {
  const defaultData: StreakData = {
    currentStreak: 5,
    longestStreak: 14,
    lastActivityDate: getYesterdayDateStr(), // active streak from yesterday
    freezeCredits: 2,
    isFreezeEquipped: true,
    freezeUsedDates: [],
    todayCompleted: false,
  };

  if (typeof window === "undefined") return defaultData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(raw);
    
    // Check if today was completed
    const today = getTodayDateStr();
    const todayCompleted = parsed.lastActivityDate === today;

    return {
      ...defaultData,
      ...parsed,
      todayCompleted,
    };
  } catch {
    return defaultData;
  }
}

export function saveStreakData(data: StreakData): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // Update profile cache as well
      const profileRaw = localStorage.getItem("deutschpfad_user_profile");
      if (profileRaw) {
        const p = JSON.parse(profileRaw);
        p.streak_count = data.currentStreak;
        localStorage.setItem("deutschpfad_user_profile", JSON.stringify(p));
      }
    } catch {}
  }
}

/**
 * Pure streak state transition function for deterministic testing and business logic.
 */
export function calculateNextStreak(
  current: StreakData,
  todayStr: string = getTodayDateStr()
): { nextStreak: StreakData; freezeUsed: boolean; streakReset: boolean } {
  // If already completed on this date, state is unchanged
  if (current.lastActivityDate === todayStr) {
    return {
      nextStreak: { ...current, todayCompleted: true },
      freezeUsed: false,
      streakReset: false,
    };
  }

  // Calculate day difference
  let daysDiff = 1;
  if (current.lastActivityDate) {
    const last = new Date(current.lastActivityDate).getTime();
    const now = new Date(todayStr).getTime();
    const diffMs = now - last;
    daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  let nextStreakCount = 1;
  let freezeUsed = false;
  let streakReset = false;
  let nextFreezeCredits = current.freezeCredits;
  let nextIsFreezeEquipped = current.isFreezeEquipped;
  const nextFreezeUsedDates = [...current.freezeUsedDates];

  if (!current.lastActivityDate) {
    // Brand new user first activity
    nextStreakCount = 1;
  } else if (daysDiff === 1) {
    // Normal consecutive day
    nextStreakCount = current.currentStreak + 1;
  } else if (daysDiff === 2 && current.isFreezeEquipped && current.freezeCredits > 0) {
    // Missed exactly 1 day, absorbed by equipped Streak Freeze shield
    freezeUsed = true;
    nextFreezeCredits = Math.max(0, current.freezeCredits - 1);
    nextIsFreezeEquipped = nextFreezeCredits > 0;
    
    // Calculate the missed day string
    const missedDate = new Date(current.lastActivityDate);
    missedDate.setDate(missedDate.getDate() + 1);
    const missedDateStr = missedDate.toISOString().split("T")[0];
    nextFreezeUsedDates.push(missedDateStr);

    nextStreakCount = current.currentStreak + 1;
  } else {
    // Streak broken / reset
    streakReset = true;
    nextStreakCount = 1;
  }

  const nextLongest = Math.max(nextStreakCount, current.longestStreak);

  const nextStreak: StreakData = {
    ...current,
    currentStreak: nextStreakCount,
    longestStreak: nextLongest,
    lastActivityDate: todayStr,
    todayCompleted: true,
    freezeCredits: nextFreezeCredits,
    isFreezeEquipped: nextIsFreezeEquipped,
    freezeUsedDates: nextFreezeUsedDates,
  };

  return { nextStreak, freezeUsed, streakReset };
}

export function recordStreakActivity(): StreakData {
  const current = getStreakData();
  const today = getTodayDateStr();

  const { nextStreak } = calculateNextStreak(current, today);
  saveStreakData(nextStreak);
  return nextStreak;
}


export function toggleFreezeEquipped(): StreakData {
  const current = getStreakData();
  if (current.freezeCredits <= 0 && !current.isFreezeEquipped) {
    return current;
  }

  const updated: StreakData = {
    ...current,
    isFreezeEquipped: !current.isFreezeEquipped,
  };

  saveStreakData(updated);
  return updated;
}

export function purchaseFreezeWithXp(xpCost: number = 100): { success: boolean; data: StreakData; message: string } {
  const current = getStreakData();
  if (typeof window === "undefined") {
    return { success: false, data: current, message: "Client only" };
  }

  const profileRaw = localStorage.getItem("deutschpfad_user_profile");
  let currentXp = 250;
  let profileObj: any = null;

  if (profileRaw) {
    try {
      profileObj = JSON.parse(profileRaw);
      currentXp = profileObj.xp_points || 0;
    } catch {}
  }

  if (currentXp < xpCost) {
    const needed = xpCost - currentXp;
    return {
      success: false,
      data: current,
      message: `You need ${needed} more XP to equip a Streak Shield (you have ${currentXp}/${xpCost} XP). Complete a quick lesson to earn the remaining balance.`,
    };
  }

  // Deduct XP
  if (profileObj) {
    profileObj.xp_points = currentXp - xpCost;
    localStorage.setItem("deutschpfad_user_profile", JSON.stringify(profileObj));
  }

  const updated: StreakData = {
    ...current,
    freezeCredits: current.freezeCredits + 1,
    isFreezeEquipped: true,
  };

  saveStreakData(updated);
  return {
    success: true,
    data: updated,
    message: "Streak Shield equipped! Your daily study momentum is safely protected.",
  };
}

export function getHoursUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diffHours = (midnight.getTime() - now.getTime()) / (1000 * 60 * 60);
  return Math.max(0, Math.round(diffHours));
}
