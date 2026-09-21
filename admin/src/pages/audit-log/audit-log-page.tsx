import { useState } from 'react';
import { Link } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { HistoryIcon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { ExportButton, SaveViewButton } from '@/components/table/table-actions';
import { AuditDetailPanel } from '@/components/audit/audit-detail-panel';
import { useAuditActorsQuery, useAuditQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { formatDateTime, formatRelative } from '@/lib/format';
import { toOptions } from '@/lib/ads/labels';
import {
  AUDIT_ACTION_LABEL,
  AUDIT_ACTION_TONE,
  AUDIT_TARGET_LABEL,
  targetLink,
} from '@/lib/audit/labels';
import type { AuditEntry } from '@/lib/api/types';

const FILTER_KEYS = [
  'action',
  'targetType',
  'actorId',
  'targetId',
  'from',
  'to',
] as const;

type AuditFilterKey = (typeof FILTER_KEYS)[number];

export function AuditLogPage() {
  const query = useTableQuery<AuditFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });
  const [detail, setDetail] = useState<AuditEntry | null>(null);

  const { filters } = query;
  const { data: actors } = useAuditActorsQuery();

  const params = {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    action: filters.action || undefined,
    targetType: filters.targetType || undefined,
    actorId: filters.actorId || undefined,
    targetId: filters.targetId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isFetching, error } = useAuditQuery(params);

  const columns: Column<AuditEntry>[] = [
    {
      id: 'createdAt',
      header: 'When',
      sortKey: 'createdAt',
      cell: (entry) => (
        <span
          className="text-xs whitespace-nowrap text-muted-foreground tnum"
          title={formatDateTime(entry.createdAt)}
        >
          {formatRelative(entry.createdAt)}
        </span>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      sortKey: 'action',
      cell: (entry) => (
        <Badge tone={AUDIT_ACTION_TONE[entry.action]}>
          {AUDIT_ACTION_LABEL[entry.action]}
        </Badge>
      ),
    },
    {
      id: 'summary',
      header: 'What happened',
      cell: (entry) => (
        <p className="truncate text-sm">{entry.summary}</p>
      ),
      className: 'max-w-[26rem]',
    },
    {
      id: 'actor',
      header: 'Admin',
      sortKey: 'actor',
      hideBelow: 'lg',
      cell: (entry) => (
        <span className="truncate text-xs font-medium">
          {entry.actor.name}
        </span>
      ),
    },
    {
      id: 'target',
      header: 'Target',
      hideBelow: 'xl',
      cell: (entry) => {
        const href = targetLink(entry.targetType, entry.targetId);
        return (
          <span className="text-xs text-muted-foreground">
            {AUDIT_TARGET_LABEL[entry.targetType]}
            {href && (
              <>
                {' · '}
                <Link
                  to={href}
                  className="font-medium text-brand-600 hover:underline"
                >
                  open
                </Link>
              </>
            )}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Every change an admin made, in order. Append-only — nothing in the console can edit or delete an entry."
      />

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search summary, admin, record id…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="audit" params={params} />
            </>
          }
          filters={
            <>
              <FilterSelect
                label="Action"
                value={filters.action}
                onChange={(value) => query.setFilter('action', value)}
                options={toOptions(AUDIT_ACTION_LABEL)}
                allLabel="All actions"
                className="w-44"
              />
              <FilterSelect
                label="Record type"
                value={filters.targetType}
                onChange={(value) => query.setFilter('targetType', value)}
                options={toOptions(AUDIT_TARGET_LABEL)}
                allLabel="All records"
                className="w-36"
              />
              <FilterSelect
                label="Admin"
                value={filters.actorId}
                onChange={(value) => query.setFilter('actorId', value)}
                options={(actors ?? []).map((actor) => ({
                  value: actor.id,
                  label: `${actor.name} (${actor.entryCount})`,
                }))}
                allLabel="Any admin"
                className="w-44"
              />
              <FilterInput
                label="Record ID"
                value={filters.targetId}
                onChange={(value) => query.setFilter('targetId', value)}
                placeholder="Full history of one record"
                className="w-48"
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
          rowKey={(entry) => entry.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          onRowClick={setDetail}
          empty={
            <EmptyState
              icon={<HistoryIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matches' : 'Nothing recorded yet'}
              description={
                query.isDirty
                  ? 'No admin action matches this search and filter combination.'
                  : 'Approvals, rejections, suspensions and payment changes will all appear here.'
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
          renderCard={(entry) => (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-2">
                <Badge tone={AUDIT_ACTION_TONE[entry.action]}>
                  {AUDIT_ACTION_LABEL[entry.action]}
                </Badge>
                <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                  {formatRelative(entry.createdAt)}
                </span>
              </div>
              <p className="text-sm">{entry.summary}</p>
              <p className="text-xs text-muted-foreground">
                by {entry.actor.name} ·{' '}
                {AUDIT_TARGET_LABEL[entry.targetType]}
              </p>
            </div>
          )}
        />

        <AuditDetailPanel entry={detail} onClose={() => setDetail(null)} />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="entries"
        />
      </Card>
    </>
  );
}
