import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toneVariants = cva(
  "flex size-8 shrink-0 items-center justify-center rounded-lg",
  {
    variants: {
      tone: {
        neutral: "bg-brand-50 text-brand-600",
        accent: "bg-accent-50 text-accent-600",
        success: "bg-success-50 text-success-700",
        info: "bg-info-50 text-info-700",
        warning: "bg-warning-50 text-warning-700",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface StatCardProps extends VariantProps<typeof toneVariants> {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2.5 rounded-2xl bg-card px-4 py-3.5 shadow-sm ring-1 ring-neutral-900/5 sm:px-5 sm:py-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow truncate text-subtle-foreground">{label}</span>
        {icon && <span className={toneVariants({ tone })}>{icon}</span>}
      </div>
      <span className="numeric font-heading text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
        {value}
      </span>
      {hint && (
        <span className="text-2xs leading-snug text-muted-foreground sm:text-xs">
          {hint}
        </span>
      )}
    </div>
  );
}
