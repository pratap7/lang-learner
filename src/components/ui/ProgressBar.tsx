"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;          // 0–100
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  color?: "brand" | "accent" | "success" | "warning" | "error" | "a1" | "a2" | "b1" | "b2" | "c1" | "c2";
  animated?: boolean;
  striped?: boolean;
}

const colorMap: Record<string, string> = {
  brand:   "bg-[var(--color-brand-500)]",
  accent:  "bg-[var(--color-accent-500)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  error:   "bg-[var(--color-error)]",
  a1:      "bg-[var(--color-a1)]",
  a2:      "bg-[var(--color-a2)]",
  b1:      "bg-[var(--color-b1)]",
  b2:      "bg-[var(--color-b2)]",
  c1:      "bg-[var(--color-c1)]",
  c2:      "bg-[var(--color-c2)]",
};

const sizeMap: Record<string, string> = {
  xs: "h-1",
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      className,
      value,
      max = 100,
      label,
      showValue = false,
      size = "md",
      color = "brand",
      animated = true,
      striped = false,
      ...props
    },
    ref
  ) => {
    const pct = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between items-center mb-1.5">
            {label && (
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</span>
            )}
            {showValue && (
              <span className="text-xs font-semibold text-[var(--color-text-primary)] tabular-nums">
                {Math.round(pct)}%
              </span>
            )}
          </div>
        )}
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          className={cn(
            "w-full rounded-full overflow-hidden",
            "bg-[var(--color-surface-2)]",
            sizeMap[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              colorMap[color],
              animated && "relative",
              striped && "bg-stripes"
            )}
            style={{ width: `${pct}%` }}
          >
            {animated && (
              <span
                className="absolute inset-0 rounded-full opacity-30"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                  animation: "shimmer 2s ease-in-out infinite",
                  backgroundSize: "200% 100%",
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
