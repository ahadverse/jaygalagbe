import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { SortOrder } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDownIcon, ArrowUpIcon, SortIcon } from '@/components/ui/icons';
import type { RowSelection } from '@/lib/table/use-row-selection';

export interface Column<T> {
  id: string;
  header: ReactNode;
  /** Set to make the column sortable; must match a backend sort field. */
  sortKey?: string;
  align?: 'left' | 'right';
  className?: string;
  /** Drop the column below this breakpoint to keep narrow screens readable. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  cell: (row: T) => ReactNode;
}

const HIDE_BELOW_CLASS = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
} as const;

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sort: string;
  order: SortOrder;
  onSort: (column: string) => void;
  isLoading: boolean;
  /** A background refetch — the table stays readable but dims. */
  isFetching?: boolean;
  error?: Error | null;
  empty: ReactNode;
  /** Small screens get cards instead of a squeezed table. */
  renderCard: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  /** Pass to add the checkbox column and bulk-selection behaviour. */
  selection?: RowSelection;
}

/**
 * A checkbox that can also show "some of these are selected". The indeterminate
 * state only exists as a DOM property, so it has to be set imperatively.
 */
function SelectCheckbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  label: string;
}) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      onClick={(event) => event.stopPropagation()}
      aria-label={label}
      className="h-4 w-4 cursor-pointer rounded border-border-strong accent-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    />
  );
}

function SortAffordance({
  active,
  order,
}: {
  active: boolean;
  order: SortOrder;
}) {
  if (!active) {
    return (
      <SortIcon className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
    );
  }
  return order === 'asc' ? (
    <ArrowUpIcon className="h-3 w-3 shrink-0 text-brand-600" />
  ) : (
    <ArrowDownIcon className="h-3 w-3 shrink-0 text-brand-600" />
  );
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  sort,
  order,
  onSort,
  isLoading,
  isFetching = false,
  error,
  empty,
  renderCard,
  onRowClick,
  selection,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-sm font-medium text-danger-700">
          Could not load this list
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <TableSkeleton columns={columns} />;
  }

  if (rows.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-150',
        isFetching && 'opacity-60',
      )}
      aria-busy={isFetching || undefined}
    >
      {/* Mobile: one card per record. */}
      <ul className="divide-y divide-border md:hidden">
        {rows.map((row) => {
          const id = rowKey(row);
          return (
            <li key={id} className="flex items-start gap-2.5 p-3">
              {selection && (
                <span className="pt-0.5">
                  <SelectCheckbox
                    checked={selection.isSelected(id)}
                    onChange={() => selection.toggle(id)}
                    label="Select row"
                  />
                </span>
              )}
              <div className="min-w-0 flex-1">{renderCard(row)}</div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: a real table, still scrollable if the viewport is narrow. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[48rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-ink-50">
              {selection && (
                <th scope="col" className="w-10 px-3 py-2">
                  <SelectCheckbox
                    checked={selection.allSelected}
                    indeterminate={selection.someSelected}
                    onChange={selection.toggleAll}
                    label="Select all rows on this page"
                  />
                </th>
              )}
              {columns.map((column) => {
                const isActive = column.sortKey === sort;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      isActive
                        ? order === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
                    className={cn(
                      'px-3 py-2 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                      column.align === 'right' && 'text-right',
                      column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                      column.className,
                    )}
                  >
                    {column.sortKey ? (
                      <button
                        type="button"
                        onClick={() => onSort(column.sortKey!)}
                        className={cn(
                          'group -mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 tracking-wide uppercase transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                          column.align === 'right' && 'flex-row-reverse',
                          isActive && 'text-foreground',
                        )}
                      >
                        {column.header}
                        <SortAffordance active={isActive} order={order} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const id = rowKey(row);
              const isSelected = selection?.isSelected(id) ?? false;

              return (
                <tr
                  key={id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'transition-colors duration-100',
                    // Selection is a state, so it keeps the brand tint. Hover
                    // is only an affordance, so it stays neutral — otherwise
                    // a moved cursor looks like a selected row.
                    isSelected
                      ? 'bg-brand-50/70 hover:bg-brand-50'
                      : 'hover:bg-ink-50',
                    onRowClick && 'cursor-pointer',
                  )}
                >
                  {selection && (
                    <td className="row-density w-10 align-middle">
                      <SelectCheckbox
                        checked={isSelected}
                        onChange={() => selection.toggle(id)}
                        label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        // `row-density` reads the density tokens set on <html>.
                        'row-density align-middle',
                        column.align === 'right' && 'text-right',
                        column.hideBelow && HIDE_BELOW_CLASS[column.hideBelow],
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeleton<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <div className="p-3 md:p-0">
      <div className="hidden border-b border-border bg-ink-50 px-3 py-2.5 md:block">
        <Skeleton className="h-3 w-40" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 8 }, (_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex items-center gap-3 py-3 md:px-3"
            style={{ opacity: 1 - rowIndex * 0.09 }}
          >
            {columns.slice(0, 5).map((column, cellIndex) => (
              <Skeleton
                key={column.id}
                className={cn('h-3.5', cellIndex === 0 ? 'w-1/3' : 'w-1/6')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
