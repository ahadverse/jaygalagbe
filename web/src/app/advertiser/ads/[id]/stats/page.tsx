import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, buttonVariants } from "@/components/ui";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsFilters } from "@/components/dashboard/stats-filters";
import { TrendChart } from "@/components/charts/trend-chart";
import { FunnelBarChart } from "@/components/charts/funnel-bar-chart";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { fetchAdStats } from "@/lib/ads/fetch-ad-stats";
import { resolveStatsRange } from "@/lib/analytics/date-range";
import { firstSearchParam } from "@/lib/utils";

export default async function AdStatsPage({
  params,
  searchParams,
}: PageProps<"/advertiser/ads/[id]/stats">) {
  const user = await requireUser();
  const { id } = await params;
  const token = (await getToken())!;

  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  const resolved = await searchParams;
  const { range, from, to } = resolveStatsRange(firstSearchParam(resolved?.range));
  const stats = await fetchAdStats(id, token, { from, to });

  const hasActivity =
    !!stats && (stats.impressions > 0 || stats.visits > 0 || stats.conversions > 0);
  const seriesHasData =
    !!stats &&
    stats.series.some(
      (point) => point.impressions > 0 || point.visits > 0 || point.conversions > 0,
    );
  const clickRate =
    stats && stats.impressions > 0 ? stats.visits / stats.impressions : 0;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-brand-700">Performance</p>
        <h1 className="font-heading text-title text-neutral-900">
          Ad statistics
        </h1>
        <p className="truncate text-sm text-muted-foreground">{ad.title}</p>
      </header>

      {!stats ? (
        <EmptyState
          tone="danger"
          title="Statistics didn't load"
          description="We couldn't reach the analytics service. Try refreshing in a moment."
          action={
            <Link
              href="/advertiser"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Back to your ads
            </Link>
          }
        />
      ) : !hasActivity ? (
        <EmptyState
          title="No activity yet"
          description="Once people start seeing and opening this listing, impressions, visits, and conversions will show up here."
          action={
            <Link
              href={`/ads/${ad.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              View listing
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <StatsFilters action={`/advertiser/ads/${id}/stats`} range={range} />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Impressions" value={stats.impressions.toLocaleString()} hint="Times shown in a feed" />
            <StatCard label="Visits" value={stats.visits.toLocaleString()} hint="Listing opened" />
            <StatCard label="Conversions" value={stats.conversions.toLocaleString()} hint="Signed up to contact you" tone="accent" />
            <StatCard label="Click-through" value={`${(clickRate * 100).toFixed(1)}%`} hint="Visits ÷ impressions" tone="info" />
            <StatCard label="Conversion rate" value={`${(stats.conversionRate * 100).toFixed(1)}%`} hint="Sign-ups ÷ visits" tone="success" />
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-base font-bold text-foreground">Activity over time</h2>
              <p className="text-xs text-muted-foreground">Impressions, visits, and conversions per day.</p>
            </div>
            {seriesHasData ? (
              <TrendChart data={stats.series} />
            ) : (
              <p className="rounded-lg bg-muted/70 px-4 py-6 text-center text-sm text-muted-foreground">
                No activity in the selected range. Try a wider date range.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
            <h2 className="font-heading text-base font-bold text-foreground">Performance funnel</h2>
            <FunnelBarChart
              stages={[
                { label: "Impressions", value: stats.impressions },
                { label: "Visits", value: stats.visits },
                { label: "Conversions", value: stats.conversions },
              ]}
            />
          </div>
        </div>
      )}
    </main>
  );
}
