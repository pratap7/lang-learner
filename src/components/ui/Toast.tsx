"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ───────────────────────────────────────────────────── */
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
}

/* ─── Context ─────────────────────────────────────────────────── */
interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
  addToast: (opts: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}

/* ─── Provider ────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...opts, id }]);
    const duration = opts.duration ?? 4000;
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ toast, addToast: toast, dismiss }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/* ─── Toast List ──────────────────────────────────────────────── */
function ToastList({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (typeof window === "undefined") return null;
  if (!toasts.length) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}

/* ─── Single Toast ────────────────────────────────────────────── */
const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-[var(--color-success)]" />,
  error:   <AlertCircle  size={18} className="text-[var(--color-error)]"   />,
  warning: <AlertTriangle size={18} className="text-[var(--color-warning)]"/>,
  info:    <Info          size={18} className="text-[var(--color-info)]"    />,
};

const borderMap: Record<ToastType, string> = {
  success: "border-l-4 border-l-[var(--color-success)]",
  error:   "border-l-4 border-l-[var(--color-error)]",
  warning: "border-l-4 border-l-[var(--color-warning)]",
  info:    "border-l-4 border-l-[var(--color-info)]",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-[var(--radius-xl)]",
        "bg-[var(--color-surface)] border border-[var(--color-border)]",
        "shadow-[var(--shadow-xl)] backdrop-blur-sm",
        toast.type && borderMap[toast.type],
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      {toast.type && <span className="mt-0.5 shrink-0">{iconMap[toast.type]}</span>}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm text-[var(--color-text-primary)]">{toast.title}</p>
        )}
        <p className="text-sm text-[var(--color-text-secondary)]">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
