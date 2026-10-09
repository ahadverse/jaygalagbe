import type { Ad } from "@/lib/ads/types";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-5 py-6 text-center sm:px-6 sm:py-7">
      <span className="numeric font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
        {value}
      </span>
      <span className="text-xs font-medium text-muted-foreground sm:text-sm">
        {label}
      </span>
    </div>
  );
}

/** Below this many districts the numbers undersell a nationwide site. */
const MIN_DISTRICTS_TO_SHOW_STATS = 20;

export function StatsBand({ ads }: { ads: Ad[] }) {
  const districts = new Set(ads.map((ad) => ad.locationDistrict)).size;
  const landCount = ads.filter((ad) => ad.sector === "LAND").length;
  const houseCount = ads.filter((ad) => ad.sector === "HOUSE_RENT").length;

  if (districts < MIN_DISTRICTS_TO_SHOW_STATS) {
    return (
      <section className="shell relative z-10">
        {/* Overlaps the hero, which reserves bottom padding for it. */}
        <div className="-mt-14 flex flex-col items-center gap-1.5 rounded-2xl bg-card px-6 py-8 text-center shadow-lg ring-1 ring-neutral-900/5 sm:-mt-16 sm:py-10">
          <span className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Growing across Bangladesh
          </span>
          <span className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Land and rental listings from multiple districts across Bangladesh.
          </span>
        </div>
      </section>
    );
  }


  const stats = [
    { label: "Live listings", value: String(ads.length) },
    { label: "Districts covered", value: String(districts) },
    { label: "Land for sale", value: String(landCount) },
    { label: "Houses for rent", value: String(houseCount) },
  ];

  return (
    <section className="shell relative z-10">
      {/* Overlaps the hero, which reserves bottom padding for it. */}
      <div className="-mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-lg ring-1 ring-neutral-900/5 sm:-mt-16 sm:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
