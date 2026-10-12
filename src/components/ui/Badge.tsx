import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center gap-1.5 font-medium border",
    "transition-colors duration-150",
  ],
  {
    variants: {
      variant: {
        default:   "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
        secondary: "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)]",
        primary:   "bg-[var(--color-brand-500)]/15 text-[var(--color-brand-400)] border-[var(--color-brand-500)]/30",
        accent:    "bg-[var(--color-accent-500)]/15 text-[var(--color-accent-400)] border-[var(--color-accent-500)]/30",
        success:   "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        warning:   "bg-amber-500/15 text-amber-400 border-amber-500/30",
        error:     "bg-rose-500/15 text-rose-400 border-rose-500/30",
        a1: "badge-a1 border",
        a2: "badge-a2 border",
        b1: "badge-b1 border",
        b2: "badge-b2 border",
        c1: "badge-c1 border",
        c2: "badge-c2 border",
      },
      size: {
        xs: "text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)]",
        sm: "text-xs px-2 py-0.5 rounded-[var(--radius-md)]",
        md: "text-xs px-2.5 py-1 rounded-[var(--radius-lg)]",
        lg: "text-sm px-3 py-1.5 rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      )}
      {children}
    </span>
  )
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
