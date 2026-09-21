import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { XIcon } from '@/components/ui/icons';
import { formatCount } from '@/lib/format';
import type { RowSelection } from '@/lib/table/use-row-selection';

/**
 * Appears only once something is selected, pinned to the bottom of the
 * viewport so the actions stay reachable however far down the table the
 * moderator has scrolled.
 */
export function BulkActionBar({
  selection,
  noun,
  children,
}: {
  selection: RowSelection;
  /** Singular; pluralised here. */
  noun: string;
  children: ReactNode;
}) {
  if (selection.count === 0) return null;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="sticky bottom-3 z-30 mx-auto mt-3 flex w-fit max-w-full flex-wrap items-center gap-2 rounded-lg border border-border-strong bg-card px-3 py-2 shadow-lg"
    >
      <span className="text-sm font-medium whitespace-nowrap tnum">
        {formatCount(selection.count)} {noun}
        {selection.count === 1 ? '' : 's'} selected
      </span>

      <span className="h-5 w-px bg-border" aria-hidden="true" />

      {children}

      <Button
        variant="ghost"
        size="xs"
        onClick={selection.clear}
        aria-label="Clear selection"
      >
        <XIcon className="h-3.5 w-3.5" />
        Clear
      </Button>
    </div>
  );
}
