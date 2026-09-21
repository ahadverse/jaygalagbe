import { SegmentedControl } from '@/components/ui/segmented-control';
import { FilterInput } from '@/components/table/table-toolbar';
import { Button } from '@/components/ui/button';
import { XIcon } from '@/components/ui/icons';
import type { RangeStateApi } from '@/lib/charts/use-range-state';
import type { Granularity, RangePreset } from '@/lib/api/types';

const PRESETS: { value: RangePreset; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
  { value: '365d', label: '12 months' },
];

const GRANULARITIES: { value: Granularity; label: string }[] = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
];

/**
 * One range control above everything it scopes — never per-card filters, so
 * every chart on the page always shows the same slice.
 */
export function RangePicker({
  state,
  showGranularity = true,
}: {
  state: RangeStateApi;
  showGranularity?: boolean;
}) {
  const hasCustom = state.custom.from !== '' && state.custom.to !== '';

  return (
    <div className="flex flex-wrap items-end gap-2">
      {/*
        `preset` is empty while a custom range is active, so no segment reads
        as selected — which is correct: the dates below are what is in force.
      */}
      <SegmentedControl<RangePreset | ''>
        label="Date range"
        value={state.preset}
        onChange={(value) => state.setPreset(value as RangePreset)}
        options={PRESETS}
      />

      <FilterInput
        label="From"
        type="date"
        value={state.custom.from}
        onChange={(value) => state.setCustom('from', value)}
        className="w-36"
      />
      <FilterInput
        label="To"
        type="date"
        value={state.custom.to}
        onChange={(value) => state.setCustom('to', value)}
        className="w-36"
      />

      {hasCustom && (
        <Button variant="ghost" size="sm" onClick={state.clearCustom}>
          <XIcon className="h-3.5 w-3.5" />
          Clear dates
        </Button>
      )}

      {showGranularity && (
        <SegmentedControl
          label="Granularity"
          value={state.granularity}
          onChange={state.setGranularity}
          options={[{ value: '', label: 'Auto' }, ...GRANULARITIES]}
          className="ml-auto"
        />
      )}
    </div>
  );
}
