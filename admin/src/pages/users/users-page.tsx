import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ShieldIcon, UsersIcon } from '@/components/ui/icons';
import {
  ConfirmDialog,
  type ConfirmRequest,
} from '@/components/ui/confirm-dialog';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import { BulkActionBar } from '@/components/table/bulk-action-bar';
import { ExportButton, SaveViewButton } from '@/components/table/table-actions';
import { UserDetailPanel } from '@/components/users/user-detail-panel';
import { EditUserDialog } from '@/components/users/edit-user-dialog';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { useUsersQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useRowSelection } from '@/lib/table/use-row-selection';
import { useAuth } from '@/lib/auth/use-auth';
import {
  useBulkUserAction,
  useDeleteUser,
  useSetUserAdmin,
  useSetUserSuspended,
} from '@/lib/ads/mutations';
import { formatCount, formatDate } from '@/lib/format';
import type { UserListItem } from '@/lib/api/types';

const FILTER_KEYS = [
  'role',
  'suspended',
  'verified',
  'hasAds',
  'from',
  'to',
] as const;

type UserFilterKey = (typeof FILTER_KEYS)[number];

/** Customers and advertisers are one role now; only admin is distinct. */
function roleOf(user: UserListItem): { label: string; tone: 'brand' | 'neutral' } {
  return user.isAdmin
    ? { label: 'Admin', tone: 'brand' }
    : { label: 'Member', tone: 'neutral' };
}

export function UsersPage() {
  const query = useTableQuery<UserFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });

  const setSuspended = useSetUserSuspended();
  const setAdmin = useSetUserAdmin();
  const bulk = useBulkUserAction();
  const deleteUser = useDeleteUser();
  const { user: currentUser } = useAuth();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState<UserListItem | null>(null);
  const { filters } = query;

  const params = {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    role: filters.role || undefined,
    suspended: filters.suspended || undefined,
    verified: filters.verified || undefined,
    hasAds: filters.hasAds || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isFetching, error } = useUsersQuery(params);
  const selection = useRowSelection((data?.data ?? []).map((user) => user.id));

  /** Restoring is harmless; suspending cuts someone off, so it asks first. */
  const askSuspend = (user: UserListItem) => {
    if (user.isSuspended) {
      setSuspended.mutate({ userId: user.id, suspended: false });
      return;
    }
    setConfirm({
      title: `Suspend ${user.name}?`,
      description:
        'They cannot sign in and their listings stop appearing on the marketplace. This is reversible.',
      confirmLabel: 'Suspend account',
      danger: true,
      onConfirm: () =>
        setSuspended.mutateAsync({ userId: user.id, suspended: true }),
    });
  };

  const askSetAdmin = (user: UserListItem) =>
    setConfirm({
      title: user.isAdmin
        ? `Revoke admin from ${user.name}?`
        : `Make ${user.name} an admin?`,
      description: user.isAdmin
        ? 'They lose access to this console immediately. Their account and listings are unaffected.'
        : 'They get the whole console: approving listings, suspending accounts, and closing payments. There is no partial admin.',
      confirmLabel: user.isAdmin ? 'Revoke admin' : 'Grant admin',
      danger: !user.isAdmin,
      onConfirm: () =>
        setAdmin.mutateAsync({ userId: user.id, isAdmin: !user.isAdmin }),
    });

  /**
   * The panel only offers this on an account with no listings, payments or
   * conversations behind it, so nothing else goes with it — but the person is
   * gone for good, which suspending would not do.
   */
  const askDelete = (user: UserListItem) =>
    setConfirm({
      title: `Permanently delete ${user.name}?`,
      description:
        'The account and its sign-in details are erased for good. This cannot be undone. Suspending instead keeps the record and only blocks sign-in.',
      confirmLabel: 'Delete for ever',
      danger: true,
      onConfirm: () => deleteUser.mutateAsync(user.id),
    });

  const rowActions = (user: UserListItem) => {
    const isSelf = user.id === currentUser?.id;
    const suspending =
      setSuspended.isPending && setSuspended.variables?.userId === user.id;
    const promoting =
      setAdmin.isPending && setAdmin.variables?.userId === user.id;

    return (
      <div className="flex items-center justify-end gap-1.5">
        {/* Changing your own admin access is rejected server-side too. */}
        {!isSelf && (
          <Button
            variant="secondary"
            size="xs"
            loading={promoting}
            onClick={(event) => {
              event.stopPropagation();
              askSetAdmin(user);
            }}
          >
            <ShieldIcon className="h-3.5 w-3.5" />
            {user.isAdmin ? 'Revoke' : 'Make admin'}
          </Button>
        )}

        {user.isAdmin ? (
          <span className="text-xs text-muted-foreground">Protected</span>
        ) : (
          <Button
            variant={user.isSuspended ? 'secondary' : 'subtleDanger'}
            size="xs"
            loading={suspending}
            onClick={(event) => {
              event.stopPropagation();
              askSuspend(user);
            }}
          >
            {user.isSuspended ? 'Restore' : 'Suspend'}
          </Button>
        )}
      </div>
    );
  };

  const columns: Column<UserListItem>[] = [
    {
      id: 'name',
      header: 'Name',
      sortKey: 'name',
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-200 text-xs font-semibold text-ink-700">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email ?? user.phone ?? '—'}
            </p>
          </div>
        </div>
      ),
      className: 'max-w-[18rem]',
    },
    {
      id: 'role',
      header: 'Role',
      cell: (user) => {
        const role = roleOf(user);
        return <Badge tone={role.tone}>{role.label}</Badge>;
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      hideBelow: 'xl',
      cell: (user) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground tnum">
          {user.phone ?? '—'}
        </span>
      ),
    },
    {
      id: 'ads',
      header: 'Ads',
      sortKey: 'ads',
      align: 'right',
      hideBelow: 'lg',
      cell: (user) => (
        <span className="tnum">{formatCount(user._count.ads)}</span>
      ),
    },
    {
      id: 'payments',
      header: 'Payments',
      align: 'right',
      hideBelow: 'xl',
      cell: (user) => (
        <span className="tnum">{formatCount(user._count.payments)}</span>
      ),
    },
    {
      id: 'state',
      header: 'State',
      cell: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.isSuspended ? (
            <Badge tone="danger" dot>
              Suspended
            </Badge>
          ) : (
            <Badge tone="success" dot>
              Active
            </Badge>
          )}
          {!user.isVerified && <Badge tone="warning">Unverified</Badge>}
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: 'Joined',
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'md',
      cell: (user) => (
        <span className="text-xs whitespace-nowrap text-muted-foreground tnum">
          {formatDate(user.createdAt)}
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

  const counts = data?.counts;

  return (
    <>
      <PageHeader
        title="Users"
        description="Every account on the platform. Suspend one to block sign-in and hide its listings; grant admin to give someone this console."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryTile label="Accounts" value={counts?.total} />
        <SummaryTile label="Admins" value={counts?.admins} />
        <SummaryTile
          label="Suspended"
          value={counts?.suspended}
          tone={counts && counts.suspended > 0 ? 'danger' : undefined}
        />
        <SummaryTile label="Unverified" value={counts?.unverified} />
      </div>

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search name, email, phone…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="users" params={params} />
            </>
          }
          filters={
            <>
              <FilterSelect
                label="Role"
                value={filters.role}
                onChange={(value) => query.setFilter('role', value)}
                options={[
                  { value: 'user', label: 'Member' },
                  { value: 'admin', label: 'Admin' },
                ]}
                allLabel="All roles"
                className="w-36"
              />
              <FilterSelect
                label="Account"
                value={filters.suspended}
                onChange={(value) => query.setFilter('suspended', value)}
                options={[
                  { value: 'false', label: 'Active' },
                  { value: 'true', label: 'Suspended' },
                ]}
                allLabel="Any state"
                className="w-36"
              />
              <FilterSelect
                label="Verification"
                value={filters.verified}
                onChange={(value) => query.setFilter('verified', value)}
                options={[
                  { value: 'true', label: 'Verified' },
                  { value: 'false', label: 'Unverified' },
                ]}
                allLabel="Any"
                className="w-36"
              />
              <FilterSelect
                label="Activity"
                value={filters.hasAds}
                onChange={(value) => query.setFilter('hasAds', value)}
                options={[
                  { value: 'true', label: 'Has posted' },
                  { value: 'false', label: 'Never posted' },
                ]}
                allLabel="Any"
                className="w-36"
              />
              <FilterInput
                label="Joined from"
                type="date"
                value={filters.from}
                onChange={(value) => query.setFilter('from', value)}
                className="w-36"
              />
              <FilterInput
                label="Joined to"
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
          rowKey={(user) => user.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          selection={selection}
          onRowClick={(user) => setDetailId(user.id)}
          empty={
            <EmptyState
              icon={<UsersIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matches' : 'No users yet'}
              description={
                query.isDirty
                  ? 'No account matches this search and filter combination.'
                  : 'Accounts appear here as people register.'
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
          renderCard={(user) => {
            const role = roleOf(user);
            return (
              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-200 text-sm font-semibold text-ink-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email ?? user.phone ?? '—'}
                    </p>
                  </div>
                  <Badge tone={role.tone}>{role.label}</Badge>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {user.isSuspended ? (
                      <Badge tone="danger" dot>
                        Suspended
                      </Badge>
                    ) : (
                      <Badge tone="success" dot>
                        Active
                      </Badge>
                    )}
                    <span className="tnum">
                      {formatCount(user._count.ads)} ads
                    </span>
                    <span>· {formatDate(user.createdAt)}</span>
                  </div>
                  {rowActions(user)}
                </div>
              </div>
            );
          }}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="users"
        />
      </Card>

      <BulkActionBar selection={selection} noun="account">
        <Button
          variant="subtleDanger"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'SUSPEND'}
          onClick={() =>
            setConfirm({
              title: `Suspend ${selection.count} account${selection.count === 1 ? '' : 's'}?`,
              description:
                'They cannot sign in and their listings stop appearing. Admin accounts in the selection are refused and reported back.',
              confirmLabel: 'Suspend all',
              danger: true,
              onConfirm: () =>
                bulk
                  .mutateAsync({ action: 'SUSPEND', ids: selection.ids })
                  .then(selection.clear),
            })
          }
        >
          Suspend
        </Button>
        <Button
          variant="secondary"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'UNSUSPEND'}
          onClick={() =>
            void bulk
              .mutateAsync({ action: 'UNSUSPEND', ids: selection.ids })
              .then(selection.clear)
          }
        >
          Restore
        </Button>
        <Button
          variant="danger"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'DELETE'}
          onClick={() =>
            setConfirm({
              title: `Permanently delete ${selection.count} account${selection.count === 1 ? '' : 's'}?`,
              description:
                'Only empty accounts can go: any with listings, payments or messages behind them are refused and reported back, as are admins and your own account. This cannot be undone.',
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

      <UserDetailPanel
        userId={detailId}
        onClose={() => setDetailId(null)}
        onSuspend={askSuspend}
        onSetAdmin={askSetAdmin}
        onEdit={(user) => {
          setDetailId(null);
          setEditing(user);
        }}
        onDelete={askDelete}
        isSelf={detailId === currentUser?.id}
      />

      <EditUserDialog user={editing} onClose={() => setEditing(null)} />

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | undefined;
  tone?: 'danger';
}) {
  return (
    <div
      className={
        tone === 'danger'
          ? 'rounded-lg border border-danger-200 bg-danger-50 p-3.5'
          : 'rounded-lg border border-border bg-card p-3.5 shadow-xs'
      }
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {value === undefined ? '—' : formatCount(value)}
      </p>
    </div>
  );
}
