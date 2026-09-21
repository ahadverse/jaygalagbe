import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, BoostStatusBadge, PaymentStatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { BoltIcon } from '@/components/ui/icons';
import {
  ConfirmDialog,
  type ConfirmRequest,
} from '@/components/ui/confirm-dialog';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { ExportButton, SaveViewButton } from '@/components/table/table-actions';
import { AdThumb } from '@/components/ads/ad-thumb';
import { BoostDetailPanel } from '@/components/boosts/boost-detail-panel';
import { useBoostsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useCancelBoost, useExtendBoost } from '@/lib/ads/mutations';
import { BOOST_TIER_LABEL, toOptions } from '@/lib/ads/labels';
import { formatCount, formatDate, formatRelative, formatTaka } from '@/lib/format';
import { ExtendBoostDialog } from './extend-boost-dialog';
import type { BoostListItem, BoostStatus } from '@/lib/api/types';

const FILTER_KEYS = [
  'status',
  'tier',
  'expiring',
  'advertiserId',
  'from',
  'to',
] as const;

type BoostFilterKey = (typeof FILTER_KEYS)[number];

const BOOST_STATUS_LABEL: Record<BoostStatus, string> = {
  PENDING: 'Pending payment',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

function SummaryTile({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: 'warning';
}) {
  return (
    <div
      className={
        tone === 'warning'
          ? 'rounded-lg border border-warning-200 bg-warning-50 p-3.5'
          : 'rounded-lg border border-border bg-card p-3.5 shadow-xs'
      }
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      {detail && (
        <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
          {detail}
        </p>
      )}
    </div>
  );
}

export function BoostsPage() {
  const query = useTableQuery<BoostFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });

  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [extending, setExtending] = useState<BoostListItem | null>(null);
  const [detail, setDetail] = useState<BoostListItem | null>(null);

  const cancelBoost = useCancelBoost();
  const extendBoost = useExtendBoost();

  const { filters } = query;
  const params = {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    status: filters.status || undefined,
    tier: filters.tier || undefined,
    expiring: filters.expiring || undefined,
    advertiserId: filters.advertiserId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isFetching, error } = useBoostsQuery(params);
  const summary = data?.summary;

  const askCancel = (boost: BoostListItem) =>
    setConfirm({
      title: 'Cancel this boost?',
      description: `"${boost.ad.title}" will stop being promoted immediately. The payment of ${formatTaka(
        boost.payment.amount,
      )} is not refunded here — do that through the gateway if it is owed.`,
      confirmLabel: 'Cancel boost',
      danger: true,
      onConfirm: () => cancelBoost.mutateAsync(boost.id),
    });

  const columns: Column<BoostListItem>[] = [
    {
      id: 'ad',
      header: 'Listing',
      cell: (boost) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <AdThumb photos={boost.ad.photos} alt="" />
          <div className="min-w-0">
            <p className="truncate font-medium">{boost.ad.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {boost.ad.owner.name} · {boost.ad.locationDistrict}
            </p>
          </div>
        </div>
      ),
      className: 'max-w-[22rem]',
    },
    {
      id: 'tier',
      header: 'Tier',
      sortKey: 'tier',
      cell: (boost) => (
        <span className="text-xs whitespace-nowrap">
          {BOOST_TIER_LABEL[boost.tier]}
        </span>
      ),
    },
    {
      id: 'amount',
      header: 'Paid',
      align: 'right',
      cell: (boost) => (
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-medium whitespace-nowrap tnum">
            {formatTaka(boost.payment.amount)}
          </span>
          <PaymentStatusBadge status={boost.payment.status} />
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (boost) => <BoostStatusBadge status={boost.status} />,
    },
    {
      id: 'endAt',
      header: 'Runs until',
      sortKey: 'endAt',
      align: 'right',
      hideBelow: 'md',
      cell: (boost) => {
        if (!boost.endAt) {
          return <span className="text-xs text-muted-foreground">—</span>;
        }
        const soon =
          boost.status === 'ACTIVE' &&
          new Date(boost.endAt).getTime() - Date.now() <
            (summary?.expiringWindowHours ?? 72) * 3600_000;

        return (
          <span
            className="text-xs whitespace-nowrap tnum"
            title={formatDate(boost.endAt)}
          >
            {soon ? (
              <Badge tone="warning">{formatRelative(boost.endAt)}</Badge>
            ) : (
              <span className="text-muted-foreground">
                {formatRelative(boost.endAt)}
              </span>
            )}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (boost) => {
        const cancellable =
          boost.status === 'ACTIVE' || boost.status === 'PENDING';
        if (!cancellable) return null;

        return (
          <div className="flex justify-end gap-1.5">
            {boost.status === 'ACTIVE' && (
              <Button
                variant="secondary"
                size="xs"
                onClick={(event) => {
                  event.stopPropagation();
                  setExtending(boost);
                }}
              >
                Extend
              </Button>
            )}
            <Button
              variant="subtleDanger"
              size="xs"
              onClick={(event) => {
                event.stopPropagation();
                askCancel(boost);
              }}
            >
              Cancel
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Boosts"
        description="Every promotion bought on the platform. Extend one as goodwill, or cancel it if the listing should not be promoted."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile
          label="Running now"
          value={formatCount(summary?.countByStatus.ACTIVE ?? 0)}
          detail="currently promoted"
        />
        <SummaryTile
          label="Expiring soon"
          value={formatCount(summary?.expiringSoon ?? 0)}
          detail={`within ${summary?.expiringWindowHours ?? 72}h`}
          tone={(summary?.expiringSoon ?? 0) > 0 ? 'warning' : undefined}
        />
        <SummaryTile
          label="Awaiting payment"
          value={formatCount(summary?.countByStatus.PENDING ?? 0)}
          detail="not yet promoted"
        />
        <SummaryTile
          label="Value in flight"
          value={formatTaka(summary?.activeRevenue ?? 0)}
          detail="settled, on active boosts"
        />
      </div>

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search listing, advertiser, gateway ref…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="boosts" params={params} />
            </>
          }
          filters={
            <>
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(value) => query.setFilter('status', value)}
                options={toOptions(BOOST_STATUS_LABEL)}
                allLabel="Any status"
                className="w-40"
              />
              <FilterSelect
                label="Tier"
                value={filters.tier}
                onChange={(value) => query.setFilter('tier', value)}
                options={toOptions(BOOST_TIER_LABEL)}
                allLabel="All tiers"
                className="w-32"
              />
              <FilterSelect
                label="Expiring"
                value={filters.expiring}
                onChange={(value) => query.setFilter('expiring', value)}
                options={[
                  {
                    value: 'true',
                    label: `Within ${summary?.expiringWindowHours ?? 72}h`,
                  },
                ]}
                allLabel="Any time"
                className="w-36"
              />
              <FilterInput
                label="Bought from"
                type="date"
                value={filters.from}
                onChange={(value) => query.setFilter('from', value)}
                className="w-36"
              />
              <FilterInput
                label="Bought to"
                type="date"
                value={filters.to}
                onChange={(value) => query.setFilter('to', value)}
                className="w-36"
              />
            </>
          }
        />

        <DataTable
          columns={columns}
          rows={data?.data ?? []}
          rowKey={(boost) => boost.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          onRowClick={setDetail}
          empty={
            <EmptyState
              icon={<BoltIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matches' : 'No boosts yet'}
              description={
                query.isDirty
                  ? 'No boost matches this search and filter combination.'
                  : 'Boosts appear here as advertisers buy promotion for their listings.'
              }
              action={
                query.isDirty ? (
                  <Button size="sm" onClick={query.resetFilters}>
                    Clear filters
                  </Button>
                ) : undefined
              }
            />
          }
          renderCard={(boost) => (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2.5">
                <AdThumb photos={boost.ad.photos} alt="" className="h-14 w-18" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {boost.ad.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {boost.ad.owner.name}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tnum">
                    {formatTaka(boost.payment.amount)} ·{' '}
                    {BOOST_TIER_LABEL[boost.tier]}
                  </p>
                </div>
                <BoostStatusBadge status={boost.status} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {boost.endAt
                    ? `Ends ${formatRelative(boost.endAt)}`
                    : 'Not started'}
                </span>
                {(boost.status === 'ACTIVE' || boost.status === 'PENDING') && (
                  <div className="flex gap-1.5">
                    {boost.status === 'ACTIVE' && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={(event) => {
                  event.stopPropagation();
                  setExtending(boost);
                }}
                      >
                        Extend
                      </Button>
                    )}
                    <Button
                      variant="subtleDanger"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        askCancel(boost);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="boosts"
        />
      </Card>

      <BoostDetailPanel
        boost={detail}
        onClose={() => setDetail(null)}
        onCancel={askCancel}
        onExtend={setExtending}
      />

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />

      <ExtendBoostDialog
        boost={extending}
        onClose={() => setExtending(null)}
        onExtend={(days, reason) =>
          extendBoost.mutateAsync({
            boostId: extending!.id,
            days,
            reason,
          })
        }
      />
    </>
  );
}
