import { useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ChartEmpty, ChartLegend, ChartTableView } from './chart-frame';
import { niceMax, type SeriesSpec } from './chart-tokens';

const VIEW_WIDTH = 720;
const PLOT_HEIGHT = 180;
const PAD_LEFT = 46;
const PAD_RIGHT = 10;
const PAD_TOP = 10;
const TICK_COUNT = 4;

interface TimeSeriesChartProps<T> {
  data: T[];
  label: (point: T) => string;
  series: SeriesSpec<T>[];
  /** Fills under the first series; multi-series charts stay as lines. */
  area?: boolean;
  emptyLabel?: string;
}

/**
 * Multi-series line/area chart on one shared y-axis.
 *
 * Deliberately never dual-axis: two measures of different magnitude go in two
 * charts rather than on two scales, because aligning two scales invents a
 * correlation the data does not contain.
 */
export function TimeSeriesChart<T>({
  data,
  label,
  series,
  area = false,
  emptyLabel = 'No activity in this period.',
}: TimeSeriesChartProps<T>) {
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [tableOpen, setTableOpen] = useState(false);

  const max = useMemo(
    () =>
      niceMax(
        Math.max(
          ...data.flatMap((point) => series.map((entry) => entry.value(point))),
          0,
        ),
      ),
    [data, series],
  );

  if (data.length === 0) {
    return <ChartEmpty>{emptyLabel}</ChartEmpty>;
  }

  const innerWidth = VIEW_WIDTH - PAD_LEFT - PAD_RIGHT;
  // A single point has no span to divide, so it is pinned to the left edge.
  const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

  const x = (index: number) => PAD_LEFT + index * stepX;
  const y = (value: number) =>
    PAD_TOP + PLOT_HEIGHT - (value / max) * PLOT_HEIGHT;

  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, index) => {
    const value = (max / TICK_COUNT) * index;
    return { value, y: y(value) };
  });

  const active = hovered !== null ? data[hovered] : null;

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;

    // Map the pointer into viewBox space — the SVG scales to its container.
    const bounds = svg.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const svgX = ratio * VIEW_WIDTH;

    const index =
      stepX === 0 ? 0 : Math.round((svgX - PAD_LEFT) / stepX);
    setHovered(Math.min(data.length - 1, Math.max(0, index)));
  }

  return (
    <div>
      <ChartLegend series={series} className="mb-3" />

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_WIDTH} ${PLOT_HEIGHT + PAD_TOP + 26}`}
          className="w-full touch-none"
          role="img"
          aria-label={`${series.map((entry) => entry.label).join(', ')} over time`}
          onMouseMove={handleMove}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0]?.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={series[0]?.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Solid hairline gridlines, one shade off the surface. */}
          {ticks.map((tick) => (
            <g key={tick.value}>
              <line
                x1={PAD_LEFT}
                y1={tick.y}
                x2={VIEW_WIDTH - PAD_RIGHT}
                y2={tick.y}
                stroke="var(--chart-grid)"
                strokeWidth="1"
              />
              <text
                x={PAD_LEFT - 8}
                y={tick.y + 3.5}
                textAnchor="end"
                className="fill-[var(--color-muted-foreground)] text-[10px] tnum"
              >
                {series[0]?.format(tick.value) ?? tick.value}
              </text>
            </g>
          ))}

          {area && series[0] && data.length > 1 && (
            <path
              d={`${linePath(data, series[0].value, x, y)} L ${x(data.length - 1)} ${
                PAD_TOP + PLOT_HEIGHT
              } L ${x(0)} ${PAD_TOP + PLOT_HEIGHT} Z`}
              fill={`url(#${gradientId})`}
            />
          )}

          {hovered !== null && (
            <line
              x1={x(hovered)}
              y1={PAD_TOP}
              x2={x(hovered)}
              y2={PAD_TOP + PLOT_HEIGHT}
              stroke="var(--chart-axis)"
              strokeWidth="1"
            />
          )}

          {series.map((entry) => (
            <g key={entry.key}>
              <path
                d={linePath(data, entry.value, x, y)}
                fill="none"
                stroke={entry.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {/* A single point has no line to read, so it gets a dot. */}
              {data.length === 1 && (
                <circle
                  cx={x(0)}
                  cy={y(entry.value(data[0]))}
                  r="4"
                  fill={entry.color}
                />
              )}
              {hovered !== null && (
                <circle
                  cx={x(hovered)}
                  cy={y(entry.value(data[hovered]))}
                  r="4"
                  fill={entry.color}
                  stroke="var(--color-card)"
                  strokeWidth="2"
                />
              )}
            </g>
          ))}

          {/* Sparse x labels — every bucket labelled would collide. */}
          {data.map((point, index) => {
            const every = Math.ceil(data.length / 7);
            if (index % every !== 0 && index !== data.length - 1) return null;
            return (
              <text
                key={index}
                x={x(index)}
                y={PLOT_HEIGHT + PAD_TOP + 18}
                textAnchor={
                  index === 0
                    ? 'start'
                    : index === data.length - 1
                      ? 'end'
                      : 'middle'
                }
                className="fill-[var(--color-muted-foreground)] text-[10px]"
              >
                {label(point)}
              </text>
            );
          })}
        </svg>

        {active && (
          <div
            className={cn(
              'pointer-events-none absolute top-0 z-10 min-w-36 rounded-md border border-border bg-card px-2.5 py-1.5 shadow-md',
              // Flip the card before it runs off the right edge.
              hovered !== null && hovered > data.length / 2
                ? '-translate-x-full'
                : '',
            )}
            style={{
              left: `${((x(hovered ?? 0) + (hovered !== null && hovered > data.length / 2 ? -8 : 8)) / VIEW_WIDTH) * 100}%`,
            }}
          >
            <p className="text-[0.6875rem] font-medium text-muted-foreground">
              {label(active)}
            </p>
            {series.map((entry) => (
              <p
                key={entry.key}
                className="mt-0.5 flex items-center justify-between gap-3 text-xs"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: entry.color }}
                  />
                  {entry.label}
                </span>
                <span className="font-semibold tnum">
                  {entry.format(entry.value(active))}
                </span>
              </p>
            ))}
          </div>
        )}
      </div>

      <ChartTableView
        rows={data}
        label={label}
        series={series}
        open={tableOpen}
        onToggle={() => setTableOpen((open) => !open)}
      />
    </div>
  );
}

function linePath<T>(
  data: T[],
  value: (point: T) => number,
  x: (index: number) => number,
  y: (value: number) => number,
): string {
  return data
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(value(point))}`,
    )
    .join(' ');
}
