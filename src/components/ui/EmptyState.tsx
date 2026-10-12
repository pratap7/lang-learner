"use client";

import React from "react";
import Link from "next/link";
import { LucideIcon, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
  badge?: string;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  className,
  badge,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-card p-10 md:p-14 text-center flex flex-col items-center justify-center max-w-lg mx-auto rounded-[var(--radius-2xl)] border border-[var(--color-border)] relative overflow-hidden",
        className
      )}
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-[var(--color-brand-500)]/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-[var(--color-accent-500)]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Icon with glow halo */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[var(--color-surface-2)] to-[var(--color-surface-3)] border border-[var(--color-border)] shadow-[var(--shadow-md)] flex items-center justify-center text-[var(--color-brand-400)] transition-transform hover:scale-105 duration-200">
          <Icon size={28} className="stroke-[1.75]" />
        </div>
        {badge && (
          <span className="absolute -top-2 -right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-brand-600)] text-white shadow-sm uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>

      <h3 className="font-heading text-xl font-bold text-[var(--color-text-primary)] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
        {actionLabel && (
          actionHref ? (
            <Link href={actionHref} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="primary" size="md" onClick={onAction} className="w-full sm:w-auto">
              {actionLabel}
            </Button>
          )
        )}

        {secondaryActionLabel && (
          secondaryActionHref ? (
            <Link href={secondaryActionHref} className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full sm:w-auto">
                {secondaryActionLabel}
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="md" onClick={onSecondaryAction} className="w-full sm:w-auto">
              {secondaryActionLabel}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
