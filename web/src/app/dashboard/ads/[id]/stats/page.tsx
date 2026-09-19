import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, buttonVariants } from "@/components/ui";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel, PanelNote } from "@/components/dashboard/panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatsFilters } from "@/components/dashboard/stats-filters";
import { DashboardIcon } from "@/components/dashboard/icons";
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
}: PageProps<"/dashboard/ads/[id]/stats">) {
  const user = await requireUser();
  const { id } = await params;
  const token = (await getToken())!;

  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  const resolved = await searchParams;
  const { range, from, to } = resolveStatsRange(
    firstSearchParam(resolved?.range),
  );
  const stats = await fetchAdStats(id, token, { from, to });

  const hasActivity =
    !!stats &&
    (stats.impressions > 0 || stats.visits > 0 || stats.conversions > 0);
  const seriesHasData = stats?.series.some(
    (point) =>
      point.impressions > 0 || point.visits > 0 || point.conversions > 0,
  );
  const clickRate =
    stats && stats.impressions > 0 ? stats.visits / stats.impressions : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        eyebrow="Performance"
        title="Listing statistics"
        description={ad.title}
        action={
          <Link
            href="/dashboard/ads"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to listings
          </Link>
        }
      />

      {!stats ? (
        <EmptyState
          tone="danger"
          title="Statistics didn't load"
          description="We couldn't reach the analytics service. Try refreshing in a moment."
        />
      ) : !hasActivity ? (
        <EmptyState
          title="No activity yet"
          description="Once people start seeing and opening this listing, impressions, visits and leads will show up here."
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
        <>
          <Panel title="Filters">
            <StatsFilters
              action={`/dashboard/ads/${id}/stats`}
              range={range}
            />
          </Panel>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <StatCard
              label="Impressions"
              value={stats.impressions.toLocaleString()}
              hint="Times shown in a feed"
              icon={<DashboardIcon name="eye" />}
            />
            <StatCard
              label="Visits"
              value={stats.visits.toLocaleString()}
              hint="Listing opened"
              tone="info"
              icon={<DashboardIcon name="cursor" />}
            />
            <StatCard
              label="Leads"
              value={stats.conversions.toLocaleString()}
              hint="Signed up to contact you"
              tone="accent"
              icon={<DashboardIcon name="spark" />}
            />
            <StatCard
              label="Click-through"
              value={`${(clickRate * 100).toFixed(1)}%`}
              hint="Visits ÷ impressions"
              tone="warning"
              icon={<DashboardIcon name="trend" />}
            />
            <StatCard
              label="Conversion rate"
              value={`${(stats.conversionRate * 100).toFixed(1)}%`}
              hint="Leads ÷ visits"
              tone="success"
              className="col-span-2 lg:col-span-1"
              icon={<DashboardIcon name="trend" />}
            />
          </div>

          <Panel
            title="Activity over time"
            description="Impressions, visits and leads per day."
          >
            {seriesHasData ? (
              <TrendChart data={stats.series} />
            ) : (
              <PanelNote>
                No activity in the selected range. Try a wider date range.
              </PanelNote>
            )}
          </Panel>

          <Panel
            title="Performance funnel"
            description="How far people get from seeing this listing to contacting you."
          >
            <FunnelBarChart
              stages={[
                { label: "Impressions", value: stats.impressions },
                { label: "Visits", value: stats.visits },
                { label: "Leads", value: stats.conversions },
              ]}
            />
          </Panel>
        </>
      )}
    </div>
  );
}
