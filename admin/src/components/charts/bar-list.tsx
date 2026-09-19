import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';

export interface BarDatum {
  key: string;
  label: string;
  value: number;
  /** Tailwind background class for the fill. */
  color: string;
}

/** Every row is direct-labelled, so colour is never the only carrier of meaning. */
export function BarList({
  data,
  formatValue = formatCount,
  emptyLabel = 'No data yet',
}: {
  data: BarDatum[];
  formatValue?: (value: number) => string;
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((datum) => datum.value), 1);
  const total = data.reduce((sum, datum) => sum + datum.value, 0);

  if (data.length === 0 || total === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {data.map((datum) => {
        const share = total === 0 ? 0 : (datum.value / total) * 100;

        return (
          <li key={datum.key} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
            <span className="truncate text-xs font-medium text-foreground">
              {datum.label}
            </span>
            <span className="text-xs font-semibold text-foreground tnum">
              {formatValue(datum.value)}
              <span className="ml-1.5 font-normal text-muted-foreground">
                {share.toFixed(0)}%
              </span>
            </span>
            <div
              className="col-span-2 h-2 overflow-hidden rounded-full bg-ink-100"
              role="img"
              aria-label={`${datum.label}: ${formatValue(datum.value)}`}
            >
              <div
                className={cn('h-full rounded-full transition-[width] duration-500', datum.color)}
                style={{ width: `${Math.max((datum.value / max) * 100, 2)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
