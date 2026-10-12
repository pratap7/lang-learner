"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy, Flame, Award, Shield, Users, Sparkles, Check,
  ChevronUp, ChevronDown, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
  LeaderboardUser,
  getWeeklyLeaderboard,
  isLeaderboardOptedIn,
  setLeaderboardOptIn,
} from "@/lib/gamificationService";
import { playClickSound } from "@/lib/soundEffects";

export function LeaderboardView() {
  const { addToast } = useToast();
  const [optedIn, setOptedIn] = useState(true);
  const [activeLeague, setActiveLeague] = useState<"gold" | "silver" | "bronze">("gold");
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    setOptedIn(isLeaderboardOptedIn());
    setLeaderboard(getWeeklyLeaderboard());
  }, []);

  const handleToggleOptIn = () => {
    playClickSound();
    const nextVal = !optedIn;
    setOptedIn(nextVal);
    setLeaderboardOptIn(nextVal);
    addToast({
      type: nextVal ? "success" : "info",
      title: nextVal ? "Joined Global Leaderboard!" : "Leaderboard Hidden",
      message: nextVal
        ? "Your German study activity will now appear on weekly rankings."
        : "You are now studying privately and hidden from public leaderboards.",
    });
  };

  const currentUser = leaderboard.find((u) => u.isCurrentUser);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* HEADER & OPT-IN BANNER */}
      <div className="p-6 sm:p-7 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] border border-[var(--color-accent-500)]/30">
                Gold League · Wöchentliche Bestenliste
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                Resets in 2 days
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              Study Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Compete with fellow German learners around the world. Top 10 learners advance to Diamond League.
            </p>
          </div>

          {/* Privacy Opt-In Toggle */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto p-2 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)]">
            <div className="text-right">
              <p className="text-xs font-bold text-[var(--color-text-primary)]">
                {optedIn ? "Public Profile" : "Private Mode"}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {optedIn ? "Visible on rankings" : "Hidden from rankings"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleOptIn}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                optedIn
                  ? "bg-[var(--color-brand-500)] text-white shadow-xs"
                  : "bg-[var(--color-surface-3)] text-[var(--color-text-muted)]"
              }`}
              title="Toggle Leaderboard Visibility"
            >
              {optedIn ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
        </div>

        {/* Current User Highlight Banner */}
        {optedIn && currentUser && (
          <div className="p-4 rounded-[var(--radius-xl)] bg-gradient-to-r from-[var(--color-brand-600)]/15 via-[var(--color-accent-600)]/10 to-transparent border border-[var(--color-brand-500)]/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-brand-500)] text-white font-heading font-black text-sm flex items-center justify-center shadow-md">
                #{currentUser.rank}
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-xs font-normal text-[var(--color-text-muted)]">({currentUser.level})</span>
                </p>
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1 text-orange-400 font-semibold">
                    <Flame size={12} className="fill-current" /> {currentUser.streak} days
                  </span>
                  <span>•</span>
                  <span className="font-semibold text-[var(--color-accent-400)]">
                    {currentUser.xp} XP this week
                  </span>
                </div>
              </div>
            </div>

            <Badge variant="primary" size="sm">
              Safely in Promotion Zone
            </Badge>
          </div>
        )}
      </div>

      {/* LEAGUE RANKINGS TABLE */}
      {optedIn ? (
        <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-3">
          <div className="space-y-2">
            {leaderboard.map((user) => {
              const isTop3 = user.rank <= 3;
              const medalColor =
                user.rank === 1 ? "text-amber-400 bg-amber-400/15 border-amber-400/30" :
                user.rank === 2 ? "text-slate-300 bg-slate-300/15 border-slate-300/30" :
                user.rank === 3 ? "text-amber-700 bg-amber-700/15 border-amber-700/30" :
                "text-[var(--color-text-muted)] bg-[var(--color-surface-2)] border-[var(--color-border)]";

              return (
                <div
                  key={user.id}
                  className={`p-3.5 sm:p-4 rounded-[var(--radius-xl)] border transition-all flex items-center justify-between gap-4 ${
                    user.isCurrentUser
                      ? "bg-[var(--color-brand-600)]/15 border-[var(--color-brand-500)] shadow-xs ring-1 ring-[var(--color-brand-500)]/40"
                      : "bg-[var(--color-surface-2)]/40 border-[var(--color-border)] hover:bg-[var(--color-surface-2)]"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank Badge */}
                    <span className={`w-8 h-8 rounded-lg border font-heading font-extrabold text-xs flex items-center justify-center shrink-0 ${medalColor}`}>
                      {user.rank === 1 ? "🥇" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                    </span>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl sm:text-2xl">{user.avatar}</span>
                      <div>
                        <p className={`text-xs sm:text-sm font-bold ${
                          user.isCurrentUser ? "text-[var(--color-brand-400)]" : "text-[var(--color-text-primary)]"
                        }`}>
                          {user.name}
                        </p>
                        <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase">
                          {user.level} Track
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Streak & XP */}
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="hidden sm:flex items-center gap-1 text-xs font-semibold text-orange-400">
                      <Flame size={13} className="fill-current" /> {user.streak}d
                    </span>

                    <span className="font-heading font-extrabold text-sm sm:text-base text-[var(--color-text-primary)]">
                      {user.xp} <span className="text-xs font-normal text-[var(--color-text-muted)]">XP</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] flex items-center justify-center mx-auto">
            <EyeOff size={28} />
          </div>
          <h3 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
            Leaderboard is Currently Disabled
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto leading-relaxed">
            You have chosen to study privately. You can enable the leaderboard anytime to participate in weekly leagues and celebrate milestones with other learners.
          </p>
          <Button variant="primary" size="md" onClick={handleToggleOptIn}>
            Enable Public Leaderboard
          </Button>
        </div>
      )}
    </div>
  );
}
