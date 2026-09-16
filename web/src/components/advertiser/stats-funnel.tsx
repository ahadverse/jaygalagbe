import type { AdStats } from "@/lib/ads/fetch-ad-stats";

export function StatsFunnel({ stats }: { stats: AdStats }) {
  const stages = [
    {
      label: "Impressions",
      hint: "Times this card appeared in a feed",
      value: stats.impressions,
      bar: "bg-brand-300",
    },
    {
      label: "Visits",
      hint: "People who opened the listing",
      value: stats.visits,
      bar: "bg-brand-500",
    },
    {
      label: "Conversions",
      hint: "Signed up to contact you from this ad",
      value: stats.conversions,
      bar: "bg-accent-600",
    },
  ];
  const max = Math.max(1, ...stages.map((stage) => stage.value));

  return (
    <div className="flex flex-col gap-5">
      {stages.map((stage) => {
        const widthPct = (stage.value / max) * 100;
        return (
          <div key={stage.label} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {stage.label}
              </span>
              <span className="numeric font-heading text-lg font-bold tracking-tight text-neutral-900">
                {stage.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-150">
              <div
                className={`h-full rounded-full ${stage.bar} transition-[width] duration-500 ease-soft`}
                style={{ width: `${stage.value > 0 ? Math.max(widthPct, 4) : 0}%` }}
              />
            </div>
            <p className="text-xs text-subtle-foreground">{stage.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
