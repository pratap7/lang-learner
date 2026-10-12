import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  circle?: boolean;
  lines?: number;
}

export function Skeleton({
  className,
  width,
  height,
  circle = false,
  lines,
  style,
  ...props
}: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn("animate-shimmer rounded-[var(--radius-md)] bg-[var(--color-surface-2)]", className)}
            style={{
              height: height ?? "16px",
              width: i === lines - 1 ? "70%" : (width ?? "100%"),
              ...style,
            }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-shimmer bg-[var(--color-surface-2)]",
        circle ? "rounded-full" : "rounded-[var(--radius-md)]",
        className
      )}
      style={{
        width: circle ? (width ?? height ?? "40px") : width,
        height: circle ? (height ?? width ?? "40px") : height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/* ──────────────── Compound Skeleton Presets ──────────────── */

export function CourseCardSkeleton() {
  return (
    <div className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width="60px" height="24px" className="rounded-full" />
        <Skeleton circle width="32px" height="32px" />
      </div>
      <div className="space-y-2">
        <Skeleton width="80%" height="20px" />
        <Skeleton width="100%" height="14px" lines={2} />
      </div>
      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
        <Skeleton width="90px" height="14px" />
        <Skeleton width="70px" height="28px" className="rounded-lg" />
      </div>
    </div>
  );
}

export function StoryCardSkeleton() {
  return (
    <div className="p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton width="48px" height="20px" className="rounded-full" />
        <Skeleton width="60px" height="16px" />
      </div>
      <Skeleton width="75%" height="20px" />
      <Skeleton width="100%" height="14px" lines={2} />
      <div className="pt-2 flex items-center gap-3">
        <Skeleton width="80px" height="16px" />
        <Skeleton width="60px" height="16px" />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Banner skeleton */}
      <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width="180px" height="28px" />
            <Skeleton width="260px" height="16px" />
          </div>
          <div className="flex gap-2">
            <Skeleton circle width="44px" height="44px" />
            <Skeleton circle width="44px" height="44px" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <CourseCardSkeleton />
        <CourseCardSkeleton />
        <CourseCardSkeleton />
      </div>
    </div>
  );
}

export function FlashcardDeckSkeleton() {
  return (
    <div className="p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] text-center space-y-4 max-w-sm mx-auto">
      <Skeleton circle width="64px" height="64px" className="mx-auto" />
      <Skeleton width="60%" height="22px" className="mx-auto" />
      <Skeleton width="80%" height="14px" className="mx-auto" />
      <div className="pt-4 flex justify-center gap-3">
        <Skeleton width="80px" height="36px" className="rounded-lg" />
        <Skeleton width="80px" height="36px" className="rounded-lg" />
      </div>
    </div>
  );
}

export const SkeletonCard = CourseCardSkeleton;

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return <Skeleton lines={lines} className={className} />;
}

