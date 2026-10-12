"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Mail, Clock, Calendar, Flame,
  Award, Save, LogOut, ShieldCheck, Sparkles,
  BookOpen, ArrowRight, CheckCircle2, Zap
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile, LearningReason, CefrLevel, DailyStudyMinutes } from "@/types/database.types";

export function ProfileSettingsView() {
  const router = useRouter();
  const { addToast } = useToast();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState<LearningReason>("work");
  const [currentLevel, setCurrentLevel] = useState<CefrLevel>("beginner");
  const [targetLevel, setTargetLevel] = useState<CefrLevel>("b1");
  const [dailyMinutes, setDailyMinutes] = useState<DailyStudyMinutes>(20);
  const [examDate, setExamDate] = useState("");

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        // 1. Try fetching from Supabase
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || "");
          const { data, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data && !error) {
            setProfile(data as UserProfile);
            setFullName(data.full_name || "");
            setReason(data.learning_reason || "work");
            setCurrentLevel(data.current_level || "beginner");
            setTargetLevel(data.target_level || "b1");
            setDailyMinutes(data.daily_study_minutes || 20);
            setExamDate(data.target_exam_date || "");
            setLoading(false);
            return;
          }
        }

        // 2. Fallback to localStorage (for demo or pre-sync mode)
        const stored = localStorage.getItem("deutschpfad_user_profile");
        if (stored) {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setFullName(parsed.full_name || "German Learner");
          setEmail(parsed.email || "learner@example.com");
          setReason(parsed.learning_reason || "work");
          setCurrentLevel(parsed.current_level || "beginner");
          setTargetLevel(parsed.target_level || "b1");
          setDailyMinutes(parsed.daily_study_minutes || 20);
          setExamDate(parsed.target_exam_date || "");
        } else {
          // Default mock
          setProfile({
            id: "demo",
            full_name: "Alex Schneider",
            avatar_url: null,
            learning_reason: "work",
            current_level: "beginner",
            target_level: "b1",
            target_exam_date: null,
            daily_study_minutes: 20,
            onboarding_completed: true,
            streak_count: 5,
            xp_points: 250,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setFullName("Alex Schneider");
          setEmail("alex@example.com");
        }
      } catch (err) {
        console.warn("Failed loading user profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase]);

  const handleSaveLearningPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatePayload = {
      learning_reason: reason,
      current_level: currentLevel,
      target_level: targetLevel,
      daily_study_minutes: dailyMinutes,
      target_exam_date: examDate || null,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_profiles")
          .update(updatePayload)
          .eq("id", user.id);
      }

      // Update local storage
      const stored = localStorage.getItem("deutschpfad_user_profile");
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, ...updatePayload };
      localStorage.setItem("deutschpfad_user_profile", JSON.stringify(updated));
      setProfile((p) => (p ? { ...p, ...updatePayload } : null));

      addToast({
        type: "success",
        title: "Plan updated!",
        message: "Your learning path and daily goals have been successfully saved.",
      });
    } catch {
      addToast({
        type: "error",
        title: "Update failed",
        message: "Could not save changes. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("user_profiles")
          .update({ full_name: fullName, updated_at: new Date().toISOString() })
          .eq("id", user.id);
      }

      const stored = localStorage.getItem("deutschpfad_user_profile");
      const current = stored ? JSON.parse(stored) : {};
      localStorage.setItem(
        "deutschpfad_user_profile",
        JSON.stringify({ ...current, full_name: fullName })
      );
      setProfile((p) => (p ? { ...p, full_name: fullName } : null));

      addToast({
        type: "success",
        title: "Profile saved",
        message: "Your profile details have been updated.",
      });
    } catch {
      addToast({
        type: "error",
        title: "Update failed",
        message: "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore
    }
    document.cookie = "deutschpfad_demo_user=; path=/; max-age=0";
    localStorage.removeItem("deutschpfad_user_profile");
    addToast({
      type: "info",
      title: "Signed out",
      message: "You have been logged out of your session.",
    });
    router.push("/auth/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-10 h-10 border-2 border-[var(--color-brand-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading your profile...</p>
      </div>
    );
  }

  const streak = profile?.streak_count || 1;
  const xp = profile?.xp_points || 50;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Top Banner Card */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] mb-8 relative overflow-hidden">
        {/* Subtle German flag tricolor bar at top */}
        <div className="h-1 w-full tricolor-stripe absolute top-0 left-0 right-0 opacity-90" />
        
        {/* Ambient lighting glow */}
        <div className="absolute top-0 right-0 w-96 h-48 bg-gradient-to-l from-[var(--color-brand-500)]/15 via-[var(--color-accent-500)]/5 to-transparent pointer-events-none blur-2xl" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          {/* User info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-brand-500)] via-[var(--color-brand-600)] to-[var(--color-accent-500)] flex items-center justify-center text-white font-heading text-2xl font-bold shadow-md ring-2 ring-[var(--color-border)]">
                {fullName ? fullName[0]?.toUpperCase() : "D"}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-success)] ring-2 ring-[var(--color-surface)]" title="Online" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)]">
                  {fullName || "Learner"}
                </h1>
                <Badge variant="primary" size="sm">
                  {profile?.target_level ? profile.target_level.toUpperCase() : "B1"} Goal
                </Badge>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 flex items-center gap-1.5">
                <Mail size={12} /> {email || "account@deutschpfad.com"}
              </p>
            </div>
          </div>

          {/* Quick Stats Strip */}
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex-1 sm:flex-initial p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[90px] shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[var(--color-accent-500)] mb-0.5">
                <Flame size={16} />
                <span className="font-heading text-lg font-bold">{streak}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">Day Streak</p>
            </div>

            <div className="flex-1 sm:flex-initial p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[90px] shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[var(--color-brand-400)] mb-0.5">
                <Sparkles size={16} />
                <span className="font-heading text-lg font-bold">{xp}</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">Total XP</p>
            </div>

            <div className="flex-1 sm:flex-initial p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-center min-w-[90px] shadow-sm">
              <div className="flex items-center justify-center gap-1 text-[var(--color-success)] mb-0.5">
                <Clock size={16} />
                <span className="font-heading text-lg font-bold">{dailyMinutes}m</span>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)]">Daily Pace</p>
            </div>
          </div>
        </div>

        {/* Quick Action Strip */}
        <div className="mt-6 pt-5 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5 text-xs text-[var(--color-text-secondary)]">
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
            <span>Ready for today&apos;s session: <strong>1 Unit + 15 Vocabulary Cards</strong></span>
          </div>
          <Link href="/courses/a1">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Zap size={14} className="text-[var(--color-accent-400)]" />}
              rightIcon={<ArrowRight size={13} />}
            >
              Start Daily Practice
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultTab="plan" variant="line">
        <TabsList className="mb-6">
          <TabsTrigger value="plan">Learning Plan & Goals</TabsTrigger>
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
        </TabsList>

        {/* TAB 1: Learning Plan */}
        <TabsContent value="plan">
          <form
            onSubmit={handleSaveLearningPlan}
            className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6"
          >
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Personalised German Curriculum
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Customize your target proficiency, study rhythm, and curriculum focus.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  Primary Motivation
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as LearningReason)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-border-2)] transition-all cursor-pointer"
                >
                  <option value="travel">✈️ Travel & Holidays</option>
                  <option value="work">💼 Career & Work</option>
                  <option value="study">🎓 University & Study</option>
                  <option value="exam">📝 Certification Exam</option>
                  <option value="migration">🏠 Relocation & Migration</option>
                  <option value="hobby">🧠 Passion & Culture</option>
                </select>
              </div>

              {/* Daily Pace */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  Daily Study Commitment
                </label>
                <select
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value) as DailyStudyMinutes)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-border-2)] transition-all cursor-pointer"
                >
                  <option value={10}>10 min / day (Casual)</option>
                  <option value={20}>20 min / day (Regular - Recommended)</option>
                  <option value={30}>30 min / day (Dedicated)</option>
                  <option value={60}>60 min / day (Intense)</option>
                </select>
              </div>

              {/* Current Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  Current Level Baseline
                </label>
                <select
                  value={currentLevel}
                  onChange={(e) => setCurrentLevel(e.target.value as CefrLevel)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-border-2)] transition-all cursor-pointer"
                >
                  <option value="beginner">Beginner (A1.1)</option>
                  <option value="intermediate">Intermediate (A2-B1)</option>
                  <option value="not_sure">Diagnostic Scheduled</option>
                  <option value="a1">A1 Certified</option>
                  <option value="a2">A2 Certified</option>
                  <option value="b1">B1 Certified</option>
                </select>
              </div>

              {/* Target Level */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  Target CEFR Level
                </label>
                <select
                  value={targetLevel}
                  onChange={(e) => setTargetLevel(e.target.value as CefrLevel)}
                  className="w-full px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 hover:border-[var(--color-border-2)] transition-all cursor-pointer"
                >
                  <option value="a1">A1 · Breakthrough</option>
                  <option value="a2">A2 · Waystage</option>
                  <option value="b1">B1 · Threshold (Work/Visa)</option>
                  <option value="b2">B2 · Vantage (Professional)</option>
                  <option value="c1">C1 · Effective Fluency</option>
                  <option value="c2">C2 · Native Mastery</option>
                </select>
              </div>

              {/* Target Exam Date */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5 flex items-center gap-1.5">
                  <Calendar size={13} className="text-[var(--color-brand-400)]" />
                  Target Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full sm:w-72 px-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all"
                />
              </div>
            </div>

            {/* Projection info box */}
            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-2)]/60 border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                    Target: {targetLevel.toUpperCase()} Proficiency Pace
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    At {dailyMinutes} min/day, you will master ~{dailyMinutes * 2} new expressions and 1 grammar paradigm per week.
                  </p>
                </div>
              </div>
              <Badge variant="primary" size="sm" className="shrink-0">
                Optimal Rhythm
              </Badge>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <Link
                href="/onboarding"
                className="text-xs text-[var(--color-brand-400)] hover:underline"
              >
                Re-run Onboarding Setup
              </Link>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
                leftIcon={<Save size={15} />}
              >
                Save Learning Plan
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* TAB 2: Account Settings */}
        <TabsContent value="account">
          <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm space-y-6">
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)]">
                Account Information
              </h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Manage your credentials and preferences.
              </p>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-2 focus:ring-[var(--color-brand-500)]/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-muted)] text-sm cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="md"
                loading={saving}
                leftIcon={<Save size={15} />}
              >
                Update Profile
              </Button>
            </form>

            {/* Subscription & Billing Section */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-heading text-sm font-semibold text-[var(--color-text-primary)]">
                    Subscription & Billing
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Manage your Deutsch Pro plan, 7-day trial, invoices, and pause settings.
                  </p>
                </div>
                <Link href="/settings/billing">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight size={13} />}>
                    Billing Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Session Management */}
            <div className="pt-6 border-t border-[var(--color-border)]">
              <h3 className="font-heading text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                Session & Security
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mb-4">
                Signed in securely with Supabase Authentication.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                leftIcon={<LogOut size={15} />}
                className="text-[var(--color-error)] hover:bg-[color-mix(in_srgb,var(--color-error)_10%,transparent)]"
              >
                Sign Out of DeutschPfad
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Badges */}
        <TabsContent value="badges">
          <div className="p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <h2 className="font-heading text-lg font-bold text-[var(--color-text-primary)] mb-1">
              Earned Badges & Milestones
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mb-6">
              Track achievements unlocked along your German path.
            </p>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-accent-500)]/30 bg-[var(--color-accent-500)]/10 hover:border-[var(--color-accent-500)]/60 transition-all flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-accent-500)] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Award size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Erster Schritt
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Completed 4-step onboarding trajectory.
                  </p>
                  <Badge size="xs" variant="accent" className="mt-2">Unlocked</Badge>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-500)]/10 hover:border-[var(--color-brand-500)]/60 transition-all flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-500)] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Flame size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Streak Starter
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Maintained daily study streak.
                  </p>
                  <Badge size="xs" variant="primary" className="mt-2">Active</Badge>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border-2)] transition-all flex items-start gap-3 opacity-70">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-muted)] flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    A1 Meister
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Pass full A1 unit quizzes with &gt; 80%.
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-2 block">In Progress</span>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-a1)]/30 bg-[var(--color-a1)]/10 hover:border-[var(--color-a1)]/60 transition-all flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-a1)] text-white flex items-center justify-center shrink-0 shadow-md">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Wortschatz 100
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    100 vocabulary words committed to long-term memory.
                  </p>
                  <Badge size="xs" variant="success" className="mt-2">Unlocked</Badge>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border-2)] transition-all flex items-start gap-3 opacity-70">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-muted)] flex items-center justify-center shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Grammatik Kenner
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Score 100% on Akkusativ &amp; Dativ declensions.
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-2 block">Locked</span>
                </div>
              </div>

              <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-2)]/60 hover:border-[var(--color-border-2)] transition-all flex items-start gap-3 opacity-70">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-3)] text-[var(--color-text-muted)] flex items-center justify-center shrink-0">
                  <Award size={20} />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-[var(--color-text-primary)]">
                    Goethe Aspirant
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    Complete your first timed CEFR mock exam.
                  </p>
                  <span className="text-[10px] text-[var(--color-text-muted)] mt-2 block">Locked</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
