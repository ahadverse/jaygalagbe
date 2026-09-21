/**
 * Series colours, by slot. Assigned in fixed order and never cycled — a
 * reader who learned "revenue is blue" must not have it repainted because a
 * filter dropped another series. See the note in `index.css` for the
 * validation results behind this order.
 */
export const SERIES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
] as const;

/** Ordinal ramp for ordered stages (funnel), light → dark. */
export const STEPS = [
  'var(--chart-step-1)',
  'var(--chart-step-2)',
  'var(--chart-step-3)',
] as const;

export interface SeriesSpec<T> {
  key: string;
  label: string;
  color: string;
  value: (point: T) => number;
  format: (value: number) => string;
}

/** Rounds an axis maximum up to something a human would choose. */
export function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const normalized = max / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}
