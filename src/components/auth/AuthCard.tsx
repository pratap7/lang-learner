"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface AuthCardProps {
  mode: "login" | "signup";
}

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/onboarding";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createClient();
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (!isSupabaseConfigured) {
        // Fallback for local demo mode without configured credentials
        document.cookie = `deutschpfad_demo_user=demo-user-123; path=/; max-age=86400`;
        const profileData = {
          id: "demo-user-123",
          full_name: fullName || "German Learner",
          email,
          onboarding_completed: false,
          streak_count: 3,
          xp_points: 120,
        };
        localStorage.setItem("deutschpfad_user_profile", JSON.stringify(profileData));
        router.push(redirectTo);
        router.refresh();
        return;
      }

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
        } else if (data.session) {
          router.push(redirectTo);
          router.refresh();
        } else {
          setMessage("Check your email for a confirmation link to complete registration.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      if (!isSupabaseConfigured) {
        // Demo fallback for instant Google testing
        document.cookie = `deutschpfad_demo_user=demo-user-google; path=/; max-age=86400`;
        const profileData = {
          id: "demo-user-google",
          full_name: "Google Learner",
          email: "learner@example.com",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
          onboarding_completed: false,
          streak_count: 5,
          xp_points: 240,
        };
        localStorage.setItem("deutschpfad_user_profile", JSON.stringify(profileData));
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemoBypass = () => {
    document.cookie = `deutschpfad_demo_user=demo-explorer; path=/; max-age=86400`;
    const profileData = {
      id: "demo-explorer",
      full_name: "Alex Schneider",
      email: "alex@example.com",
      onboarding_completed: false,
      streak_count: 7,
      xp_points: 350,
    };
    localStorage.setItem("deutschpfad_user_profile", JSON.stringify(profileData));
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="w-full max-w-md p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-xl)] backdrop-blur-xl relative overflow-hidden">
      {/* Top glowing ambient effect */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-b from-[var(--color-brand-500)]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-[var(--color-text-primary)]">
            Deutsch<span className="text-[var(--color-brand-500)]">Pfad</span>
          </span>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-1">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          {mode === "signup"
            ? "Start your journey to German fluency today"
            : "Continue where you left off"}
        </p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 p-3 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-error)_30%,transparent)] flex items-start gap-2.5 text-xs text-[var(--color-error)]"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5 p-3 rounded-[var(--radius-lg)] bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] border border-[color-mix(in_srgb,var(--color-success)_30%,transparent)] flex items-start gap-2.5 text-xs text-[var(--color-success)]"
          >
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)]/50 text-[var(--color-text-primary)] font-medium text-sm transition-all duration-200 hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mb-5"
      >
        {/* Google G SVG */}
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </span>
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-[var(--color-border)] w-full" />
        <span className="bg-[var(--color-surface)] px-3 text-xs uppercase tracking-wider text-[var(--color-text-muted)] absolute">
          or with email
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                placeholder="Johann Wolfgang"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={mode === "signup"}
                className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] transition-all placeholder:text-[var(--color-text-muted)]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] transition-all placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-primary)] text-sm focus:outline-none focus:border-[var(--color-brand-500)] focus:ring-1 focus:ring-[var(--color-brand-500)] transition-all placeholder:text-[var(--color-text-muted)]"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          loading={loading}
          rightIcon={<ArrowRight size={16} />}
        >
          {mode === "signup" ? "Create Account" : "Sign In"}
        </Button>
      </form>

      {/* Switch mode */}
      <div className="mt-6 text-center text-xs text-[var(--color-text-secondary)]">
        {mode === "signup" ? (
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[var(--color-brand-400)] hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        ) : (
          <p>
            Don&apos;t have an account yet?{" "}
            <Link
              href="/auth/signup"
              className="text-[var(--color-brand-400)] hover:underline font-semibold"
            >
              Sign up free
            </Link>
          </p>
        )}
      </div>

      {/* Instant Demo Sandbox Button */}
      <div className="mt-6 pt-5 border-t border-[var(--color-border)] text-center">
        <button
          type="button"
          onClick={handleDemoBypass}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand-400)] transition-colors underline underline-offset-4"
        >
          Explore with 1-Click Interactive Demo (Skip Auth)
        </button>
      </div>
    </div>
  );
}
