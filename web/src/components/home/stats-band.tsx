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

export function StatsBand({ ads }: { ads: Ad[] }) {
  const districts = new Set(ads.map((ad) => ad.locationDistrict)).size;
  const landCount = ads.filter((ad) => ad.sector === "LAND").length;
  const houseCount = ads.filter((ad) => ad.sector === "HOUSE_RENT").length;

  const stats = [
    { label: "Live listings", value: String(ads.length) },
    { label: "Districts covered", value: String(districts) },
    { label: "Land for sale", value: String(landCount) },
    { label: "Houses for rent", value: String(houseCount) },
  ];

  return (
    <section className="shell relative z-10">
      {/*
       * A committed overlap: the hero reserves bottom padding for this shelf,
       * and the shelf answers with matching 2xl radii and a real drop shadow
       * so it reads as a card lifted off the photograph.
       */}
      <div className="-mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-lg ring-1 ring-neutral-900/5 sm:-mt-16 sm:grid-cols-4">
        {stats.map((stat) => (
          <StatTile key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>
    </section>
  );
}
