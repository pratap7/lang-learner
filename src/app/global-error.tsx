"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global system error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark" data-theme="dark">
      <body className="bg-[#0b0f19] text-[#f1f5f9] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 text-center rounded-2xl bg-[#111827] border border-[#1f2937] shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertOctagon size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Kritischer Fehler</h1>
          <p className="text-sm text-[#94a3b8] mb-6">
            A critical system error occurred. Click below to recover and reload DeutschPfad.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <RotateCcw size={16} />
            Neustart / Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
