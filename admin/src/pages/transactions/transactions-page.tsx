import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, PaymentStatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ReceiptIcon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { useTransactionsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { formatCount, formatDateTime, formatTaka } from '@/lib/format';
import {
  BOOST_TIER_LABEL,
  GATEWAY_LABEL,
  PAYMENT_STATUS_LABEL,
  toOptions,
} from '@/lib/ads/labels';
import type { TransactionListItem, TransactionTotals } from '@/lib/api/types';

const FILTER_KEYS = [
  'status',
  'gateway',
  'tier',
  'minAmount',
  'maxAmount',
  'from',
  'to',
] as const;

type TransactionFilterKey = (typeof FILTER_KEYS)[number];

function ReconciliationStrip({ totals }: { totals: TransactionTotals }) {
  const cells = [
    { label: 'Settled revenue', value: formatTaka(totals.successAmount) },
    { label: 'Successful', value: formatCount(totals.successCount) },
    { label: 'Pending', value: formatCount(totals.countByStatus.PENDING ?? 0) },
    { label: 'Failed', value: formatCount(totals.countByStatus.FAILED ?? 0) },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-3 py-2.5">
          <p className="text-xs text-muted-foreground">{cell.label}</p>
          <p className="mt-0.5 text-base font-semibold tnum">{cell.value}</p>
        </div>
      ))}
    </div>
  );
}

export function TransactionsPage() {
  const query = useTableQuery<TransactionFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });

  const { filters } = query;
  const { data, isLoading, isFetching, error } = useTransactionsQuery({
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    status: filters.status || undefined,
    gateway: filters.gateway || undefined,
    tier: filters.tier || undefined,
    minAmount: filters.minAmount || undefined,
    maxAmount: filters.maxAmount || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const columns: Column<TransactionListItem>[] = [
    {
      id: 'ref',
      header: 'Reference',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-medium">
            {row.gatewayRef ?? row.id}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {GATEWAY_LABEL[row.gateway]}
          </p>
        </div>
      ),
      className: 'max-w-[12rem]',
    },
    {
      id: 'user',
      header: 'Advertiser',
      sortKey: 'user',
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.user.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.user.email ?? row.user.phone ?? '—'}
          </p>
        </div>
      ),
      className: 'max-w-[14rem]',
    },
    {
      id: 'ad',
      header: 'Listing',
      hideBelow: 'xl',
      cell: (row) => (
        <span className="block max-w-[14rem] truncate text-xs text-muted-foreground">
          {row.ad?.title ?? '—'}
        </span>
      ),
    },
    {
      id: 'tier',
      header: 'Boost',
      hideBelow: 'lg',
      cell: (row) =>
        row.boost ? (
          <Badge tone="brand">{BOOST_TIER_LABEL[row.boost.tier]}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      id: 'amount',
      header: 'Amount',
      sortKey: 'amount',
      align: 'right',
      cell: (row) => (
        <span className="font-medium whitespace-nowrap tnum">
          {formatTaka(row.amount)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (row) => <PaymentStatusBadge status={row.status} />,
    },
    {
      id: 'createdAt',
      header: 'Date',
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'md',
      cell: (row) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground tnum">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Read-only boost payment log for reconciliation. Totals below reflect the current filters, not just this page."
      />

      {data?.totals && (
        <div className="mb-4">
          <ReconciliationStrip totals={data.totals} />
        </div>
      )}

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search reference, advertiser, listing…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          filters={
            <>
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(value) => query.setFilter('status', value)}
                options={toOptions(PAYMENT_STATUS_LABEL)}
                allLabel="Any status"
                className="w-32"
              />
              <FilterSelect
                label="Gateway"
                value={filters.gateway}
                onChange={(value) => query.setFilter('gateway', value)}
                options={toOptions(GATEWAY_LABEL)}
                allLabel="All gateways"
                className="w-36"
              />
              <FilterSelect
                label="Boost tier"
                value={filters.tier}
                onChange={(value) => query.setFilter('tier', value)}
                options={toOptions(BOOST_TIER_LABEL)}
                allLabel="All tiers"
                className="w-32"
              />
              <FilterInput
                label="Min amount"
                type="number"
                value={filters.minAmount}
                onChange={(value) => query.setFilter('minAmount', value)}
                placeholder="0"
                className="w-28"
              />
              <FilterInput
                label="Max amount"
                type="number"
                value={filters.maxAmount}
                onChange={(value) => query.setFilter('maxAmount', value)}
                placeholder="Any"
                className="w-28"
              />
              <FilterInput
                label="From"
                type="date"
                value={filters.from}
                onChange={(value) => query.setFilter('from', value)}
                className="w-36"
              />
              <FilterInput
                label="To"
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
          rowKey={(row) => row.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          empty={
            <EmptyState
              icon={<ReceiptIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matches' : 'No transactions yet'}
              description={
                query.isDirty
                  ? 'No payment matches this search and filter combination.'
                  : 'Boost purchases appear here as soon as the gateway responds.'
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
          renderCard={(row) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs">
                    {row.gatewayRef ?? row.id}
                  </p>
                  <p className="truncate text-sm font-medium">{row.user.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold tnum">{formatTaka(row.amount)}</p>
                  <PaymentStatusBadge status={row.status} />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span>{GATEWAY_LABEL[row.gateway]}</span>
                {row.boost && (
                  <Badge tone="brand">{BOOST_TIER_LABEL[row.boost.tier]}</Badge>
                )}
                <span className="tnum">· {formatDateTime(row.createdAt)}</span>
              </div>
            </div>
          )}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="transactions"
        />
      </Card>
    </>
  );
}
