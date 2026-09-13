import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AdStatusBadge,
  Badge,
  ReportStatusBadge,
} from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckIcon, FlagIcon, XIcon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { AdThumb } from '@/components/ads/ad-thumb';
import { AdDetailPanel } from '@/components/ads/ad-detail-panel';
import { RejectDialog } from '@/components/ads/reject-dialog';
import { useReportsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useResolveReport } from '@/lib/ads/mutations';
import {
  AD_STATUS_LABEL,
  REPORT_STATUS_LABEL,
  SECTOR_LABEL,
  toOptions,
} from '@/lib/ads/labels';
import { formatAge, formatDate } from '@/lib/format';
import type { ReportListItem } from '@/lib/api/types';

const FILTER_KEYS = ['status', 'adStatus', 'sector', 'from', 'to'] as const;

type ReportFilterKey = (typeof FILTER_KEYS)[number];

/** Reasons are stored as `CODE: free text`, so split them for display. */
function splitReason(reason: string): { code: string; note: string | null } {
  const separator = reason.indexOf(':');
  if (separator === -1) return { code: reason, note: null };
  return {
    code: reason.slice(0, separator).trim(),
    note: reason.slice(separator + 1).trim() || null,
  };
}

function ReasonCell({ reason }: { reason: string }) {
  const { code, note } = splitReason(reason);
  return (
    <div className="min-w-0">
      <Badge tone="danger">{code.replace(/_/g, ' ').toLowerCase()}</Badge>
      {note && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{note}</p>
      )}
    </div>
  );
}

export function ReportsPage() {
  // Pending first is the whole point of a triage queue, so it is the default
  // rather than something the moderator has to pick every visit.
  const query = useTableQuery<ReportFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'asc',
    filterKeys: FILTER_KEYS,
    defaultFilters: { status: 'PENDING' },
  });

  const [detailId, setDetailId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<{ id: string; title: string } | null>(
    null,
  );

  const resolve = useResolveReport();
  const { filters } = query;

  const { data, isLoading, isFetching, error } = useReportsQuery({
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    status: filters.status || undefined,
    adStatus: filters.adStatus || undefined,
    sector: filters.sector || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const rowActions = (report: ReportListItem) => {
    if (report.status !== 'PENDING') {
      return (
        <span className="text-xs whitespace-nowrap text-muted-foreground">
          Triaged
        </span>
      );
    }

    const pendingFor = (status: 'REVIEWED' | 'DISMISSED') =>
      resolve.isPending &&
      resolve.variables?.reportId === report.id &&
      resolve.variables.status === status;

    return (
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="success"
          size="xs"
          loading={pendingFor('REVIEWED')}
          onClick={(event) => {
            event.stopPropagation();
            resolve.mutate({ reportId: report.id, status: 'REVIEWED' });
          }}
        >
          <CheckIcon className="h-3.5 w-3.5" />
          Actioned
        </Button>
        <Button
          variant="ghost"
          size="xs"
          loading={pendingFor('DISMISSED')}
          onClick={(event) => {
            event.stopPropagation();
            resolve.mutate({ reportId: report.id, status: 'DISMISSED' });
          }}
        >
          <XIcon className="h-3.5 w-3.5" />
          Dismiss
        </Button>
      </div>
    );
  };

  const columns: Column<ReportListItem>[] = [
    {
      id: 'ad',
      header: 'Reported listing',
      sortKey: 'ad',
      cell: (report) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <AdThumb photos={report.ad.photos} alt="" />
          <div className="min-w-0">
            <p className="truncate font-medium">{report.ad.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {report.ad.owner.name}
              {report.ad._count.reports > 1 &&
                ` · ${report.ad._count.reports} reports total`}
            </p>
          </div>
        </div>
      ),
      className: 'max-w-[22rem]',
    },
    {
      id: 'reason',
      header: 'Reason',
      cell: (report) => <ReasonCell reason={report.reason} />,
      className: 'max-w-[18rem]',
    },
    {
      id: 'reporter',
      header: 'Reported by',
      sortKey: 'reporter',
      hideBelow: 'xl',
      cell: (report) => (
        <span className="block max-w-[10rem] truncate text-xs text-muted-foreground">
          {report.reporter.name}
        </span>
      ),
    },
    {
      id: 'adStatus',
      header: 'Ad status',
      hideBelow: 'lg',
      cell: (report) => <AdStatusBadge status={report.ad.status} />,
    },
    {
      id: 'status',
      header: 'Triage',
      sortKey: 'status',
      cell: (report) => <ReportStatusBadge status={report.status} />,
    },
    {
      id: 'createdAt',
      header: 'Age',
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (report) => (
        <span
          className="text-xs whitespace-nowrap text-muted-foreground tnum"
          title={formatDate(report.createdAt)}
        >
          {formatAge(report.createdAt)}
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

  const pending = data?.countByStatus.PENDING ?? 0;

  return (
    <>
      <PageHeader
        title="Reports"
        description={
          pending > 0
            ? `${pending} flag${pending === 1 ? '' : 's'} waiting for triage. Open a listing to judge it, then mark the flag actioned or dismissed.`
            : 'Listings flagged by customers as fake, scam or out of date.'
        }
      />

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search listing, reason, reporter…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          filters={
            <>
              <FilterSelect
                label="Triage"
                value={filters.status}
                onChange={(value) => query.setFilter('status', value)}
                options={toOptions(REPORT_STATUS_LABEL)}
                allLabel="Any"
                className="w-32"
              />
              <FilterSelect
                label="Ad status"
                value={filters.adStatus}
                onChange={(value) => query.setFilter('adStatus', value)}
                options={toOptions(AD_STATUS_LABEL)}
                allLabel="Any status"
                className="w-32"
              />
              <FilterSelect
                label="Sector"
                value={filters.sector}
                onChange={(value) => query.setFilter('sector', value)}
                options={toOptions(SECTOR_LABEL)}
                allLabel="Both sectors"
                className="w-36"
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
          rowKey={(report) => report.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          onRowClick={(report) => setDetailId(report.adId)}
          empty={
            <EmptyState
              icon={<FlagIcon className="h-5 w-5" />}
              title={query.isDirty ? 'Nothing to triage' : 'No reports'}
              description={
                query.isDirty
                  ? 'No flag matches this search and filter combination.'
                  : 'Customers have not flagged any listing yet.'
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
          renderCard={(report) => (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setDetailId(report.adId)}
                className="flex gap-2.5 text-left"
              >
                <AdThumb photos={report.ad.photos} alt="" className="h-14 w-18" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {report.ad.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {report.ad.owner.name} · {formatAge(report.createdAt)}
                  </p>
                  <div className="mt-1">
                    <ReasonCell reason={report.reason} />
                  </div>
                </div>
              </button>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <AdStatusBadge status={report.ad.status} />
                  <ReportStatusBadge status={report.status} />
                </div>
                {rowActions(report)}
              </div>
            </div>
          )}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="reports"
        />
      </Card>

      <AdDetailPanel
        adId={detailId}
        onClose={() => setDetailId(null)}
        onReject={(id, title) => {
          setDetailId(null);
          setRejecting({ id, title });
        }}
      />

      <RejectDialog
        adId={rejecting?.id ?? null}
        adTitle={rejecting?.title ?? ''}
        onClose={() => setRejecting(null)}
      />
    </>
  );
}
