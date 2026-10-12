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
            className={cn("animate-shimmer rounded-[var(--radius-md)]", className)}
            style={{ height: height ?? "16px", width: i === lines - 1 ? "70%" : (width ?? "100%"), ...style }}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-shimmer",
        circle ? "rounded-full" : "rounded-[var(--radius-md)]",
        className
      )}
      style={{
        width: width ?? "100%",
        height: height ?? "16px",
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

/* Compound presets */
export function SkeletonCard() {
  return (
    <div className="surface-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton circle width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton height="14px" width="60%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
      <Skeleton height="12px" lines={3} />
      <Skeleton height="36px" width="100%" className="rounded-[var(--radius-lg)]" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return <Skeleton lines={lines} />;
}
