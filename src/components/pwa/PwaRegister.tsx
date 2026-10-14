"use client";

import { useEffect, useState } from "react";
import { WifiOff, Download, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import {
  flushPendingSyncQueue,
  getPendingSyncQueue,
} from "@/lib/offlineSyncService";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaRegister() {
  const { addToast } = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Check initial online & sync queue status
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      setPendingCount(getPendingSyncQueue().length);
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

    // Connectivity status listeners & automatic sync
    const handleOnline = async () => {
      setIsOffline(false);
      setIsSyncing(true);
      try {
        const { syncedCount } = await flushPendingSyncQueue();
        setPendingCount(getPendingSyncQueue().length);
        if (syncedCount > 0) {
          addToast({
            type: "success",
            title: "Back Online & Synced! 🚀",
            message: `Successfully synced ${syncedCount} offline study action(s) to the cloud.`,
          });
        } else {
          addToast({
            type: "success",
            title: "Back Online",
            message: "Your learning progress is connected to the cloud.",
          });
        }
      } finally {
        setIsSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      addToast({
        type: "warning",
        title: "Offline Mode Active",
        message: "Cached lessons, exercises, and flashcards remain available offline.",
      });
    };

    const handleQueueChange = (e: any) => {
      setPendingCount(e?.detail?.count ?? getPendingSyncQueue().length);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("deutschpfad:sync-queue-updated", handleQueueChange);

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
      {/* Offline Status Persistent Bar with Sync Counter */}
      {isOffline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[var(--color-surface)]/95 border border-[var(--color-warning)] text-[var(--color-warning)] shadow-xl backdrop-blur-md text-xs font-semibold"
        >
          <WifiOff size={14} className="animate-pulse" />
          <span>Offline Mode{pendingCount > 0 ? ` · ${pendingCount} queued` : " · Cached lessons ready"}</span>
        </aside>
      )}

      {/* Syncing Active Indicator */}
      {!isOffline && pendingCount > 0 && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--color-surface)]/95 border border-[var(--color-brand-500)] text-[var(--color-brand-400)] shadow-xl backdrop-blur-md text-xs font-semibold"
        >
          <RefreshCw size={14} className="animate-spin" />
          <span>Syncing {pendingCount} offline study action(s)...</span>
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
