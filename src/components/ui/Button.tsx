"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium",
    "transition-all duration-200 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-500)] focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.97]",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-[var(--color-brand-600)] to-[var(--color-brand-500)] text-white font-semibold",
          "hover:from-[var(--color-brand-500)] hover:to-[var(--color-brand-600)]",
          "shadow-md hover:shadow-[0_4px_22px_rgba(99,102,241,0.4)] border border-white/10",
          "hover:-translate-y-0.5 active:translate-y-0",
        ],
        secondary: [
          "bg-[var(--color-surface-2)] text-[var(--color-text-primary)] font-medium",
          "border border-[var(--color-border)] hover:border-[var(--color-brand-400)]/40",
          "hover:bg-[var(--color-surface-3)] hover:-translate-y-0.5 shadow-sm active:translate-y-0",
        ],
        outline: [
          "bg-transparent border border-[var(--color-border-2)] text-[var(--color-text-primary)] font-medium",
          "hover:bg-[var(--color-surface-2)] hover:border-[var(--color-brand-400)]/60 hover:text-[var(--color-brand-400)]",
          "hover:-translate-y-0.5 active:translate-y-0",
        ],
        ghost: [
          "bg-transparent text-[var(--color-text-secondary)] font-medium",
          "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)]",
        ],
        accent: [
          "bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-accent-400)] text-slate-950 font-semibold",
          "hover:from-[var(--color-accent-400)] hover:to-[var(--color-accent-500)]",
          "shadow-md hover:shadow-[0_4px_22px_rgba(245,158,11,0.35)]",
          "hover:-translate-y-0.5 active:translate-y-0",
        ],
        danger: [
          "bg-[var(--color-error)] text-white font-semibold",
          "hover:bg-red-600 shadow-md hover:shadow-lg",
        ],
      },
      size: {
        xs:  "min-h-[32px] h-8  px-3   text-xs  rounded-[var(--radius-md)]",
        sm:  "min-h-[38px] h-9  px-4   text-xs sm:text-sm rounded-[var(--radius-md)]",
        md:  "min-h-[44px] h-11 px-5   text-sm  rounded-[var(--radius-lg)]",
        lg:  "min-h-[48px] h-12 px-6   text-base rounded-[var(--radius-lg)]",
        xl:  "min-h-[52px] h-14 px-8   text-base rounded-[var(--radius-xl)]",
        icon:"min-h-[44px] min-w-[44px] h-11 w-11 rounded-[var(--radius-lg)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, fullWidth, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), fullWidth && "w-full", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
