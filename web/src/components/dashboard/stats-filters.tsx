import { Button, Select } from "@/components/ui";
import { STATS_RANGE_PRESETS } from "@/lib/analytics/date-range";

export function StatsFilters({
  action,
  range,
  ads,
  adId,
}: {
  action: string;
  range: string;
  ads?: { id: string; title: string }[];
  adId?: string;
}) {
  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-3 rounded-xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5"
    >
      <Select
        name="range"
        label="Date range"
        defaultValue={range}
        fieldClassName="w-full sm:w-48"
      >
        {STATS_RANGE_PRESETS.map((preset) => (
          <option key={preset.value} value={preset.value}>
            {preset.label}
          </option>
        ))}
      </Select>

      {ads && ads.length > 1 && (
        <Select
          name="adId"
          label="Ad"
          defaultValue={adId ?? ""}
          fieldClassName="w-full sm:w-56"
        >
          <option value="">All ads</option>
          {ads.map((ad) => (
            <option key={ad.id} value={ad.id}>
              {ad.title}
            </option>
          ))}
        </Select>
      )}

      <Button type="submit" variant="outline" size="sm">
        Apply
      </Button>
    </form>
  );
}
