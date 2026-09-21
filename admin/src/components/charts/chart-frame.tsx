import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SeriesSpec } from './chart-tokens';

/** Always present for two or more series, so identity is never colour-alone. */
export function ChartLegend({
  series,
  className,
}: {
  series: { key: string; label: string; color: string }[];
  className?: string;
}) {
  if (series.length < 2) return null;

  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1', className)}>
      {series.map((entry) => (
        <li
          key={entry.key}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color }}
          />
          {entry.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * The WCAG-clean twin of every chart. Three of the light-mode series sit
 * below 3:1 against the card, so a readable non-colour path to the same
 * numbers is a requirement, not a nicety.
 */
export function ChartTableView<T>({
  rows,
  label,
  series,
  open,
  onToggle,
}: {
  rows: T[];
  label: (row: T) => string;
  series: SeriesSpec<T>[];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="rounded text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {open ? 'Hide data table' : 'Show data table'}
      </button>

      {open && (
        <div className="mt-2 max-h-64 overflow-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-ink-50">
              <tr className="border-b border-border">
                <th scope="col" className="px-2.5 py-1.5 text-left font-semibold">
                  Period
                </th>
                {series.map((entry) => (
                  <th
                    key={entry.key}
                    scope="col"
                    className="px-2.5 py-1.5 text-right font-semibold whitespace-nowrap"
                  >
                    {entry.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row, index) => (
                <tr key={index}>
                  <th
                    scope="row"
                    className="px-2.5 py-1 text-left font-normal whitespace-nowrap text-muted-foreground"
                  >
                    {label(row)}
                  </th>
                  {series.map((entry) => (
                    <td
                      key={entry.key}
                      className="px-2.5 py-1 text-right tnum"
                    >
                      {entry.format(entry.value(row))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ChartEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="py-12 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}

