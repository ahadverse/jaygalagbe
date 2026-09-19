import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRightIcon } from '@/components/ui/icons';
import { BarList, type BarDatum } from '@/components/charts/bar-list';
import { RevenueColumns } from '@/components/charts/revenue-columns';
import { useDashboardQuery, useTransactionsQuery } from '@/lib/api/queries';
import { AD_STATUS_LABEL, SECTOR_LABEL } from '@/lib/ads/labels';
import { formatCount, formatTaka } from '@/lib/format';
import type { AdStatus } from '@/lib/api/types';

/** Lifecycle order, not size order. */
const STATUS_ORDER: AdStatus[] = [
  'PENDING',
  'LIVE',
  'SOLD',
  'REJECTED',
  'REMOVED',
];

const STATUS_COLOR: Record<AdStatus, string> = {
  PENDING: 'bg-warning-600',
  LIVE: 'bg-success-600',
  SOLD: 'bg-info-600',
  REJECTED: 'bg-danger-600',
  REMOVED: 'bg-ink-500',
};

function StatTile({
  label,
  value,
  hint,
  to,
  loading,
}: {
  label: string;
  value: string;
  hint?: string;
  to?: string;
  loading: boolean;
}) {
  const body = (
    <>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="mt-1.5 h-7 w-20" />
      ) : (
        <p className="mt-1 text-2xl font-semibold tracking-tight tnum">{value}</p>
      )}
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
      )}
    </>
  );

  if (!to) {
    return (
      <div className="rounded-lg border border-border bg-card p-3.5 shadow-xs">
        {body}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className="group rounded-lg border border-border bg-card p-3.5 shadow-xs transition-colors hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {body}
      <span className="mt-1.5 inline-flex items-center gap-0.5 text-xs font-medium text-brand-600">
        Open
        <ChevronRightIcon className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function DashboardPage() {
  const { data, isLoading, error } = useDashboardQuery();
  // The dashboard endpoint has no revenue total, so borrow the transaction
  // log's reconciliation figure with an empty filter set.
  const { data: transactions } = useTransactionsQuery({ limit: 1 });

  const statusCounts = new Map(
    data?.adsByStatus.map((entry) => [entry.status, entry.count]),
  );
  const totalAds = data?.adsByStatus.reduce((sum, e) => sum + e.count, 0) ?? 0;

  const statusBars: BarDatum[] = STATUS_ORDER.filter((status) =>
    statusCounts.has(status),
  ).map((status) => ({
    key: status,
    label: AD_STATUS_LABEL[status],
    value: statusCounts.get(status) ?? 0,
    color: STATUS_COLOR[status],
  }));

  const sectorBars: BarDatum[] =
    data?.adsBySector.map((entry) => ({
      key: entry.sector,
      label: SECTOR_LABEL[entry.sector],
      value: entry.count,
      color: 'bg-brand-500',
    })) ?? [];

  const reportedBars: BarDatum[] =
    data?.mostReportedAdvertisers.map((advertiser) => ({
      key: advertiser.id,
      label: advertiser.name,
      value: advertiser.reportCount,
      color: 'bg-danger-600',
    })) ?? [];

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

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Platform health at a glance — moderation backlog, listing mix and boost revenue."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Awaiting review"
          value={formatCount(statusCounts.get('PENDING') ?? 0)}
          hint="Listings blocked from going live"
          to="/review-queue"
          loading={isLoading}
        />
        <StatTile
          label="Live listings"
          value={formatCount(statusCounts.get('LIVE') ?? 0)}
          hint={`of ${formatCount(totalAds)} total`}
          to="/ads?status=LIVE"
          loading={isLoading}
        />
        <StatTile
          label="Settled boost revenue"
          value={formatTaka(transactions?.totals.successAmount ?? 0)}
          hint={`${formatCount(transactions?.totals.successCount ?? 0)} payments`}
          to="/transactions"
          loading={isLoading}
        />
        <StatTile
          label="Rejected"
          value={formatCount(statusCounts.get('REJECTED') ?? 0)}
          hint="Sent back to the advertiser"
          to="/ads?status=REJECTED"
          loading={isLoading}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Boost revenue by month</CardTitle>
            <span className="text-xs text-muted-foreground">
              Settled payments, last 6 months
            </span>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-44 w-full" />
            ) : (
              <RevenueColumns data={data?.boostRevenueByMonth ?? []} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ads by status</CardTitle>
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
            <CardTitle>Ads by sector</CardTitle>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <BarList data={sectorBars} />
            )}
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Most reported advertisers</CardTitle>
            <Link
              to="/reports"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Open report queue
            </Link>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <BarList
                data={reportedBars}
                emptyLabel="No advertiser has been reported yet."
              />
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
