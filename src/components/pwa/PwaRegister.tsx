"use client";

import { useEffect, useState } from "react";
import { WifiOff, Download, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const { addToast } = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    // Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            // Check for updates
            reg.addEventListener("updatefound", () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.addEventListener("statechange", () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    addToast({
                      type: "info",
                      title: "Update Available",
                      message: "A new version of DeutschPfad is cached and ready.",
                    });
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.debug("PWA Service Worker registration skipped or failed:", err);
          });
      });
    }

    // Connectivity status listeners
    const handleOnline = () => {
      setIsOffline(false);
      addToast({
        type: "success",
        title: "Back Online",
        message: "Your learning progress is synced with the cloud.",
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      addToast({
        type: "warning",
        title: "Offline Mode Active",
        message: "Cached lessons, exercises, and flashcards remain available offline.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show install prompt if not already installed and not dismissed in this session
      const hasDismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!hasDismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, [addToast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowInstallBanner(false);
      addToast({
        type: "success",
        title: "DeutschPfad Installed",
        message: "Launch directly from your home screen or dock!",
      });
    }
    setDeferredPrompt(null);
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  return (
    <>
      {/* Offline Status Persistent Bar */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-warning)] text-[var(--color-warning)] shadow-lg backdrop-blur-md text-xs font-medium animate-pulse"
        >
          <WifiOff size={14} />
          <span>Offline Mode — Cached lessons available</span>
        </aside>
      )}

      {/* Optional Install Prompt Pill */}
      {showInstallBanner && deferredPrompt && (
        <aside
          role="complementary"
          aria-label="Install DeutschPfad application"
          className="fixed bottom-20 left-4 sm:left-6 z-40 max-w-sm p-3 rounded-2xl bg-[var(--color-surface)]/95 border border-[var(--color-brand-500)]/40 shadow-2xl backdrop-blur-xl flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-600)] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Download size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[var(--color-text-primary)]">
              Install DeutschPfad App
            </div>
            <div className="text-[11px] text-[var(--color-text-secondary)] truncate">
              Fast, offline-ready German practice
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[var(--color-brand-500)] text-white hover:bg-[var(--color-brand-600)] transition-colors shrink-0"
          >
            Install
          </button>
          <button
            onClick={handleDismissBanner}
            aria-label="Dismiss installation prompt"
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 shrink-0"
          >
            <X size={14} />
          </button>
        </aside>
      )}
    </>
  );
}
