import { BadRequestException } from '@nestjs/common';
import {
  DEFAULT_RANGE,
  MAX_BUCKETS,
  RANGE_PRESETS,
  type AnalyticsQueryDto,
  type Granularity,
} from './dto/analytics-query.dto.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ResolvedRange {
  from: Date;
  to: Date;
  granularity: Granularity;
  /** The equally-long window immediately before `from`, for the deltas. */
  previousFrom: Date;
  previousTo: Date;
  days: number;
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

/** Keeps a long range from producing hundreds of unreadable daily points. */
function defaultGranularity(days: number): Granularity {
  if (days <= 31) return 'day';
  if (days <= 180) return 'week';
  return 'month';
}

function bucketCount(days: number, granularity: Granularity): number {
  if (granularity === 'day') return days;
  if (granularity === 'week') return Math.ceil(days / 7);
  return Math.ceil(days / 28);
}

/**
 * Turns `?range=30d` or `?from=&to=` into a concrete window plus the matching
 * previous window. Every KPI on the dashboard is "this window vs the one
 * before it", so the comparison period is resolved once, here, rather than
 * recomputed per metric.
 */
export function resolveRange(query: AnalyticsQueryDto): ResolvedRange {
  let from: Date;
  let to: Date;

  if (query.from && query.to) {
    from = startOfDay(new Date(query.from));
    to = endOfDay(new Date(query.to));
    if (from > to) {
      throw new BadRequestException('`from` must not be after `to`');
    }
  } else {
    const days = RANGE_PRESETS[query.range ?? DEFAULT_RANGE];
    to = endOfDay(new Date());
    from = startOfDay(new Date(to.getTime() - (days - 1) * DAY_MS));
  }

  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / DAY_MS));
  const granularity = query.granularity ?? defaultGranularity(days);

  if (bucketCount(days, granularity) > MAX_BUCKETS) {
    throw new BadRequestException(
      `That range is too long for ${granularity} buckets — pick a coarser granularity`,
    );
  }

  const span = to.getTime() - from.getTime();

  return {
    from,
    to,
    granularity,
    previousFrom: new Date(from.getTime() - span - 1),
    previousTo: new Date(from.getTime() - 1),
    days,
  };
}

/**
 * `2026-09-21` / `2026-W38` / `2026-09` — the key a row is bucketed under.
 * Bucketing in JS rather than SQL keeps this database-portable and means the
 * week boundary matches the one the labels are generated from.
 */
export function bucketKey(date: Date, granularity: Granularity): string {
  const year = date.getFullYear();

  if (granularity === 'month') {
    return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  if (granularity === 'week') {
    const monday = startOfWeek(date);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(
      monday.getDate(),
    ).padStart(2, '0')}`;
  }

  return `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

function startOfWeek(date: Date): Date {
  const copy = startOfDay(date);
  // ISO weeks start Monday; `getDay()` makes Sunday 0.
  const offset = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - offset);
  return copy;
}

/**
 * Every bucket in the window, in order, including the empty ones — a gap in a
 * time series has to render as zero, not as a missing point the line skips over.
 */
export function bucketKeys(range: ResolvedRange): string[] {
  const keys: string[] = [];
  const cursor =
    range.granularity === 'week'
      ? startOfWeek(range.from)
      : range.granularity === 'month'
        ? new Date(range.from.getFullYear(), range.from.getMonth(), 1)
        : startOfDay(range.from);

  while (cursor <= range.to) {
    keys.push(bucketKey(cursor, range.granularity));

    if (range.granularity === 'month') {
      cursor.setMonth(cursor.getMonth() + 1);
    } else {
      cursor.setDate(cursor.getDate() + (range.granularity === 'week' ? 7 : 1));
    }
  }

  return keys;
}

/** Percentage change, or `null` when there is no baseline to compare against. */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}
