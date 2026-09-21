import { Link } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AdStatusBadge,
  Badge,
  PaymentStatusBadge,
} from '@/components/ui/badge';
import { AdThumb } from '@/components/ads/ad-thumb';
import {
  EmptyNote,
  IdLine,
  Row,
  Rows,
  Section,
  Stat,
  StatGrid,
} from '@/components/detail/detail-parts';
import { RatingStars } from '@/pages/reviews/rating-stars';
import { useUserQuery } from '@/lib/api/queries';
import { GATEWAY_LABEL, SECTOR_LABEL } from '@/lib/ads/labels';
import {
  formatDate,
  formatDateTime,
  formatRelative,
  formatTaka,
} from '@/lib/format';
import type { UserListItem } from '@/lib/api/types';

export function UserDetailPanel({
  userId,
  onClose,
  onSuspend,
  onSetAdmin,
  onEdit,
  onDelete,
  isSelf,
}: {
  userId: string | null;
  onClose: () => void;
  onSuspend: (user: UserListItem) => void;
  onSetAdmin: (user: UserListItem) => void;
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  isSelf: boolean;
}) {
  const { data: user, isLoading, error } = useUserQuery(userId);

  /**
   * Deletion only ever succeeds on an account with nothing behind it, so the
   * button is hidden rather than offered and refused — the counts needed to
   * decide are already loaded here.
   */
  const deletable =
    user !== undefined &&
    !isSelf &&
    !user.isAdmin &&
    Object.values(user._count).every((count) => count === 0);

  return (
    <Modal
      open={userId !== null}
      onClose={onClose}
      variant="panel"
      title={user?.name ?? 'Account'}
      description={user ? (user.email ?? user.phone ?? undefined) : undefined}
      footer={
        user && (
          <>
            {deletable && (
              <Button
                variant="subtleDanger"
                onClick={() => {
                  onDelete(user);
                  onClose();
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="secondary" onClick={() => onEdit(user)}>
              Edit
            </Button>
            {!isSelf && (
              <Button
                variant="secondary"
                onClick={() => {
                  onSetAdmin(user);
                  onClose();
                }}
              >
                {user.isAdmin ? 'Revoke admin' : 'Make admin'}
              </Button>
            )}
            {!user.isAdmin && (
              <Button
                variant={user.isSuspended ? 'secondary' : 'subtleDanger'}
                onClick={() => {
                  onSuspend(user);
                  onClose();
                }}
              >
                {user.isSuspended ? 'Restore account' : 'Suspend account'}
              </Button>
            )}
          </>
        )
      }
    >
      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-28 w-full" />
        </div>
      )}

      {error && (
        <p className="text-sm text-danger-700">
          Could not load this account. {error.message}
        </p>
      )}

      {user && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {user.isSuspended ? (
              <Badge tone="danger" dot>
                Suspended
              </Badge>
            ) : (
              <Badge tone="success" dot>
                Active
              </Badge>
            )}
            {user.isAdmin && <Badge tone="brand">Admin</Badge>}
            {!user.isVerified && <Badge tone="warning">Unverified</Badge>}
            {user.stats.reportsAgainst > 0 && (
              <Badge tone="danger">
                {user.stats.reportsAgainst} report
                {user.stats.reportsAgainst === 1 ? '' : 's'} against
              </Badge>
            )}
          </div>

          {user.isSuspended && (
            <p className="mt-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
              This account cannot sign in and its listings are hidden from the
              marketplace.
            </p>
          )}

          <Section title="Activity">
            <StatGrid>
              <Stat label="Listings" value={user._count.ads} />
              <Stat label="Payments" value={user._count.payments} />
              <Stat
                label="Spend"
                value={formatTaka(user.stats.totalSpend)}
              />
              <Stat
                label="Rating"
                value={
                  user.stats.averageRating === null
                    ? '—'
                    : `${user.stats.averageRating.toFixed(1)} (${user.stats.ratedCount})`
                }
              />
            </StatGrid>
          </Section>

          <Section title="Account">
            <Rows>
              <Row label="Name">{user.name}</Row>
              <Row label="Email">{user.email ?? '—'}</Row>
              <Row label="Phone">{user.phone ?? '—'}</Row>
              <Row label="Verified">{user.isVerified ? 'Yes' : 'No'}</Row>
              <Row label="Joined">
                {formatDateTime(user.createdAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(user.createdAt)})
                </span>
              </Row>
              <Row label="Conversations">
                {user._count.customerConversations +
                  user._count.advertiserConversations}
              </Row>
              <Row label="Reports filed">{user._count.reportsFiled}</Row>
            </Rows>
            <IdLine id={user.id} />
          </Section>

          <Section
            title={`Listings (${user._count.ads})`}
            action={
              user._count.ads > 0 && (
                <Link
                  to={`/ads?q=${encodeURIComponent(user.id)}`}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  See all
                </Link>
              )
            }
          >
            {user.ads.length === 0 ? (
              <EmptyNote>This account has never posted a listing.</EmptyNote>
            ) : (
              <ul className="flex flex-col gap-2">
                {user.ads.map((ad) => (
                  <li
                    key={ad.id}
                    className="flex items-center gap-2.5 rounded-md border border-border px-2 py-2"
                  >
                    <AdThumb
                      photos={ad.photos}
                      alt=""
                      className="h-10 w-14 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{ad.title}</p>
                      <p className="truncate text-[0.6875rem] text-muted-foreground">
                        {SECTOR_LABEL[ad.sector]} · {formatTaka(ad.price)} ·{' '}
                        {formatDate(ad.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <AdStatusBadge status={ad.status} />
                      {ad._count.reports > 0 && (
                        <span className="text-[0.6875rem] text-danger-700 tnum">
                          {ad._count.reports} report
                          {ad._count.reports === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title={`Payments (${user._count.payments})`}
            action={
              user._count.payments > 0 && (
                <Link
                  to={`/transactions?q=${encodeURIComponent(user.id)}`}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  See all
                </Link>
              )
            }
          >
            {user.payments.length === 0 ? (
              <EmptyNote>This account has never paid for a boost.</EmptyNote>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {user.payments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tnum">
                        {formatTaka(payment.amount)}
                      </p>
                      <p className="truncate text-[0.6875rem] text-muted-foreground">
                        {GATEWAY_LABEL[payment.gateway]} ·{' '}
                        {payment.ad?.title ?? 'listing removed'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-0.5">
                      <PaymentStatusBadge status={payment.status} />
                      <span className="text-[0.6875rem] text-muted-foreground">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title={`Reviews received (${user._count.reviewsReceived})`}
            action={
              user._count.reviewsReceived > 0 && (
                <Link
                  to={`/reviews?advertiserId=${encodeURIComponent(user.id)}`}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  See all
                </Link>
              )
            }
          >
            {user.reviews.length === 0 ? (
              <EmptyNote>Nobody has reviewed this advertiser yet.</EmptyNote>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {user.reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-md border border-border px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <RatingStars rating={review.rating} />
                      {review.isHidden && <Badge tone="danger">Hidden</Badge>}
                    </div>
                    {review.comment && (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-0.5 text-[0.6875rem] text-ink-400">
                      {review.customer.name} ·{' '}
                      {formatRelative(review.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="History">
            <Link
              to={`/audit-log?targetId=${encodeURIComponent(user.id)}`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Every admin action on this account
            </Link>
          </Section>
        </>
      )}
    </Modal>
  );
}
