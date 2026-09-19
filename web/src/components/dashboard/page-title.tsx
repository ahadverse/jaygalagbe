import type { ReactNode } from "react";

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <p className="eyebrow text-brand-700">{eyebrow}</p>}
        <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="measure text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
