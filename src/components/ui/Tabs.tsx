"use client";

import { createContext, useContext, useState } from "react";
import { cn } from "@/lib/utils";

/* ─── Context ─────────────────────────────────────────────────── */
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
  variant: "line" | "pill" | "card";
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tabs sub-component used outside <Tabs>");
  return ctx;
}

/* ─── Root ────────────────────────────────────────────────────── */
interface TabsProps {
  defaultTab: string;
  children: React.ReactNode;
  className?: string;
  variant?: "line" | "pill" | "card";
  onChange?: (tab: string) => void;
}

export function Tabs({
  defaultTab,
  children,
  className,
  variant = "line",
  onChange,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleChange, variant }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/* ─── List ────────────────────────────────────────────────────── */
export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  const { variant } = useTabsContext();
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-1",
        variant === "line" && "border-b border-[var(--color-border)] pb-0",
        variant === "pill" && "bg-[var(--color-surface-2)] p-1 rounded-[var(--radius-xl)] w-fit",
        variant === "card" && "gap-2",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── Trigger ─────────────────────────────────────────────────── */
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function TabsTrigger({ value, children, className, icon }: TabsTriggerProps) {
  const { activeTab, setActiveTab, variant } = useTabsContext();
  const isActive = activeTab === value;
  const id = `tab-${value}`;

  return (
    <button
      id={id}
      role="tab"
      aria-selected={isActive}
      aria-controls={`panel-${value}`}
      onClick={() => setActiveTab(value)}
      className={cn(
        "flex items-center gap-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)]",
        variant === "line" && [
          "px-4 py-2.5 -mb-px border-b-2",
          isActive
            ? "border-[var(--color-brand-500)] text-[var(--color-brand-500)]"
            : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-2)]",
        ],
        variant === "pill" && [
          "px-4 py-1.5 rounded-[var(--radius-lg)]",
          isActive
            ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
        ],
        variant === "card" && [
          "px-4 py-2 rounded-[var(--radius-lg)] border",
          isActive
            ? "bg-[var(--color-brand-500)] text-white border-[var(--color-brand-500)]"
            : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-400)]",
        ],
        className
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}

/* ─── Content ─────────────────────────────────────────────────── */
interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div
      id={`panel-${value}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      className={cn("mt-4 focus:outline-none", className)}
    >
      {children}
    </div>
  );
}
