import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { KpiTile } from '@/components/charts/kpi-tile';
import { SERIES } from '@/components/charts/chart-tokens';
import { TimeSeriesChart } from '@/components/charts/time-series-chart';
import { FunnelChart } from '@/components/charts/funnel-chart';
import { BarList, type BarDatum } from '@/components/charts/bar-list';
import { RangePicker } from '@/components/charts/range-picker';
import { bucketLabel, useRangeState } from '@/lib/charts/use-range-state';
import { useDashboardQuery } from '@/lib/api/queries';
import { AD_STATUS_LABEL, SECTOR_LABEL } from '@/lib/ads/labels';
import {
  formatCompactTaka,
  formatCount,
  formatRelative,
  formatTaka,
} from '@/lib/format';
import { AttentionStrip } from './attention-strip';
import { ActivityFeed } from './activity-feed';
import type { AdStatus, SeriesPoint } from '@/lib/api/types';

/** Lifecycle order, not size order. */
const STATUS_ORDER: AdStatus[] = [
  'PENDING',
  'LIVE',
  'SOLD',
  'REJECTED',
  'REMOVED',
];

/**
 * Status is state, not identity, so these are the reserved status colours the
 * badges already use — never a categorical series slot.
 */
const STATUS_COLOR: Record<AdStatus, string> = {
  PENDING: 'bg-warning-500',
  LIVE: 'bg-success-500',
  SOLD: 'bg-info-500',
  REJECTED: 'bg-danger-500',
  REMOVED: 'bg-ink-400',
};

export function DashboardPage() {
  const range = useRangeState();
  const { data, isLoading, isFetching, error } = useDashboardQuery(
    range.params as Record<string, string | undefined>,
  );

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <Card>
          <CardBody>
            <p className="text-sm text-danger-700">
              Could not load platform statistics. {error.message}
            </p>
          </CardBody>
        </Card>
      </>
    );
  }

  const granularity = data?.range.granularity ?? 'day';
  const series = data?.series ?? [];
  const label = (point: SeriesPoint) => bucketLabel(point.bucket, granularity);

  const statusBars: BarDatum[] = STATUS_ORDER.flatMap((status) => {
    const entry = data?.moderation.statusMix.find((m) => m.status === status);
    return entry
      ? [
          {
            key: status,
            label: AD_STATUS_LABEL[status],
            value: entry.count,
            color: STATUS_COLOR[status],
          },
        ]
      : [];
  });

  const sectorBars: BarDatum[] =
    data?.moderation.sectorMix.map((entry, index) => ({
      key: entry.sector,
      label: SECTOR_LABEL[entry.sector],
      value: entry.count,
      color: '',
      style: { background: SERIES[index % SERIES.length] },
    })) ?? [];

  const reportedBars: BarDatum[] =
    data?.mostReported.map((advertiser) => ({
      key: advertiser.id,
      label: advertiser.name,
      value: advertiser.reportCount,
      color: 'bg-danger-500',
    })) ?? [];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Platform health for the selected period, plus everything waiting on a decision right now."
      />

      {/* One range control above everything it scopes — no per-card filters. */}
      <div className="mb-4">
        <RangePicker state={range} />
      </div>

      <AttentionStrip attention={data?.attention} loading={isLoading} />

      <div
        className={
          isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''
        }
      >
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile
            label="Boost revenue"
            value={formatTaka(data?.kpis.revenue.current ?? 0)}
            kpi={data?.kpis.revenue}
            hint="settled, this period"
            to="/transactions"
            loading={isLoading}
          />
          <KpiTile
            label="New listings"
            value={formatCount(data?.kpis.newAds.current ?? 0)}
            kpi={data?.kpis.newAds}
            hint={`${formatCount(data?.kpis.liveAds.current ?? 0)} live now`}
            to="/ads"
            loading={isLoading}
          />
          <KpiTile
            label="New accounts"
            value={formatCount(data?.kpis.newUsers.current ?? 0)}
            kpi={data?.kpis.newUsers}
            to="/users"
            loading={isLoading}
          />
          <KpiTile
            label="Listing visits"
            value={formatCount(data?.kpis.visits.current ?? 0)}
            kpi={data?.kpis.visits}
            hint={`${formatCount(data?.kpis.conversions.current ?? 0)} contacts`}
            loading={isLoading}
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Boost revenue</CardTitle>
              <span className="text-xs text-muted-foreground">
                Settled payments
              </span>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <TimeSeriesChart
                  data={series}
                  label={label}
                  area
                  emptyLabel="No settled boost payments in this period."
                  series={[
                    {
                      key: 'revenue',
                      label: 'Revenue',
                      color: SERIES[0],
                      value: (point) => point.revenue,
                      format: formatCompactTaka,
                    },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic funnel</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                <FunnelChart stages={data?.funnel ?? []} />
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Supply and demand</CardTitle>
              <span className="text-xs text-muted-foreground">
                New listings against new accounts
              </span>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <TimeSeriesChart
                  data={series}
                  label={label}
                  emptyLabel="Nothing was created in this period."
                  series={[
                    {
                      key: 'ads',
                      label: 'New listings',
                      color: SERIES[0],
                      value: (point) => point.ads,
                      format: formatCount,
                    },
                    {
                      key: 'users',
                      label: 'New accounts',
                      color: SERIES[1],
                      value: (point) => point.users,
                      format: formatCount,
                    },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent admin activity</CardTitle>
              <Link
                to="/audit-log"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Full log
              </Link>
            </CardHeader>
            <CardBody className="p-0">
              <ActivityFeed
                entries={data?.recentActivity ?? []}
                loading={isLoading}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listings by status</CardTitle>
              <span className="text-xs text-muted-foreground">All time</span>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-36 w-full" />
              ) : (
                <BarList data={statusBars} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New listings by sector</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-36 w-full" />
              ) : (
                <BarList
                  data={sectorBars}
                  emptyLabel="No listings created in this period."
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most reported advertisers</CardTitle>
              <Link
                to="/reports"
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Report queue
              </Link>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-36 w-full" />
              ) : (
                <BarList
                  data={reportedBars}
                  emptyLabel="No advertiser has been reported yet."
                />
              )}
            </CardBody>
          </Card>
        </div>

        <Card className="mt-3">
          <CardHeader>
            <CardTitle>Moderation this period</CardTitle>
            {data?.attention.oldestPendingAt && (
              <span className="text-xs text-muted-foreground">
                Oldest submission waiting{' '}
                {formatRelative(data.attention.oldestPendingAt)}
              </span>
            )}
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Figure
                  label="Decisions made"
                  value={formatCount(data?.moderation.decided ?? 0)}
                />
                <Figure
                  label="Approval rate"
                  value={
                    data?.moderation.approvalRate === null ||
                    data?.moderation.approvalRate === undefined
                      ? '—'
                      : `${Math.round(data.moderation.approvalRate * 100)}%`
                  }
                  detail={`${formatCount(data?.moderation.approved ?? 0)} approved · ${formatCount(
                    data?.moderation.rejected ?? 0,
                  )} rejected`}
                />
                <Figure
                  label="Median time to decide"
                  value={
                    data?.moderation.medianDecisionHours === null ||
                    data?.moderation.medianDecisionHours === undefined
                      ? '—'
                      : `${data.moderation.medianDecisionHours} h`
                  }
                />
                <Figure
                  label="Waiting now"
                  value={formatCount(data?.moderation.pendingNow ?? 0)}
                  badge={
                    (data?.attention.overdueAds ?? 0) > 0 ? (
                      <Badge tone="danger">
                        {formatCount(data?.attention.overdueAds ?? 0)} overdue
                      </Badge>
                    ) : undefined
                  }
                />
              </dl>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Figure({
  label,
  value,
  detail,
  badge,
}: {
  label: string;
  value: string;
  detail?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-center gap-2">
        <span className="text-xl font-semibold tracking-tight">{value}</span>
        {badge}
      </dd>
      {detail && (
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}
