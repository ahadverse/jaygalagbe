import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import type { PageMeta } from '@/lib/api/types';
import { PAGE_SIZE_OPTIONS } from '@/lib/table/use-table-query';
import { Button } from '@/components/ui/button';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from '@/components/ui/icons';

interface PaginationBarProps {
  meta: PageMeta | undefined;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  /** Noun for the "of N ads" summary. */
  noun: string;
}

/** Compact window of page numbers: 1 … 4 5 [6] 7 8 … 21 */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  for (const offset of [-1, 1]) {
    const page = current + offset;
    if (page > 1 && page < total) pages.add(page);
  }
  if (current <= 3) pages.add(2).add(3).add(4);
  if (current >= total - 2) pages.add(total - 1).add(total - 2).add(total - 3);

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? ['gap' as const, page] : [page],
  );
}

export function PaginationBar({
  meta,
  onPageChange,
  onLimitChange,
  noun,
}: PaginationBarProps) {
  const limit = meta?.limit ?? PAGE_SIZE_OPTIONS[1];
  const page = meta?.page ?? 1;
  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  const firstRow = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastRow = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-border bg-ink-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Rows per page</span>
          <span className="sm:hidden">Rows</span>
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-7 cursor-pointer rounded-md border border-border-strong bg-card px-1.5 pr-6 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <p className="text-xs text-muted-foreground tnum">
          {total === 0 ? (
            `No ${noun}`
          ) : (
            <>
              <span className="font-medium text-foreground">
                {formatCount(firstRow)}–{formatCount(lastRow)}
              </span>{' '}
              of {formatCount(total)} {noun}
            </>
          )}
        </p>
      </div>

      {totalPages > 1 && (
        <nav
          className="flex items-center gap-1"
          aria-label={`${noun} pagination`}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            aria-label="First page"
            className="hidden sm:inline-flex"
          >
            <ChevronsLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>

          <div className="hidden items-center gap-0.5 sm:flex">
            {pageWindow(page, totalPages).map((entry, index) =>
              entry === 'gap' ? (
                <span
                  key={`gap-${index}`}
                  className="px-1 text-xs text-ink-400"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => onPageChange(entry)}
                  aria-current={entry === page ? 'page' : undefined}
                  className={cn(
                    'h-8 min-w-8 rounded-md px-2 text-xs font-medium transition-colors tnum focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                    entry === page
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-ink-200/70 hover:text-foreground',
                  )}
                >
                  {entry}
                </button>
              ),
            )}
          </div>

          <span className="px-1 text-xs text-muted-foreground tnum sm:hidden">
            {page} / {totalPages}
          </span>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            aria-label="Last page"
            className="hidden sm:inline-flex"
          >
            <ChevronsRightIcon className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
