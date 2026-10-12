"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Menu, X, Moon, Sun, Zap, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Courses", href: "/courses" },
  { label: "Stories", href: "/stories" },
  { label: "Insights", href: "/insights" },
  { label: "Writing", href: "/writing" },
  { label: "AI Chat", href: "/conversation" },
  { label: "Tests", href: "/tests" },
  { label: "Flashcards", href: "/flashcards" },
  { label: "Practice", href: "/practice" },
  { label: "Badges", href: "/badges" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Progress", href: "/progress" },
  { label: "Goals", href: "/goals" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("deutschpfad_theme");
      if (saved) {
        const isDark = saved === "dark";
        setDarkMode(isDark);
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      // Ignore in SSR
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Check if user is logged in
    const hasProfile = Boolean(localStorage.getItem("deutschpfad_user_profile"));
    const hasCookie = document.cookie.includes("deutschpfad_demo_user") || document.cookie.includes("sb-");
    setIsLoggedIn(hasProfile || hasCookie);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      const themeName = next ? "dark" : "light";
      try {
        localStorage.setItem("deutschpfad_theme", themeName);
      } catch {}
      document.documentElement.classList.toggle("dark", next);
      document.documentElement.setAttribute("data-theme", themeName);
      return next;
    });
  };


  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-[var(--color-surface)]/85 backdrop-blur-xl border-b border-[var(--color-border)] shadow-[var(--shadow-md)]"
            : "bg-transparent"
        )}
      >
        {/* Subtle German flag tricolor bar at the top */}
        <div className="h-0.5 w-full tricolor-stripe opacity-90" />

        <div className="container-xl flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-gradient-to-br from-[var(--color-brand-500)] via-[var(--color-brand-600)] to-[var(--color-accent-500)] p-[1.5px] shadow-md group-hover:shadow-[var(--shadow-glow)] transition-all duration-300">
              <div className="w-full h-full bg-[var(--color-surface)] rounded-[calc(var(--radius-lg)-1.5px)] flex items-center justify-center">
                <BookOpen size={16} className="text-[var(--color-brand-400)] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold text-[var(--color-text-primary)] leading-none">
                Deutsch<span className="text-[var(--color-brand-400)]">Pfad</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[var(--color-accent-500)] mt-0.5">
                A1 · C2 Fluency
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[var(--color-surface-2)]/50 border border-[var(--color-border)]/60 backdrop-blur-md">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-full hover:bg-[var(--color-surface)] transition-all duration-150"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="h-9 w-9 flex items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] border border-transparent hover:border-[var(--color-border)] transition-all duration-150"
            >
              {darkMode ? <Sun size={16} className="text-[var(--color-accent-400)]" /> : <Moon size={16} />}
            </button>

            {isLoggedIn ? (
              <Link href="/profile">
                <Button variant="outline" size="sm" leftIcon={<User size={14} className="text-[var(--color-brand-400)]" />}>
                  My Profile
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Sign in
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    variant="primary"
                    size="sm"
                    className="shadow-[var(--shadow-glow)] hover:shadow-lg transition-all"
                    leftIcon={<Zap size={14} className="text-[var(--color-accent-400)]" />}
                  >
                    Start Free
                  </Button>
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-all"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-30 bg-[var(--color-surface)]/95 backdrop-blur-2xl border-b border-[var(--color-border)] shadow-[var(--shadow-xl)] p-5 md:hidden"
          >
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-lg)] hover:bg-[var(--color-surface-2)] transition-all"
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-[var(--color-border)] my-2 pt-3 flex flex-col gap-2">
                {isLoggedIn ? (
                  <Link href="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" size="md" className="w-full" leftIcon={<User size={15} />}>
                      Go to Profile
                    </Button>
                  </Link>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/auth/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full">Start Free</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
