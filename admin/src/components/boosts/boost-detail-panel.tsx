import { Link } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  AdStatusBadge,
  Badge,
  BoostStatusBadge,
  PaymentStatusBadge,
} from '@/components/ui/badge';
import { AdThumb } from '@/components/ads/ad-thumb';
import {
  IdLine,
  Row,
  Rows,
  Section,
} from '@/components/detail/detail-parts';
import { BOOST_TIER_LABEL, GATEWAY_LABEL } from '@/lib/ads/labels';
import { formatDateTime, formatRelative, formatTaka } from '@/lib/format';
import type { BoostListItem } from '@/lib/api/types';

export function BoostDetailPanel({
  boost,
  onClose,
  onCancel,
  onExtend,
}: {
  boost: BoostListItem | null;
  onClose: () => void;
  onCancel: (boost: BoostListItem) => void;
  onExtend: (boost: BoostListItem) => void;
}) {
  const live = boost?.status === 'ACTIVE';
  const cancellable = live || boost?.status === 'PENDING';

  return (
    <Modal
      open={boost !== null}
      onClose={onClose}
      variant="panel"
      title={boost ? BOOST_TIER_LABEL[boost.tier] : 'Boost'}
      description={boost?.ad.title}
      footer={
        boost && (
          <>
            {cancellable && (
              <Button
                variant="subtleDanger"
                onClick={() => {
                  onCancel(boost);
                  onClose();
                }}
              >
                Cancel boost
              </Button>
            )}
            {live && (
              <Button
                variant="primary"
                onClick={() => {
                  onExtend(boost);
                  onClose();
                }}
              >
                Extend
              </Button>
            )}
          </>
        )
      }
    >
      {boost && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <BoostStatusBadge status={boost.status} />
            <Badge tone="neutral">{BOOST_TIER_LABEL[boost.tier]}</Badge>
            <PaymentStatusBadge status={boost.payment.status} />
          </div>

          <Section
            title="Listing"
            action={
              <Link
                to={`/ads?q=${encodeURIComponent(boost.ad.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open listing
              </Link>
            }
          >
            <div className="flex gap-3">
              <AdThumb
                photos={boost.ad.photos}
                alt=""
                className="h-20 w-28 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{boost.ad.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {boost.ad.locationDistrict}
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <AdStatusBadge status={boost.ad.status} />
                  {boost.ad.owner.isSuspended && (
                    <Badge tone="danger">Owner suspended</Badge>
                  )}
                </div>
              </div>
            </div>
            {boost.ad.status !== 'LIVE' && (
              <p className="mt-2 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
                This listing is not live, so the boost is being paid for
                without promoting anything. Cancelling or extending it is
                usually the fair call.
              </p>
            )}
          </Section>

          <Section title="Schedule">
            <Rows>
              <Row label="Bought">{formatDateTime(boost.createdAt)}</Row>
              <Row label="Starts">
                {boost.startAt ? formatDateTime(boost.startAt) : 'Not started'}
              </Row>
              <Row label="Ends">
                {boost.endAt ? (
                  <>
                    {formatDateTime(boost.endAt)}{' '}
                    <span className="font-normal text-muted-foreground">
                      ({formatRelative(boost.endAt)})
                    </span>
                  </>
                ) : (
                  '—'
                )}
              </Row>
            </Rows>
            <IdLine id={boost.id} />
          </Section>

          <Section
            title="Payment"
            action={
              <Link
                to={`/transactions?q=${encodeURIComponent(boost.payment.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open payment
              </Link>
            }
          >
            <Rows>
              <Row label="Amount">{formatTaka(boost.payment.amount)}</Row>
              <Row label="Gateway">
                {GATEWAY_LABEL[boost.payment.gateway]}
              </Row>
              <Row label="Reference" mono>
                {boost.payment.gatewayRef ?? '—'}
              </Row>
              <Row label="State">
                <PaymentStatusBadge status={boost.payment.status} />
              </Row>
            </Rows>
          </Section>

          <Section
            title="Advertiser"
            action={
              <Link
                to={`/users?q=${encodeURIComponent(boost.ad.owner.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open account
              </Link>
            }
          >
            <Rows>
              <Row label="Name">{boost.ad.owner.name}</Row>
            </Rows>
          </Section>

          <Section title="History">
            <Link
              to={`/audit-log?targetId=${encodeURIComponent(boost.id)}`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Every admin action on this boost
            </Link>
          </Section>
        </>
      )}
    </Modal>
  );
}
