import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
} from '@/components/ui/icons';

interface TableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  /** Filter controls; laid out in a wrapping row, collapsible on mobile. */
  filters?: ReactNode;
  activeFilterCount?: number;
  onReset?: () => void;
  isDirty?: boolean;
  /** Extra actions pinned to the right of the search row. */
  actions?: ReactNode;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filters,
  activeFilterCount = 0,
  onReset,
  isDirty = false,
  actions,
}: TableToolbarProps) {
  // Filters take a lot of vertical space on a phone, so they start collapsed
  // there — unless some are already applied, which the user needs to see.
  const [showFilters, setShowFilters] = useState(activeFilterCount > 0);

  return (
    <div className="flex flex-col gap-3 border-b border-border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-56">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 w-full rounded-md border border-border-strong bg-card pr-8 pl-8 text-sm text-foreground shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          />
          {searchValue && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-ink-400 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <XIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {filters && (
          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowFilters((open) => !open)}
            aria-expanded={showFilters}
            className="lg:hidden"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-brand-600 px-1.5 text-[0.6875rem] font-semibold text-white tnum">
                {activeFilterCount}
              </span>
            )}
            <ChevronDownIcon
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                showFilters && 'rotate-180',
              )}
            />
          </Button>
        )}

        {actions}
      </div>

      {filters && (
        <div
          className={cn(
            'flex-wrap items-end gap-2 lg:flex',
            showFilters ? 'flex' : 'hidden',
          )}
        >
          {filters}
          {isDirty && onReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="mb-0.5">
              <XIcon className="h-3.5 w-3.5" />
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/** A labelled filter control sized to sit in the toolbar's wrapping row. */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel = 'All',
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel?: string;
  className?: string;
}) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-9 cursor-pointer rounded-md border bg-card px-2 pr-7 text-sm text-foreground shadow-xs transition-colors hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
          value ? 'border-brand-300 bg-brand-50/50' : 'border-border-strong',
        )}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Text/number/date filter input, styled to match `FilterSelect`. */
export function FilterInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'date';
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-9 w-full rounded-md border bg-card px-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30',
          value ? 'border-brand-300 bg-brand-50/50' : 'border-border-strong',
        )}
      />
    </label>
  );
}
