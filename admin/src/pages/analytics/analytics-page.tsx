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
import { useAnalyticsQuery } from '@/lib/api/queries';
import { SECTOR_LABEL } from '@/lib/ads/labels';
import { formatCompactTaka, formatCount, formatTaka } from '@/lib/format';
import type { SeriesPoint } from '@/lib/api/types';

export function AnalyticsPage() {
  const range = useRangeState();
  const { data, isLoading, isFetching, error } = useAnalyticsQuery(
    range.params as Record<string, string | undefined>,
  );

  if (error) {
    return (
      <>
        <PageHeader title="Analytics" />
        <Card>
          <CardBody>
            <p className="text-sm text-danger-700">
              Could not load analytics. {error.message}
            </p>
          </CardBody>
        </Card>
      </>
    );
  }

  const granularity = data?.range.granularity ?? 'day';
  const series = data?.series ?? [];
  const label = (point: SeriesPoint) => bucketLabel(point.bucket, granularity);

  const districtBars: BarDatum[] =
    data?.topDistricts.map((entry) => ({
      key: entry.district,
      label: entry.district,
      value: entry.ads,
      color: '',
      style: { background: SERIES[0] },
    })) ?? [];

  const sectorBars: BarDatum[] =
    data?.moderation.sectorMix.map((entry, index) => ({
      key: entry.sector,
      label: SECTOR_LABEL[entry.sector],
      value: entry.count,
      color: '',
      style: { background: SERIES[index % SERIES.length] },
    })) ?? [];

  const conversionRate =
    data && data.kpis.visits.current > 0
      ? data.kpis.conversions.current / data.kpis.visits.current
      : null;

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Marketplace performance over a period you choose, each figure compared with the period immediately before it."
      />

      <div className="mb-4">
        <RangePicker state={range} />
      </div>

      {data && (
        <p className="mb-3 text-xs text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">
            {new Date(data.range.from).toLocaleDateString('en-GB')} –{' '}
            {new Date(data.range.to).toLocaleDateString('en-GB')}
          </span>{' '}
          ({data.range.days} days, {data.range.granularity} buckets), compared
          with {new Date(data.range.previousFrom).toLocaleDateString('en-GB')} –{' '}
          {new Date(data.range.previousTo).toLocaleDateString('en-GB')}.
        </p>
      )}

      <div
        className={
          isFetching && !isLoading ? 'opacity-60 transition-opacity' : ''
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiTile
            label="Boost revenue"
            value={formatTaka(data?.kpis.revenue.current ?? 0)}
            kpi={data?.kpis.revenue}
            loading={isLoading}
          />
          <KpiTile
            label="New listings"
            value={formatCount(data?.kpis.newAds.current ?? 0)}
            kpi={data?.kpis.newAds}
            loading={isLoading}
          />
          <KpiTile
            label="New accounts"
            value={formatCount(data?.kpis.newUsers.current ?? 0)}
            kpi={data?.kpis.newUsers}
            loading={isLoading}
          />
          <KpiTile
            label="Contact rate"
            value={
              conversionRate === null
                ? '—'
                : `${(conversionRate * 100).toFixed(1)}%`
            }
            hint={`${formatCount(data?.kpis.conversions.current ?? 0)} of ${formatCount(
              data?.kpis.visits.current ?? 0,
            )} visits`}
            loading={isLoading}
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Traffic</CardTitle>
              <span className="text-xs text-muted-foreground">
                Listing visits against contacts started
              </span>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-52 w-full" />
              ) : (
                <TimeSeriesChart
                  data={series}
                  label={label}
                  emptyLabel="No listing traffic recorded in this period."
                  series={[
                    {
                      key: 'visits',
                      label: 'Visits',
                      color: SERIES[0],
                      value: (point) => point.visits,
                      format: formatCount,
                    },
                    {
                      key: 'conversions',
                      label: 'Contacts',
                      color: SERIES[1],
                      value: (point) => point.conversions,
                      format: formatCount,
                    },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          {/*
            Revenue gets its own chart rather than a second axis on the traffic
            chart: two measures of different magnitude on two scales invents a
            correlation that is not in the data.
          */}
          <Card>
            <CardHeader>
              <CardTitle>Boost revenue</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-44 w-full" />
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
              <CardTitle>Conversion funnel</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-44 w-full" />
              ) : (
                <FunnelChart stages={data?.funnel ?? []} />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top districts</CardTitle>
              <span className="text-xs text-muted-foreground">
                New listings
              </span>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-44 w-full" />
              ) : (
                <BarList
                  data={districtBars}
                  emptyLabel="No listings created in this period."
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sector mix</CardTitle>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Skeleton className="h-44 w-full" />
              ) : (
                <BarList
                  data={sectorBars}
                  emptyLabel="No listings created in this period."
                />
              )}
            </CardBody>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Busiest advertisers</CardTitle>
              <span className="text-xs text-muted-foreground">
                By listings posted in this period
              </span>
            </CardHeader>
            <CardBody className="p-0">
              {isLoading ? (
                <div className="p-4">
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : data?.topAdvertisers.length === 0 ? (
                <p className="py-10 text-center text-xs text-muted-foreground">
                  Nobody posted a listing in this period.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {data?.topAdvertisers.map((advertiser) => (
                    <li
                      key={advertiser.id}
                      className="flex items-center gap-3 px-4 py-2.5"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-200 text-xs font-semibold text-ink-700">
                        {advertiser.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {advertiser.name}
                      </span>
                      {advertiser.isSuspended && (
                        <Badge tone="danger">Suspended</Badge>
                      )}
                      <span className="shrink-0 text-sm font-semibold tnum">
                        {formatCount(advertiser.ads)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
