import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The error is wired up with aria-describedby so it is announced, not just red. */
export type FieldProps = {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function describedBy(
  id: string,
  hint?: string,
  error?: string,
): string | undefined {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

export function Field({
  id,
  label,
  hint,
  error,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold tracking-wide text-neutral-700"
        >
          {label}
        </label>
      )}
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-subtle-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-xs font-medium text-danger-700"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0">
            <circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M8 4.75v3.75M8 11.1v.15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export const controlClassName =
  "w-full rounded-lg border border-border-strong bg-card text-sm text-foreground shadow-xs transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-subtle-foreground hover:border-neutral-400 focus-visible:border-brand-500 disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none";

export const controlErrorClassName =
  "border-danger-500 hover:border-danger-600 focus-visible:border-danger-600 focus-visible:outline-danger-500";
