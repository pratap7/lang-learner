"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring or console
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="surface-card max-w-md w-full p-8 text-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--color-error)]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/25 flex items-center justify-center text-[var(--color-error)]">
          <AlertTriangle size={30} />
        </div>

        <h2 className="font-heading text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          Etwas ist schiefgelaufen
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          An unexpected error occurred while loading this section. Your progress and saved learning data remain safe.
        </p>

        {error.message && (
          <div className="mb-6 p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-muted)] text-left truncate">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={() => reset()}
            leftIcon={<RotateCcw size={16} />}
            className="w-full sm:w-auto"
          >
            Try Again
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={<Home size={16} />}
              className="w-full sm:w-auto"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
