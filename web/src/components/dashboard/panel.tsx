import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** The single surface every dashboard block sits on. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-2xl bg-card shadow-sm ring-1 ring-neutral-900/5",
        className,
      )}
    >
      {title && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <h2 className="font-heading text-sm font-bold tracking-tight text-foreground sm:text-base">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PanelNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-muted/70 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
