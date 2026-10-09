import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, ContactStatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { CheckIcon, InboxIcon } from '@/components/ui/icons';
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
import { BulkActionBar } from '@/components/table/bulk-action-bar';
import { ExportButton, SaveViewButton } from '@/components/table/table-actions';
import { ContactDetailPanel } from '@/components/contacts/contact-detail-panel';
import { useContactsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useRowSelection } from '@/lib/table/use-row-selection';
import {
  useBulkContactAction,
  useDeleteContact,
  useMarkContactOpened,
  useSetContactStatus,
} from '@/lib/ads/mutations';
import {
  CONTACT_STATUS_LABEL,
  CONTACT_TOPIC_LABEL,
  toOptions,
} from '@/lib/ads/labels';
import { formatAge, formatDate } from '@/lib/format';
import type { ContactListItem } from '@/lib/api/types';

const FILTER_KEYS = ['status', 'topic', 'from', 'to'] as const;

type ContactFilterKey = (typeof FILTER_KEYS)[number];

export function ContactsPage() {
  // Every status by default, so a message stays put after you open it.
  const query = useTableQuery<ContactFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });

  const [detail, setDetail] = useState<ContactListItem | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  const setStatus = useSetContactStatus();
  const markOpened = useMarkContactOpened();
  const bulk = useBulkContactAction();
  const deleteContact = useDeleteContact();
  const { filters } = query;

  /** Reading a message is what makes it "opened", so it needs no extra click. */
  const openContact = (contact: ContactListItem) => {
    if (contact.status === 'NEW') {
      markOpened.mutate(contact.id);
      setDetail({ ...contact, status: 'OPENED' });
      return;
    }
    setDetail(contact);
  };

  const askDelete = (contact: ContactListItem) =>
    setConfirm({
      title: 'Delete this message?',
      description: `The message from ${contact.name} is erased permanently. This cannot be undone.`,
      confirmLabel: 'Delete message',
      danger: true,
      onConfirm: () => deleteContact.mutateAsync(contact.id),
    });

  const params = {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    status: filters.status || undefined,
    topic: filters.topic || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isFetching, error } = useContactsQuery(params);
  const selection = useRowSelection(
    (data?.data ?? []).map((contact) => contact.id),
  );

  const rowActions = (contact: ContactListItem) => (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant={contact.status === 'RESOLVED' ? 'ghost' : 'success'}
        size="xs"
        loading={setStatus.isPending && setStatus.variables?.id === contact.id}
        onClick={(event) => {
          event.stopPropagation();
          setStatus.mutate({
            id: contact.id,
            status: contact.status === 'RESOLVED' ? 'OPENED' : 'RESOLVED',
          });
        }}
      >
        {contact.status !== 'RESOLVED' && <CheckIcon className="h-3.5 w-3.5" />}
        {contact.status === 'RESOLVED' ? 'Reopen' : 'Resolve'}
      </Button>
    </div>
  );

  const columns: Column<ContactListItem>[] = [
    {
      id: 'name',
      header: 'Sender',
      sortKey: 'name',
      cell: (contact) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{contact.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {contact.email ?? contact.phone}
          </p>
        </div>
      ),
      className: 'max-w-[16rem]',
    },
    {
      id: 'message',
      header: 'Message',
      cell: (contact) => (
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {contact.message}
        </p>
      ),
      className: 'max-w-[24rem]',
    },
    {
      id: 'topic',
      header: 'Topic',
      sortKey: 'topic',
      hideBelow: 'lg',
      cell: (contact) => (
        <Badge tone="brand">
          {CONTACT_TOPIC_LABEL[contact.topic] ?? contact.topic}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      sortKey: 'status',
      cell: (contact) => <ContactStatusBadge status={contact.status} />,
    },
    {
      id: 'createdAt',
      header: 'Received',
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'sm',
      cell: (contact) => (
        <span
          className="text-xs whitespace-nowrap text-muted-foreground tnum"
          title={formatDate(contact.createdAt)}
        >
          {formatAge(contact.createdAt)}
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

  const unread = data?.countByStatus.NEW ?? 0;

  return (
    <>
      <PageHeader
        title="Contacts"
        description={
          unread > 0
            ? `${unread} message${unread === 1 ? '' : 's'} waiting for a reply. Open one to read it, then mark it resolved.`
            : 'Messages sent through the contact form on the website.'
        }
      />

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search name, email, phone, message…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="contacts" params={params} />
            </>
          }
          filters={
            <>
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(value) => query.setFilter('status', value)}
                options={toOptions(CONTACT_STATUS_LABEL)}
                allLabel="Any"
                className="w-32"
              />
              <FilterSelect
                label="Topic"
                value={filters.topic}
                onChange={(value) => query.setFilter('topic', value)}
                options={toOptions(CONTACT_TOPIC_LABEL)}
                allLabel="Any topic"
                className="w-44"
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
          rowKey={(contact) => contact.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          selection={selection}
          onRowClick={openContact}
          empty={
            <EmptyState
              icon={<InboxIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matching messages' : 'Inbox is empty'}
              description={
                query.isDirty
                  ? 'No message matches this search and filter combination.'
                  : 'Nobody has used the contact form yet.'
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
          renderCard={(contact) => (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => openContact(contact)}
                className="flex flex-col gap-1 text-left"
              >
                <p className="truncate text-sm font-medium">{contact.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {contact.email ?? contact.phone} · {formatAge(contact.createdAt)}
                </p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {contact.message}
                </p>
              </button>
              <div className="flex items-center justify-between gap-2">
                <ContactStatusBadge status={contact.status} />
                {rowActions(contact)}
              </div>
            </div>
          )}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="messages"
        />
      </Card>

      <BulkActionBar selection={selection} noun="message">
        <Button
          variant="success"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'RESOLVED'}
          onClick={() =>
            void bulk
              .mutateAsync({ action: 'RESOLVED', ids: selection.ids })
              .then(selection.clear)
          }
        >
          <CheckIcon className="h-3.5 w-3.5" />
          Resolve
        </Button>
        <Button
          variant="secondary"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'OPENED'}
          onClick={() =>
            void bulk
              .mutateAsync({ action: 'OPENED', ids: selection.ids })
              .then(selection.clear)
          }
        >
          Reopen
        </Button>
        <Button
          variant="danger"
          size="xs"
          loading={bulk.isPending && bulk.variables?.action === 'DELETE'}
          onClick={() =>
            setConfirm({
              title: `Delete ${selection.count} message${selection.count === 1 ? '' : 's'}?`,
              description: 'The messages are erased permanently. This cannot be undone.',
              confirmLabel: 'Delete messages',
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

      <ContactDetailPanel
        contact={detail}
        onClose={() => setDetail(null)}
        onSetStatus={(contact, status) =>
          setStatus.mutate({ id: contact.id, status })
        }
        onDelete={askDelete}
      />

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
