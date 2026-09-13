import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { UsersIcon } from '@/components/ui/icons';
import { DataTable, type Column } from '@/components/table/data-table';
import { PaginationBar } from '@/components/table/pagination-bar';
import {
  FilterInput,
  FilterSelect,
  TableToolbar,
} from '@/components/table/table-toolbar';
import { useUsersQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useSetUserSuspended } from '@/lib/ads/mutations';
import { formatCount, formatDate } from '@/lib/format';
import type { UserListItem } from '@/lib/api/types';

const FILTER_KEYS = ['role', 'suspended', 'verified', 'from', 'to'] as const;

type UserFilterKey = (typeof FILTER_KEYS)[number];

function roleOf(user: UserListItem): { label: string; tone: 'brand' | 'info' | 'neutral' } {
  if (user.isAdmin) return { label: 'Admin', tone: 'brand' };
  if (user.isAdvertiser) return { label: 'Advertiser', tone: 'info' };
  return { label: 'Customer', tone: 'neutral' };
}

export function UsersPage() {
  const query = useTableQuery<UserFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });

  const setSuspended = useSetUserSuspended();
  const { filters } = query;

  const { data, isLoading, isFetching, error } = useUsersQuery({
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    role: filters.role || undefined,
    suspended: filters.suspended || undefined,
    verified: filters.verified || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  });

  const suspendButton = (user: UserListItem) => {
    if (user.isAdmin) {
      return (
        <span className="text-xs text-muted-foreground">Protected</span>
      );
    }

    const pending =
      setSuspended.isPending && setSuspended.variables?.userId === user.id;

    return user.isSuspended ? (
      <Button
        variant="secondary"
        size="xs"
        loading={pending}
        onClick={() =>
          setSuspended.mutate({ userId: user.id, suspended: false })
        }
      >
        Restore
      </Button>
    ) : (
      <Button
        variant="subtleDanger"
        size="xs"
        loading={pending}
        onClick={() => setSuspended.mutate({ userId: user.id, suspended: true })}
      >
        Suspend
      </Button>
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
      cell: (user) => (
        <div className="flex justify-end">{suspendButton(user)}</div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Customer, advertiser and admin accounts. Suspend an account to block sign-in and hide its listings."
      />

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search name, email, phone…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          filters={
            <>
              <FilterSelect
                label="Role"
                value={filters.role}
                onChange={(value) => query.setFilter('role', value)}
                options={[
                  { value: 'customer', label: 'Customer' },
                  { value: 'advertiser', label: 'Advertiser' },
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
                  {suspendButton(user)}
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
    </>
  );
}
