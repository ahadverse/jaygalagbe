import { useSearchParams } from 'react-router';
import type { Granularity, RangePreset } from '@/lib/api/types';

export interface RangeState {
  range?: string;
  from?: string;
  to?: string;
  granularity?: string;
}

/**
 * The dashboard's and analytics page's date range, held in the URL like the
 * tables' filters are — so a range can be bookmarked, reloaded and pasted
 * into a ticket.
 */
export function useRangeState() {
  const [search, setSearch] = useSearchParams();

  const from = search.get('from') ?? '';
  const to = search.get('to') ?? '';
  const granularity = search.get('granularity') ?? '';
  // A complete custom range wins; the preset is what is left over.
  const hasCustom = from !== '' && to !== '';
  const preset = (hasCustom ? '' : (search.get('range') ?? '30d')) as
    | RangePreset
    | '';

  function update(next: Record<string, string | undefined>) {
    setSearch(
      (current) => {
        const draft = new URLSearchParams(current);
        for (const [key, value] of Object.entries(next)) {
          if (value === undefined || value === '') {
            draft.delete(key);
          } else {
            draft.set(key, value);
          }
        }
        return draft;
      },
      { replace: true },
    );
  }

  return {
    params: {
      range: hasCustom ? undefined : (search.get('range') ?? undefined),
      from: hasCustom ? from : undefined,
      to: hasCustom ? to : undefined,
      granularity: granularity || undefined,
    } satisfies RangeState,
    preset,
    custom: { from, to },
    granularity,
    setPreset: (next: RangePreset) =>
      update({ range: next, from: undefined, to: undefined }),
    setCustom: (key: 'from' | 'to', value: string) =>
      update({ [key]: value, range: undefined }),
    setGranularity: (next: string) => update({ granularity: next }),
    clearCustom: () =>
      update({ from: undefined, to: undefined, range: '30d' }),
  };
}

export type RangeStateApi = ReturnType<typeof useRangeState>;

/** `2026-09-21` / `2026-09` → a short axis label. */
export function bucketLabel(bucket: string, granularity: Granularity): string {
  const parts = bucket.split('-').map(Number);
  const date = new Date(parts[0], (parts[1] ?? 1) - 1, parts[2] ?? 1);

  if (granularity === 'month') {
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      year: '2-digit',
    });
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
