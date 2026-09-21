import { useState, type ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdStatusBadge, Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { BoltIcon, CheckIcon, FlagIcon, InboxIcon, XIcon } from '@/components/ui/icons';
import {
  ConfirmDialog,
  type ConfirmRequest,
} from '@/components/ui/confirm-dialog';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import { BulkActionBar } from '@/components/table/bulk-action-bar';
import {
  ExportButton,
  SaveViewButton,
} from '@/components/table/table-actions';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { AdThumb } from '@/components/ads/ad-thumb';
import { AdDetailPanel } from '@/components/ads/ad-detail-panel';
import { RejectDialog } from '@/components/ads/reject-dialog';
import { EditAdDialog } from '@/components/ads/edit-ad-dialog';
import { useAdDistrictsQuery, useAdsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useRowSelection } from '@/lib/table/use-row-selection';
import {
  useApproveAd,
  useBulkAdAction,
  useDeleteAd,
  useRemoveAd,
} from '@/lib/ads/mutations';
import {
  AD_STATUS_LABEL,
  SECTOR_LABEL,
  toOptions,
} from '@/lib/ads/labels';
import { formatAge, formatDate, formatTaka } from '@/lib/format';
import type { AdDetail, AdListItem, AdStatus } from '@/lib/api/types';

const FILTER_KEYS = [
  'status',
  'sector',
  'district',
  'boosted',
  'reported',
  'minPrice',
  'maxPrice',
  'from',
  'to',
] as const;

type AdFilterKey = (typeof FILTER_KEYS)[number];

export interface AdsTableSectionProps {
  /** Fixed status filter — the review queue pins this to PENDING. */
  lockedStatus?: AdStatus[];
  defaultSort: string;
  defaultOrder: 'asc' | 'desc';
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  /** Approve/reject inline; the ads page uses take-down instead. */
  mode: 'review' | 'manage';
}

function BoostFlag({ ad }: { ad: AdListItem }) {
  if (ad.boosts.length === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-brand-600"
      title="Boost active"
    >
      <BoltIcon className="h-3.5 w-3.5" />
    </span>
  );
}

function ReportFlag({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-danger-600"
      title={`${count} report${count === 1 ? '' : 's'}`}
    >
      <FlagIcon className="h-3.5 w-3.5" />
      <span className="text-xs font-medium tnum">{count}</span>
    </span>
  );
}

export function AdsTableSection({
  lockedStatus,
  defaultSort,
  defaultOrder,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  mode,
}: AdsTableSectionProps) {
  const query = useTableQuery<AdFilterKey>({
    defaultSort,
    defaultOrder,
    filterKeys: FILTER_KEYS,
  });

  const [detailId, setDetailId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(
    null,
  );
  const [bulkRejecting, setBulkRejecting] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [editing, setEditing] = useState<AdDetail | null>(null);

  const approve = useApproveAd();
  const remove = useRemoveAd();
  const bulk = useBulkAdAction();
  const deleteAd = useDeleteAd();
  const { data: districts } = useAdDistrictsQuery();

  const { filters } = query;
  const params = {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    status: lockedStatus ?? (filters.status || undefined),
    sector: filters.sector || undefined,
    district: filters.district || undefined,
    boosted: filters.boosted || undefined,
    reported: filters.reported || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isFetching, error } = useAdsQuery(params);
  const selection = useRowSelection((data?.data ?? []).map((ad) => ad.id));

  const rowActions = (ad: AdListItem): ReactNode =>
    mode === 'review' ? (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="success"
          size="xs"
          loading={approve.isPending && approve.variables === ad.id}
          onClick={(event) => {
            event.stopPropagation();
            approve.mutate(ad.id);
          }}
        >
          <CheckIcon className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          variant="subtleDanger"
          size="xs"
          onClick={(event) => {
            event.stopPropagation();
            setRejecting({ id: ad.id, title: ad.title });
          }}
        >
          <XIcon className="h-3.5 w-3.5" />
          Reject
        </Button>
      </div>
    ) : (
      <div className="flex items-center justify-end gap-1.5">
        {ad.status !== 'REMOVED' && (
          <Button
            variant="subtleDanger"
            size="xs"
            loading={remove.isPending && remove.variables === ad.id}
            onClick={(event) => {
              event.stopPropagation();
              remove.mutate(ad.id);
            }}
          >
            Take down
          </Button>
        )}
      </div>
    );

  const columns: Column<AdListItem>[] = [
    {
      id: 'title',
      header: 'Listing',
      sortKey: 'title',
      cell: (ad) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <AdThumb photos={ad.photos} alt="" />
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{ad.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ad.locationArea}, {ad.locationDistrict}
            </p>
          </div>
        </div>
      ),
      className: 'max-w-[22rem]',
    },
    {
      id: 'sector',
      header: 'Sector',
      sortKey: 'sector',
      hideBelow: 'xl',
      cell: (ad) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          {SECTOR_LABEL[ad.sector]}
        </span>
      ),
    },
    {
      id: 'price',
      header: 'Price',
      sortKey: 'price',
      align: 'right',
      cell: (ad) => (
        <span className="font-medium whitespace-nowrap tnum">
          {formatTaka(ad.price)}
        </span>
      ),
    },
    {
      id: 'owner',
      header: 'Advertiser',
      sortKey: 'owner',
      hideBelow: 'lg',
      cell: (ad) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{ad.owner.name}</p>
          {ad.owner.isSuspended && (
            <Badge tone="danger" className="mt-0.5">
              Suspended
            </Badge>
          )}
        </div>
      ),
      className: 'max-w-[10rem]',
    },
    {
      id: 'flags',
      header: 'Flags',
      sortKey: 'reports',
      hideBelow: 'lg',
      cell: (ad) => (
        <div className="flex items-center gap-2">
          <BoostFlag ad={ad} />
          <ReportFlag count={ad._count.reports} />
        </div>
      ),
    },
    ...(mode === 'manage'
      ? [
          {
            id: 'status',
            header: 'Status',
            sortKey: 'status',
            cell: (ad: AdListItem) => <AdStatusBadge status={ad.status} />,
          } satisfies Column<AdListItem>,
        ]
      : []),
    {
      id: 'createdAt',
      header: mode === 'review' ? 'Waiting' : 'Posted',
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (ad) => (
        <span
          className="text-xs whitespace-nowrap text-muted-foreground tnum"
          title={formatDate(ad.createdAt)}
        >
          {mode === 'review' ? formatAge(ad.createdAt) : formatDate(ad.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: rowActions,
    },
  ];

  return (
    <>
      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder={searchPlaceholder}
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="ads" params={params} />
            </>
          }
          filters={
            <>
              {!lockedStatus && (
                <FilterSelect
                  label="Status"
                  value={filters.status}
                  onChange={(value) => query.setFilter('status', value)}
                  options={toOptions(AD_STATUS_LABEL)}
                  allLabel="Any status"
                  className="w-32"
                />
              )}
              <FilterSelect
                label="Sector"
                value={filters.sector}
                onChange={(value) => query.setFilter('sector', value)}
                options={toOptions(SECTOR_LABEL)}
                allLabel="Both sectors"
                className="w-36"
              />
              <FilterSelect
                label="District"
                value={filters.district}
                onChange={(value) => query.setFilter('district', value)}
                options={(districts ?? []).map((district) => ({
                  value: district,
                  label: district,
                }))}
                allLabel="All districts"
                className="w-36"
              />
              <FilterSelect
                label="Boost"
                value={filters.boosted}
                onChange={(value) => query.setFilter('boosted', value)}
                options={[
                  { value: 'true', label: 'Boosted' },
                  { value: 'false', label: 'Not boosted' },
                ]}
                allLabel="Any"
                className="w-32"
              />
              <FilterSelect
                label="Reported"
                value={filters.reported}
                onChange={(value) => query.setFilter('reported', value)}
                options={[
                  { value: 'true', label: 'Has reports' },
                  { value: 'false', label: 'No reports' },
                ]}
                allLabel="Any"
                className="w-32"
              />
              <FilterInput
                label="Min price"
                type="number"
                value={filters.minPrice}
                onChange={(value) => query.setFilter('minPrice', value)}
                placeholder="0"
                className="w-28"
              />
              <FilterInput
                label="Max price"
                type="number"
                value={filters.maxPrice}
                onChange={(value) => query.setFilter('maxPrice', value)}
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
          rowKey={(ad) => ad.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          selection={selection}
          onRowClick={(ad) => setDetailId(ad.id)}
          empty={
            <EmptyState
              icon={<InboxIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matches' : emptyTitle}
              description={
                query.isDirty
                  ? 'No listing matches this search and filter combination.'
                  : emptyDescription
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
          renderCard={(ad) => (
            <button
              type="button"
              onClick={() => setDetailId(ad.id)}
              className="flex w-full flex-col gap-2 text-left"
            >
              <div className="flex gap-2.5">
                <AdThumb photos={ad.photos} alt="" className="h-14 w-18" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{ad.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {ad.locationArea}, {ad.locationDistrict}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tnum">
                    {formatTaka(ad.price)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <AdStatusBadge status={ad.status} />
                  <div className="flex items-center gap-1.5">
                    <BoostFlag ad={ad} />
                    <ReportFlag count={ad._count.reports} />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {ad.owner.name} · {formatAge(ad.createdAt)}
                </span>
                {rowActions(ad)}
              </div>
            </button>
          )}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="ads"
        />
      </Card>

      <BulkActionBar selection={selection} noun="listing">
        {mode === 'review' && (
          <>
            <Button
              variant="success"
              size="xs"
              loading={bulk.isPending && bulk.variables?.action === 'APPROVE'}
              onClick={() =>
                setConfirm({
                  title: `Approve ${selection.count} listing${selection.count === 1 ? '' : 's'}?`,
                  description:
                    'They go live immediately and each advertiser is notified. Anything that has already moved on is skipped and reported back.',
                  confirmLabel: 'Approve all',
                  onConfirm: () =>
                    bulk
                      .mutateAsync({ action: 'APPROVE', ids: selection.ids })
                      .then(selection.clear),
                })
              }
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Approve
            </Button>
            <Button
              variant="subtleDanger"
              size="xs"
              onClick={() => setBulkRejecting(true)}
            >
              <XIcon className="h-3.5 w-3.5" />
              Reject
            </Button>
          </>
        )}

        {mode === 'manage' && (
          <Button
            variant="subtleDanger"
            size="xs"
            loading={bulk.isPending && bulk.variables?.action === 'REMOVE'}
            onClick={() =>
              setConfirm({
                title: `Take down ${selection.count} listing${selection.count === 1 ? '' : 's'}?`,
                description:
                  'They stop appearing on the marketplace at once. Each take-down is recorded in the audit log against your account.',
                confirmLabel: 'Take down all',
                danger: true,
                onConfirm: () =>
                  bulk
                    .mutateAsync({ action: 'REMOVE', ids: selection.ids })
                    .then(selection.clear),
              })
            }
          >
            Take down
          </Button>
        )}

        {/* Offered everywhere a selection is: the review queue accumulates
         * junk submissions that are not worth keeping a record of either. */}
        <Button
          variant="danger"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'DELETE'}
          onClick={() =>
            setConfirm({
              title: `Permanently delete ${selection.count} listing${selection.count === 1 ? '' : 's'}?`,
              description:
                'Each one and everything attached to it — reports, conversations and view history — is erased for good. Any listing with settled payments against it is refused and reported back. This cannot be undone; taking them down instead keeps the record.',
              confirmLabel: 'Delete for ever',
              danger: true,
              onConfirm: () =>
                bulk
                  .mutateAsync({ action: 'DELETE', ids: selection.ids })
                  .then(selection.clear),
            })
          }
        >
          Delete
        </Button>
      </BulkActionBar>

      <AdDetailPanel
        adId={detailId}
        onClose={() => setDetailId(null)}
        onReject={(id, title) => {
          setDetailId(null);
          setRejecting({ id, title });
        }}
        onEdit={(ad) => {
          setDetailId(null);
          setEditing(ad);
        }}
        onDelete={(ad) =>
          setConfirm({
            title: 'Permanently delete this listing?',
            description: `"${ad.title}" and everything attached to it — reports, conversations and view history — are erased for good. This cannot be undone. Taking it down instead keeps the record and only hides it from the marketplace.`,
            confirmLabel: 'Delete for ever',
            danger: true,
            onConfirm: () => deleteAd.mutateAsync(ad.id),
          })
        }
      />

      <EditAdDialog ad={editing} onClose={() => setEditing(null)} />

      <RejectDialog
        adId={rejecting?.id ?? null}
        adTitle={rejecting?.title ?? ''}
        onClose={() => setRejecting(null)}
      />

      {/* One reason code applies to the whole batch — that is the point of it. */}
      <RejectDialog
        adId={bulkRejecting ? '__bulk__' : null}
        adTitle={`${selection.count} selected listing${selection.count === 1 ? '' : 's'}`}
        onClose={() => setBulkRejecting(false)}
        onSubmit={async (reasonCode, note) => {
          await bulk.mutateAsync({
            action: 'REJECT',
            ids: selection.ids,
            reasonCode,
            note,
          });
          selection.clear();
        }}
      />

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
