export const STATS_RANGE_PRESETS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "365d", label: "Last 12 months", days: 365 },
] as const;

export type StatsRangeValue = (typeof STATS_RANGE_PRESETS)[number]["value"];

const DEFAULT_RANGE: StatsRangeValue = "30d";

export function resolveStatsRange(value?: string): {
  range: StatsRangeValue;
  from: string;
  to: string;
} {
  const preset =
    STATS_RANGE_PRESETS.find((candidate) => candidate.value === value) ??
    STATS_RANGE_PRESETS.find((candidate) => candidate.value === DEFAULT_RANGE)!;
  const to = new Date();
  const from = new Date(to.getTime() - (preset.days - 1) * 86_400_000);

  return {
    range: preset.value,
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
