import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatCompactTaka, formatTaka } from '@/lib/format';

export interface RevenuePoint {
  month: string;
  revenue: number;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function monthLabel(month: string): string {
  const [year, index] = month.split('-');
  return `${MONTH_LABELS[Number(index) - 1] ?? month} ${year.slice(2)}`;
}

export function RevenueColumns({ data }: { data: RevenuePoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-xs text-muted-foreground">
        No settled boost payments in the last six months.
      </p>
    );
  }

  const max = Math.max(...data.map((point) => point.revenue), 1);
  // Round the axis top up to something readable rather than the raw maximum.
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const axisTop = Math.ceil(max / magnitude) * magnitude;
  const ticks = [axisTop, axisTop / 2, 0];

  return (
    <div>
      <div className="relative flex gap-3">
        <div className="flex w-12 shrink-0 flex-col justify-between py-0 text-right text-[0.6875rem] text-ink-400 tnum">
          {ticks.map((tick) => (
            <span key={tick}>{formatCompactTaka(tick)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* Recessive gridlines sit behind the marks. */}
          <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            {ticks.map((tick) => (
              <div key={tick} className="border-t border-dashed border-ink-200" />
            ))}
          </div>

          <div className="relative flex h-36 items-end gap-1.5 sm:gap-2">
            {data.map((point, index) => {
              const heightPct = (point.revenue / axisTop) * 100;
              const isHovered = hovered === index;

              return (
                <div
                  key={point.month}
                  className="group relative flex h-full min-w-0 flex-1 items-end"
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${monthLabel(point.month)}: ${formatTaka(point.revenue)}`}
                >
                  <div
                    className={cn(
                      'w-full rounded-t-[4px] transition-colors duration-150',
                      isHovered ? 'bg-brand-700' : 'bg-brand-500',
                    )}
                    style={{ height: `${Math.max(heightPct, point.revenue > 0 ? 2 : 0)}%` }}
                  />

                  {isHovered && (
                    <div className="pointer-events-none absolute -top-1 left-1/2 z-10 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-card px-2 py-1 text-center shadow-md">
                      <p className="text-[0.6875rem] whitespace-nowrap text-muted-foreground">
                        {monthLabel(point.month)}
                      </p>
                      <p className="text-xs font-semibold whitespace-nowrap tnum">
                        {formatTaka(point.revenue)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-1.5 flex gap-3">
        <div className="w-12 shrink-0" />
        <div className="flex min-w-0 flex-1 gap-1.5 sm:gap-2">
          {data.map((point) => (
            <span
              key={point.month}
              className="min-w-0 flex-1 truncate text-center text-[0.6875rem] text-muted-foreground"
            >
              {monthLabel(point.month)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
