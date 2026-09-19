import Link from "next/link";
import { Button, Select, buttonVariants } from "@/components/ui";
import { STATS_RANGE_PRESETS } from "@/lib/analytics/date-range";

const DEFAULT_RANGE = "30d";

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
  const isFiltered = range !== DEFAULT_RANGE || Boolean(adId);

  return (
    <form
      action={action}
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <Select
        name="range"
        label="Date range"
        defaultValue={range}
        fieldClassName="w-full sm:w-44"
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
          label="Listing"
          defaultValue={adId ?? ""}
          fieldClassName="w-full sm:w-56"
        >
          <option value="">All listings</option>
          {ads.map((ad) => (
            <option key={ad.id} value={ad.id}>
              {ad.title}
            </option>
          ))}
        </Select>
      )}

      <div className="flex items-center gap-2">
        <Button type="submit" variant="outline" size="sm" className="flex-1 sm:flex-none">
          Apply
        </Button>
        {isFiltered && (
          <Link
            href={action}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Reset
          </Link>
        )}
      </div>
    </form>
  );
}
