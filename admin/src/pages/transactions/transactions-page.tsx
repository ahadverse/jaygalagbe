import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, PaymentStatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ReceiptIcon } from '@/components/ui/icons';
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
import { TransactionDetailPanel } from '@/components/transactions/transaction-detail-panel';
import { useTransactionsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import {
  useMarkPaymentFailed,
  useMarkPaymentPaid,
  useRecheckPayment,
} from '@/lib/ads/mutations';
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
    {
      label: 'Settled revenue',
      value: formatTaka(totals.successAmount),
      detail: `${formatCount(totals.successCount)} payments · avg ${formatTaka(totals.averageAmount)}`,
    },
    {
      label: 'Awaiting gateway',
      value: formatTaka(totals.pendingAmount),
      detail: `${formatCount(totals.countByStatus.PENDING ?? 0)} unresolved`,
    },
    {
      label: 'Failed',
      value: formatTaka(totals.failedAmount),
      detail: `${formatCount(totals.countByStatus.FAILED ?? 0)} payments`,
    },
    {
      label: 'By gateway',
      value:
        totals.byGateway.length === 0
          ? '—'
          : totals.byGateway
              .map(
                (entry) =>
                  `${GATEWAY_LABEL[entry.gateway]} ${formatCount(entry.count)}`,
              )
              .join(' · '),
      detail: 'settled only',
      small: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="bg-card px-3 py-2.5">
          <p className="text-xs text-muted-foreground">{cell.label}</p>
          <p
            className={
              cell.small
                ? 'mt-0.5 text-xs font-medium'
                : 'mt-0.5 text-base font-semibold tnum'
            }
          >
            {cell.value}
          </p>
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
            {cell.detail}
          </p>
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

  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [detail, setDetail] = useState<TransactionListItem | null>(null);
  const markFailed = useMarkPaymentFailed();
  const markPaid = useMarkPaymentPaid();
  const recheck = useRecheckPayment();

  const { filters } = query;
  const params = {
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
  };

  const { data, isLoading, isFetching, error } = useTransactionsQuery(params);

  /**
   * Only a payment still waiting on the gateway can be closed here. A settled
   * one is real money, and reversing it is a gateway refund, not a flag flip.
   */
  const askMarkFailed = (row: TransactionListItem) =>
    setConfirm({
      title: 'Close this payment as failed?',
      description: `${formatTaka(row.amount)} from ${row.user.name} will be marked failed, and any boost waiting on it is cancelled. Use this when the gateway never called back or the customer abandoned checkout.`,
      confirmLabel: 'Mark failed',
      danger: true,
      reasonLabel: 'Why is this being closed?',
      reasonPlaceholder:
        'No callback received after 48h; customer confirmed they abandoned checkout',
      onConfirm: (reason) =>
        markFailed.mutateAsync({ paymentId: row.id, reason }),
    });

  /**
   * The override. It activates a paid boost with nothing from the gateway
   * backing it, so this row will not reconcile against PayStation — the
   * warning says so, and the reason is what the audit log will show later.
   */
  const askMarkPaid = (row: TransactionListItem) =>
    setConfirm({
      title: 'Settle this payment by hand?',
      description: `${formatTaka(row.amount)} from ${row.user.name} will be marked paid and the ${row.boost ? BOOST_TIER_LABEL[row.boost.tier] : 'attached'} boost activated immediately — without the gateway confirming any money arrived. This row will not match your PayStation statement, and it is recorded against your account as a manual settlement. Try "Re-check" first; it settles genuinely paid rows on the gateway's word.`,
      confirmLabel: 'Settle without confirmation',
      danger: true,
      reasonLabel: 'What evidence do you have that the money arrived?',
      reasonPlaceholder:
        'Customer sent bKash receipt TRX8842HJ; amount and time match this invoice',
      reasonMinLength: 8,
      onConfirm: (reason) => markPaid.mutateAsync({ paymentId: row.id, reason }),
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
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (row) =>
        row.status === 'PENDING' ? (
          <div className="flex items-center justify-end gap-1.5">
            {/* Ordered by what should be reached for first: ask the gateway,
             * then close it, and only then settle it by hand. */}
            <Button
              variant="secondary"
              size="xs"
              loading={recheck.isPending && recheck.variables === row.id}
              onClick={(event) => {
                event.stopPropagation();
                recheck.mutate(row.id);
              }}
            >
              Re-check
            </Button>
            <Button
              variant="subtleDanger"
              size="xs"
              onClick={(event) => {
                event.stopPropagation();
                askMarkFailed(row);
              }}
            >
              Mark failed
            </Button>
            <Button
              variant="secondary"
              size="xs"
              onClick={(event) => {
                event.stopPropagation();
                askMarkPaid(row);
              }}
            >
              Mark paid
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Boost payment log for reconciliation. Totals reflect the current filters, not just this page. A payment the gateway never resolved can be re-checked against it, closed as failed, or — as a last resort — settled by hand."
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
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="transactions" params={params} />
            </>
          }
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
          onRowClick={setDetail}
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
              <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-muted-foreground">
                <span className="flex flex-wrap items-center gap-1.5">
                  {GATEWAY_LABEL[row.gateway]}
                  {row.boost && (
                    <Badge tone="brand">
                      {BOOST_TIER_LABEL[row.boost.tier]}
                    </Badge>
                  )}
                  <span className="tnum">· {formatDateTime(row.createdAt)}</span>
                </span>
                {row.status === 'PENDING' && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="xs"
                      loading={recheck.isPending && recheck.variables === row.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        recheck.mutate(row.id);
                      }}
                    >
                      Re-check
                    </Button>
                    <Button
                      variant="subtleDanger"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        askMarkFailed(row);
                      }}
                    >
                      Mark failed
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        askMarkPaid(row);
                      }}
                    >
                      Mark paid
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
          noun="transactions"
        />
      </Card>

      <TransactionDetailPanel
        payment={detail}
        onClose={() => setDetail(null)}
        onMarkFailed={askMarkFailed}
        onMarkPaid={askMarkPaid}
        onRecheck={(payment) => recheck.mutate(payment.id)}
        rechecking={recheck.isPending && recheck.variables === detail?.id}
      />

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
