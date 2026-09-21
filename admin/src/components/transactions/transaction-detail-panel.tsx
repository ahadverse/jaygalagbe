import { Link } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  Badge,
  BoostStatusBadge,
  PaymentStatusBadge,
} from '@/components/ui/badge';
import {
  EmptyNote,
  IdLine,
  Row,
  Rows,
  Section,
} from '@/components/detail/detail-parts';
import { BOOST_TIER_LABEL, GATEWAY_LABEL } from '@/lib/ads/labels';
import { formatDateTime, formatRelative, formatTaka } from '@/lib/format';
import type { TransactionListItem } from '@/lib/api/types';

export function TransactionDetailPanel({
  payment,
  onClose,
  onMarkFailed,
  onMarkPaid,
  onRecheck,
  rechecking,
}: {
  payment: TransactionListItem | null;
  onClose: () => void;
  onMarkFailed: (payment: TransactionListItem) => void;
  onMarkPaid: (payment: TransactionListItem) => void;
  onRecheck: (payment: TransactionListItem) => void;
  rechecking: boolean;
}) {
  return (
    <Modal
      open={payment !== null}
      onClose={onClose}
      variant="panel"
      title={payment ? formatTaka(payment.amount) : 'Payment'}
      description={
        payment
          ? `${GATEWAY_LABEL[payment.gateway]} · ${formatDateTime(payment.createdAt)}`
          : undefined
      }
      footer={
        payment?.status === 'PENDING' && (
          <>
            {/* The gateway first: it is the only one of the three that can
             * settle this without leaving the books out of step. */}
            <Button
              variant="secondary"
              loading={rechecking}
              onClick={() => onRecheck(payment)}
            >
              Re-check with gateway
            </Button>
            <Button
              variant="subtleDanger"
              onClick={() => {
                onMarkFailed(payment);
                onClose();
              }}
            >
              Mark failed
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                onMarkPaid(payment);
                onClose();
              }}
            >
              Mark paid
            </Button>
          </>
        )
      }
    >
      {payment && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <PaymentStatusBadge status={payment.status} />
            <Badge tone="neutral">{GATEWAY_LABEL[payment.gateway]}</Badge>
            {payment.boost && (
              <Badge tone="brand">{BOOST_TIER_LABEL[payment.boost.tier]}</Badge>
            )}
          </div>

          {payment.status === 'PENDING' && (
            <p className="mt-3 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
              The gateway has not resolved this payment. If it never does, close
              it as failed — that also cancels the boost waiting behind it.
            </p>
          )}

          <Section title="Payment">
            <Rows>
              <Row label="Amount">{formatTaka(payment.amount)}</Row>
              <Row label="Gateway">{GATEWAY_LABEL[payment.gateway]}</Row>
              <Row label="Gateway reference" mono>
                {payment.gatewayRef ?? '—'}
              </Row>
              <Row label="Started">{formatDateTime(payment.createdAt)}</Row>
              <Row label="Last change">
                {formatDateTime(payment.updatedAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(payment.updatedAt)})
                </span>
              </Row>
            </Rows>
            <IdLine id={payment.id} />
          </Section>

          <Section
            title="Payer"
            action={
              <Link
                to={`/users?q=${encodeURIComponent(payment.user.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open account
              </Link>
            }
          >
            <Rows>
              <Row label="Name">{payment.user.name}</Row>
              {payment.user.email && (
                <Row label="Email">{payment.user.email}</Row>
              )}
              {payment.user.phone && (
                <Row label="Phone">{payment.user.phone}</Row>
              )}
            </Rows>
          </Section>

          <Section
            title="Listing"
            action={
              payment.ad && (
                <Link
                  to={`/ads?q=${encodeURIComponent(payment.ad.id)}`}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Open listing
                </Link>
              )
            }
          >
            {payment.ad ? (
              <Rows>
                <Row label="Title">{payment.ad.title}</Row>
                <Row label="Sector">{payment.ad.sector}</Row>
              </Rows>
            ) : (
              <EmptyNote>
                The listing this payment belonged to no longer exists.
              </EmptyNote>
            )}
          </Section>

          <Section
            title="Boost"
            action={
              payment.boost && (
                <Link
                  to={`/boosts?q=${encodeURIComponent(payment.boost.id)}`}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Open boost
                </Link>
              )
            }
          >
            {payment.boost ? (
              <Rows>
                <Row label="Tier">
                  {BOOST_TIER_LABEL[payment.boost.tier]}
                </Row>
                <Row label="State">
                  <BoostStatusBadge status={payment.boost.status} />
                </Row>
                <Row label="Runs from">
                  {payment.boost.startAt
                    ? formatDateTime(payment.boost.startAt)
                    : 'Not started'}
                </Row>
                <Row label="Runs until">
                  {payment.boost.endAt
                    ? formatDateTime(payment.boost.endAt)
                    : '—'}
                </Row>
              </Rows>
            ) : (
              <EmptyNote>
                This payment is not attached to a boost.
              </EmptyNote>
            )}
          </Section>

          <Section title="History">
            <Link
              to={`/audit-log?targetId=${encodeURIComponent(payment.id)}`}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Every admin action on this payment
            </Link>
          </Section>
        </>
      )}
    </Modal>
  );
}
