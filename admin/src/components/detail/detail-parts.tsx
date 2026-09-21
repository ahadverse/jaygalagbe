import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';

/**
 * The shared vocabulary every detail drawer is built from, so a report reads
 * the same way as a payment and a moderator never has to relearn the layout.
 */

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-5 first:mt-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Row({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 text-right font-medium break-words',
          mono && 'font-mono text-xs',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export function Rows({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-border">{children}</dl>;
}

export function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-border bg-ink-50 px-2.5 py-2">
      <p className="text-base font-semibold tnum">
        {typeof value === 'number' ? formatCount(value) : value}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{children}</div>
  );
}

/** A record id, shown small and copyable — support tickets quote these. */
export function IdLine({ id }: { id: string }) {
  return (
    <p className="mt-0.5 font-mono text-[0.6875rem] break-all text-muted-foreground">
      {id}
    </p>
  );
}

export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}
