import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { EyeIcon, EyeOffIcon, StarIcon } from '@/components/ui/icons';
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
import { ReviewDetailPanel } from '@/components/reviews/review-detail-panel';
import { useReviewsQuery } from '@/lib/api/queries';
import { useTableQuery } from '@/lib/table/use-table-query';
import { useDeleteReview, useSetReviewHidden } from '@/lib/ads/mutations';
import { formatCount, formatDate, formatRelative } from '@/lib/format';
import { RatingStars } from './rating-stars';
import type { ReviewListItem } from '@/lib/api/types';

const FILTER_KEYS = [
  'minRating',
  'maxRating',
  'hidden',
  'hasComment',
  'advertiserId',
  'from',
  'to',
] as const;

type ReviewFilterKey = (typeof FILTER_KEYS)[number];

export function ReviewsPage() {
  const query = useTableQuery<ReviewFilterKey>({
    defaultSort: 'createdAt',
    defaultOrder: 'desc',
    filterKeys: FILTER_KEYS,
  });

  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [detail, setDetail] = useState<ReviewListItem | null>(null);
  const setHidden = useSetReviewHidden();
  const deleteReview = useDeleteReview();

  const { filters } = query;
  const params = {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    order: query.order,
    search: query.search,
    minRating: filters.minRating || undefined,
    maxRating: filters.maxRating || undefined,
    hidden: filters.hidden || undefined,
    hasComment: filters.hasComment || undefined,
    advertiserId: filters.advertiserId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
  };

  const { data, isLoading, isFetching, error } = useReviewsQuery(params);
  const summary = data?.summary;

  /**
   * Restoring is harmless and happens straight away; hiding takes something
   * off an advertiser's profile, so it asks first.
   */
  const toggleHidden = (review: ReviewListItem) => {
    if (review.isHidden) {
      setHidden.mutate({ reviewId: review.id, hidden: false });
      return;
    }
    setConfirm({
      title: 'Hide this review?',
      description: `The ${review.rating}-star review of ${review.advertiser.name} will stop appearing on their profile and will no longer count towards their rating. The record is kept, so this can be undone.`,
      confirmLabel: 'Hide review',
      danger: true,
      onConfirm: () =>
        setHidden.mutateAsync({ reviewId: review.id, hidden: true }),
    });
  };

  /** Hiding is reversible and covers most cases, so deleting spells out that
   * this one is not — the full text survives only in the audit log. */
  const askDelete = (review: ReviewListItem) =>
    setConfirm({
      title: 'Permanently delete this review?',
      description: `The ${review.rating}-star review of ${review.advertiser.name} is erased and ${review.customer.name} can leave a new one in its place. This cannot be undone — only the audit log keeps a copy. Hiding it instead is reversible.`,
      confirmLabel: 'Delete for ever',
      danger: true,
      onConfirm: () => deleteReview.mutateAsync(review.id),
    });

  const hideButton = (review: ReviewListItem) => {
    const pending =
      setHidden.isPending && setHidden.variables?.reviewId === review.id;

    return (
      <Button
        variant={review.isHidden ? 'secondary' : 'subtleDanger'}
        size="xs"
        loading={pending}
        onClick={(event) => {
          event.stopPropagation();
          toggleHidden(review);
        }}
      >
        {review.isHidden ? (
          <EyeIcon className="h-3.5 w-3.5" />
        ) : (
          <EyeOffIcon className="h-3.5 w-3.5" />
        )}
        {review.isHidden ? 'Restore' : 'Hide'}
      </Button>
    );
  };

  const columns: Column<ReviewListItem>[] = [
    {
      id: 'rating',
      header: 'Rating',
      sortKey: 'rating',
      cell: (review) => <RatingStars rating={review.rating} />,
    },
    {
      id: 'comment',
      header: 'Comment',
      cell: (review) =>
        review.comment ? (
          <p className="line-clamp-2 text-sm leading-relaxed">
            {review.comment}
          </p>
        ) : (
          <span className="text-xs text-muted-foreground">
            Rating only, no comment
          </span>
        ),
      className: 'max-w-[26rem]',
    },
    {
      id: 'advertiser',
      header: 'About',
      cell: (review) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">
            {review.advertiser.name}
          </p>
          {review.advertiser.isSuspended && (
            <Badge tone="danger" className="mt-0.5">
              Suspended
            </Badge>
          )}
        </div>
      ),
      className: 'max-w-[10rem]',
    },
    {
      id: 'customer',
      header: 'From',
      hideBelow: 'xl',
      cell: (review) => (
        <span className="truncate text-xs text-muted-foreground">
          {review.customer.name}
        </span>
      ),
    },
    {
      id: 'state',
      header: 'State',
      hideBelow: 'lg',
      cell: (review) =>
        review.isHidden ? (
          <Badge tone="danger" dot>
            Hidden
          </Badge>
        ) : (
          <Badge tone="success" dot>
            Visible
          </Badge>
        ),
    },
    {
      id: 'createdAt',
      header: 'Left',
      sortKey: 'createdAt',
      align: 'right',
      hideBelow: 'md',
      cell: (review) => (
        <span
          className="text-xs whitespace-nowrap text-muted-foreground tnum"
          title={formatDate(review.createdAt)}
        >
          {formatRelative(review.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: <span className="sr-only">Actions</span>,
      align: 'right',
      cell: (review) => (
        <div className="flex justify-end">{hideButton(review)}</div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Ratings customers left for advertisers. Hiding a review removes it from the advertiser's profile and their average, but keeps the record."
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3.5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Average rating
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">
              {summary ? summary.averageRating.toFixed(2) : '—'}
            </span>
            {summary && summary.visibleCount > 0 && (
              <RatingStars rating={Math.round(summary.averageRating)} />
            )}
          </div>
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
            across {formatCount(summary?.visibleCount ?? 0)} visible reviews
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3.5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Low ratings
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCount(summary?.lowRatedCount ?? 0)}
          </p>
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
            {summary?.lowRatingCeiling ?? 2} stars or fewer
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-3.5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Hidden</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCount(summary?.hiddenCount ?? 0)}
          </p>
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
            moderated out of public view
          </p>
        </div>

        {/* Distribution as a mini bar column — five ordered buckets. */}
        <div className="rounded-lg border border-border bg-card p-3.5 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">
            Distribution
          </p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {[...(summary?.distribution ?? [])].reverse().map((bucket) => {
              const total = summary?.visibleCount ?? 0;
              const pct = total === 0 ? 0 : (bucket.count / total) * 100;
              return (
                <li key={bucket.rating} className="flex items-center gap-1.5">
                  <span className="w-3 text-[0.6875rem] text-muted-foreground tnum">
                    {bucket.rating}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <span
                      className="block h-full rounded-full bg-warning-500"
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-7 text-right text-[0.6875rem] text-muted-foreground tnum">
                    {bucket.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Card className="overflow-hidden">
        <TableToolbar
          searchValue={query.searchInput}
          onSearchChange={query.setSearchInput}
          searchPlaceholder="Search comment, advertiser, customer…"
          activeFilterCount={query.activeFilterCount}
          isDirty={query.isDirty}
          onReset={query.resetFilters}
          actions={
            <>
              <SaveViewButton />
              <ExportButton resource="reviews" params={params} />
            </>
          }
          filters={
            <>
              <FilterSelect
                label="Min rating"
                value={filters.minRating}
                onChange={(value) => query.setFilter('minRating', value)}
                options={[1, 2, 3, 4, 5].map((n) => ({
                  value: String(n),
                  label: `${n}★ and up`,
                }))}
                allLabel="Any"
                className="w-32"
              />
              <FilterSelect
                label="Max rating"
                value={filters.maxRating}
                onChange={(value) => query.setFilter('maxRating', value)}
                options={[1, 2, 3, 4, 5].map((n) => ({
                  value: String(n),
                  label: `${n}★ and below`,
                }))}
                allLabel="Any"
                className="w-36"
              />
              <FilterSelect
                label="Visibility"
                value={filters.hidden}
                onChange={(value) => query.setFilter('hidden', value)}
                options={[
                  { value: 'false', label: 'Visible' },
                  { value: 'true', label: 'Hidden' },
                ]}
                allLabel="Any"
                className="w-32"
              />
              <FilterSelect
                label="Comment"
                value={filters.hasComment}
                onChange={(value) => query.setFilter('hasComment', value)}
                options={[
                  { value: 'true', label: 'Has comment' },
                  { value: 'false', label: 'Rating only' },
                ]}
                allLabel="Any"
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
          rowKey={(review) => review.id}
          sort={query.sort}
          order={query.order}
          onSort={query.toggleSort}
          isLoading={isLoading}
          isFetching={isFetching}
          error={error}
          onRowClick={setDetail}
          empty={
            <EmptyState
              icon={<StarIcon className="h-5 w-5" />}
              title={query.isDirty ? 'No matches' : 'No reviews yet'}
              description={
                query.isDirty
                  ? 'No review matches this search and filter combination.'
                  : 'Reviews appear here once customers start rating advertisers they have contacted.'
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
          renderCard={(review) => (
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <RatingStars rating={review.rating} />
                {review.isHidden && <Badge tone="danger">Hidden</Badge>}
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed">{review.comment}</p>
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-xs text-muted-foreground">
                  {review.customer.name} → {review.advertiser.name} ·{' '}
                  {formatRelative(review.createdAt)}
                </span>
                {hideButton(review)}
              </div>
            </div>
          )}
        />

        <PaginationBar
          meta={data?.meta}
          onPageChange={query.setPage}
          onLimitChange={query.setLimit}
          noun="reviews"
        />
      </Card>

      <ReviewDetailPanel
        review={detail}
        onClose={() => setDetail(null)}
        onToggleHidden={toggleHidden}
        onDelete={askDelete}
      />

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </>
  );
}
