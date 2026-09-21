import { Link } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  EmptyNote,
  IdLine,
  Row,
  Rows,
  Section,
} from '@/components/detail/detail-parts';
import { RatingStars } from '@/pages/reviews/rating-stars';
import { formatDateTime, formatRelative } from '@/lib/format';
import type { ReviewListItem } from '@/lib/api/types';

export function ReviewDetailPanel({
  review,
  onClose,
  onToggleHidden,
  onDelete,
}: {
  review: ReviewListItem | null;
  onClose: () => void;
  onToggleHidden: (review: ReviewListItem) => void;
  onDelete: (review: ReviewListItem) => void;
}) {
  return (
    <Modal
      open={review !== null}
      onClose={onClose}
      variant="panel"
      title={review ? `${review.rating}-star review` : 'Review'}
      description={review ? `of ${review.advertiser.name}` : undefined}
      footer={
        review && (
          <>
            {/* Hiding covers almost every case; deleting is for content that
                cannot stay on the platform at all. */}
            <Button
              variant="subtleDanger"
              onClick={() => {
                onDelete(review);
                onClose();
              }}
            >
              Delete
            </Button>
            <Button
              variant={review.isHidden ? 'secondary' : 'subtleDanger'}
              onClick={() => {
                onToggleHidden(review);
                onClose();
              }}
            >
              {review.isHidden ? 'Restore to profile' : 'Hide from profile'}
            </Button>
          </>
        )
      }
    >
      {review && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <RatingStars rating={review.rating} />
            {review.isHidden ? (
              <Badge tone="danger" dot>
                Hidden
              </Badge>
            ) : (
              <Badge tone="success" dot>
                Visible
              </Badge>
            )}
          </div>

          {review.isHidden && (
            <p className="mt-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
              This review is hidden: it does not appear on the advertiser's
              profile and is excluded from their average rating. The record is
              kept, so restoring it puts it straight back.
            </p>
          )}

          <Section title="Comment">
            {review.comment ? (
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {review.comment}
              </p>
            ) : (
              <EmptyNote>
                The customer left a rating without writing anything.
              </EmptyNote>
            )}
          </Section>

          <Section
            title="About"
            action={
              <Link
                to={`/users?q=${encodeURIComponent(review.advertiser.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open account
              </Link>
            }
          >
            <Rows>
              <Row label="Advertiser">
                {review.advertiser.name}
                {review.advertiser.isSuspended && (
                  <Badge tone="danger" className="ml-2">
                    Suspended
                  </Badge>
                )}
              </Row>
              {review.advertiser.email && (
                <Row label="Email">{review.advertiser.email}</Row>
              )}
            </Rows>
          </Section>

          <Section
            title="From"
            action={
              <Link
                to={`/users?q=${encodeURIComponent(review.customer.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open account
              </Link>
            }
          >
            <Rows>
              <Row label="Customer">{review.customer.name}</Row>
              {review.customer.email && (
                <Row label="Email">{review.customer.email}</Row>
              )}
              <Row label="Left">
                {formatDateTime(review.createdAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(review.createdAt)})
                </span>
              </Row>
              {review.updatedAt !== review.createdAt && (
                <Row label="Edited">{formatDateTime(review.updatedAt)}</Row>
              )}
            </Rows>
            <IdLine id={review.id} />
          </Section>

          <Section title="More from this pair">
            <div className="flex flex-col gap-1.5">
              <Link
                to={`/reviews?advertiserId=${encodeURIComponent(review.advertiser.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Every review of {review.advertiser.name}
              </Link>
              <Link
                to={`/audit-log?targetId=${encodeURIComponent(review.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Every admin action on this review
              </Link>
            </div>
          </Section>
        </>
      )}
    </Modal>
  );
}
