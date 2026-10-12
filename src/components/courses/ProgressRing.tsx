"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  showPercent?: boolean;
}

export function ProgressRing({
  progress,
  size = 76,
  strokeWidth = 6,
  color = "var(--color-brand-500)",
  bgColor = "rgba(148, 163, 184, 0.18)",
  label,
  showPercent = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedProgress = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Inner Label / Percentage */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercent && (
          <span className="font-heading text-xs font-bold text-[var(--color-text-primary)]">
            {Math.round(normalizedProgress)}%
          </span>
        )}
        {label && (
          <span className="text-[9px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
