import type { AdStats } from "@/lib/ads/fetch-ad-stats";

export function StatsFunnel({ stats }: { stats: AdStats }) {
  const stages = [
    { label: "Impressions", value: stats.impressions },
    { label: "Visits (clicks)", value: stats.visits },
    { label: "Conversions", value: stats.conversions },
  ];
  const max = Math.max(1, ...stages.map((stage) => stage.value));

  return (
    <div className="flex flex-col gap-4">
      {stages.map((stage) => {
        const widthPct = (stage.value / max) * 100;
        return (
          <div key={stage.label} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-foreground">{stage.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {stage.value.toLocaleString()}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${stage.value > 0 ? Math.max(widthPct, 3) : 0}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
