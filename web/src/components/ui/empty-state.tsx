import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconToneVariants = cva(
  "flex size-12 items-center justify-center rounded-2xl",
  {
    variants: {
      tone: {
        neutral: "bg-brand-50 text-brand-600 ring-1 ring-brand-100",
        danger: "bg-danger-50 text-danger-600 ring-1 ring-danger-100",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export interface EmptyStateProps extends VariantProps<typeof iconToneVariants> {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

/*
 * One shape for every "there is nothing here yet" and "that didn't load"
 * surface, so those states look designed instead of forgotten.
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  tone,
  compact,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-card/60 text-center",
        compact ? "px-5 py-8" : "px-6 py-14",
        className,
      )}
    >
      <span className={iconToneVariants({ tone })}>
        {icon ?? (
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
            <path
              d="M4 10.5 12 4l8 6.5V20H4v-9.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M9.5 20v-5h5v5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <div className="flex flex-col gap-1.5">
        <p className="font-heading text-base font-bold text-foreground">
          {title}
        </p>
        {description && (
          <p className="measure mx-auto text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}
