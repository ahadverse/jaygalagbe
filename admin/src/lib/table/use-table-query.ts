import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { SortOrder } from '@/lib/api/types';
import { useDebouncedValue } from './use-debounced-value';

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

export interface TableQueryConfig<TFilterKey extends string> {
  /** Column the table falls back to when the URL names none. */
  defaultSort: string;
  defaultOrder?: SortOrder;
  defaultLimit?: number;
  /** Filter params this table owns; anything else in the URL is left alone. */
  filterKeys: readonly TFilterKey[];
  /** Seed values applied on first load when the URL is empty. */
  defaultFilters?: Partial<Record<TFilterKey, string>>;
}

export interface TableQuery<TFilterKey extends string> {
  page: number;
  limit: number;
  sort: string;
  order: SortOrder;
  /** Debounced — this is what the request should use. */
  search: string;
  /** Immediate — bind this to the search box. */
  searchInput: string;
  filters: Record<TFilterKey, string>;
  activeFilterCount: number;
  isDirty: boolean;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  /** Same column toggles direction; a new column starts descending. */
  toggleSort: (column: string) => void;
  setSearchInput: (value: string) => void;
  setFilter: (key: TFilterKey, value: string) => void;
  resetFilters: () => void;
}

function toPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Every admin table keeps its search, filters, sort and page in the URL so a
 * view can be reloaded, bookmarked and pasted into a ticket, and so browser
 * back steps through what the moderator actually looked at.
 */
export function useTableQuery<TFilterKey extends string>(
  config: TableQueryConfig<TFilterKey>,
): TableQuery<TFilterKey> {
  const {
    defaultSort,
    defaultOrder = 'desc',
    defaultLimit = DEFAULT_PAGE_SIZE,
    filterKeys,
    defaultFilters,
  } = config;

  const [params, setParams] = useSearchParams();

  const page = toPositiveInt(params.get('page'), 1);
  const limit = toPositiveInt(params.get('limit'), defaultLimit);
  const sort = params.get('sort') ?? defaultSort;
  const order: SortOrder = params.get('order') === 'asc' ? 'asc' : defaultOrder;
  const search = params.get('q') ?? '';

  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebouncedValue(searchInput);

  const update = useCallback(
    (
      next: Record<string, string | number | undefined>,
      { keepPage = false } = {},
    ) => {
      setParams(
        (current) => {
          const draft = new URLSearchParams(current);
          for (const [key, value] of Object.entries(next)) {
            if (value === undefined || value === '') {
              draft.delete(key);
            } else {
              draft.set(key, String(value));
            }
          }
          // Narrowing the result set while on page 7 would show an empty table.
          if (!keepPage) draft.delete('page');
          return draft;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  // Push the debounced search term into the URL, but never on the first render
  // — that would strip an incoming `?q=` before the user has typed anything.
  const lastPushedSearch = useRef(search);
  useEffect(() => {
    if (debouncedSearch === lastPushedSearch.current) return;
    lastPushedSearch.current = debouncedSearch;
    update({ q: debouncedSearch });
  }, [debouncedSearch, update]);

  // Keep the box in step when the URL changes from elsewhere (back button,
  // "clear filters", a nav link that presets a filter).
  useEffect(() => {
    if (search === lastPushedSearch.current) return;
    lastPushedSearch.current = search;
    setSearchInput(search);
  }, [search]);

  // Seed defaults once, so a link like "Review queue" can land on ?status=PENDING.
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || !defaultFilters) return;
    seeded.current = true;

    const missing = Object.entries(defaultFilters).filter(
      ([key]) => !params.has(key),
    );
    if (missing.length > 0) {
      update(Object.fromEntries(missing) as Record<string, string>);
    }
  }, [defaultFilters, params, update]);

  const filters = useMemo(
    () =>
      Object.fromEntries(
        filterKeys.map((key) => [key, params.get(key) ?? '']),
      ) as Record<TFilterKey, string>,
    [filterKeys, params],
  );

  const activeFilterCount = useMemo(
    () => Object.values<string>(filters).filter(Boolean).length,
    [filters],
  );

  const resetFilters = useCallback(() => {
    setSearchInput('');
    lastPushedSearch.current = '';
    update({
      q: undefined,
      ...Object.fromEntries(filterKeys.map((key) => [key, undefined])),
    });
  }, [filterKeys, update]);

  const toggleSort = useCallback(
    (column: string) => {
      const nextOrder = sort === column && order === 'desc' ? 'asc' : 'desc';
      update({ sort: column, order: nextOrder });
    },
    [sort, order, update],
  );

  return {
    page,
    limit,
    sort,
    order,
    search,
    searchInput,
    filters,
    activeFilterCount,
    isDirty: activeFilterCount > 0 || search !== '',
    setPage: (next) => update({ page: next }, { keepPage: true }),
    setLimit: (next) => update({ limit: next }),
    toggleSort,
    setSearchInput,
    setFilter: (key, value) => update({ [key]: value }),
    resetFilters,
  };
}
