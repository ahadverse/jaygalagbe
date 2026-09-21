import { Link } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  AdStatusBadge,
  Badge,
  ReportStatusBadge,
} from '@/components/ui/badge';
import { AdThumb } from '@/components/ads/ad-thumb';
import {
  IdLine,
  Row,
  Rows,
  Section,
} from '@/components/detail/detail-parts';
import { SECTOR_LABEL } from '@/lib/ads/labels';
import { formatDateTime, formatRelative, formatTaka } from '@/lib/format';
import type { ReportListItem } from '@/lib/api/types';

/** Reasons are stored as `CODE: free text`, so split them for display. */
function splitReason(reason: string): { code: string; note: string | null } {
  const separator = reason.indexOf(':');
  if (separator === -1) return { code: reason, note: null };
  return {
    code: reason.slice(0, separator).trim(),
    note: reason.slice(separator + 1).trim() || null,
  };
}

export function ReportDetailPanel({
  report,
  onClose,
  onResolve,
  onOpenAd,
  onDelete,
}: {
  report: ReportListItem | null;
  onClose: () => void;
  onResolve: (report: ReportListItem, status: 'REVIEWED' | 'DISMISSED') => void;
  onOpenAd: (adId: string) => void;
  onDelete: (report: ReportListItem) => void;
}) {
  const reason = report ? splitReason(report.reason) : null;
  const pending = report?.status === 'PENDING';

  return (
    <Modal
      open={report !== null}
      onClose={onClose}
      variant="panel"
      title="Reported listing"
      description={report?.ad.title}
      footer={
        report && (
          <>
            {/* Available on a settled report too: dismissing keeps the flag on
                the listing's record, deleting is for one filed in bad faith. */}
            <Button
              variant="subtleDanger"
              onClick={() => {
                onDelete(report);
                onClose();
              }}
            >
              Delete
            </Button>
            {pending && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    onResolve(report, 'DISMISSED');
                    onClose();
                  }}
                >
                  Dismiss
                </Button>
                <Button
                  variant="success"
                  onClick={() => {
                    onResolve(report, 'REVIEWED');
                    onClose();
                  }}
                >
                  Mark actioned
                </Button>
              </>
            )}
          </>
        )
      }
    >
      {report && reason && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <ReportStatusBadge status={report.status} />
            <AdStatusBadge status={report.ad.status} />
            {report.ad._count.reports > 1 && (
              <Badge tone="danger">
                {report.ad._count.reports} reports on this listing
              </Badge>
            )}
          </div>

          <Section title="Why it was flagged">
            <Badge tone="danger">
              {reason.code.replace(/_/g, ' ').toLowerCase()}
            </Badge>
            {reason.note && (
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                {reason.note}
              </p>
            )}
          </Section>

          <Section
            title="Listing"
            action={
              <button
                type="button"
                onClick={() => onOpenAd(report.adId)}
                className="rounded text-xs font-medium text-brand-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Full listing
              </button>
            }
          >
            <div className="flex gap-3">
              <AdThumb
                photos={report.ad.photos}
                alt=""
                className="h-20 w-28 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{report.ad.title}</p>
                <p className="mt-0.5 text-sm font-semibold tnum">
                  {formatTaka(report.ad.price)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {report.ad.locationArea}, {report.ad.locationDistrict} ·{' '}
                  {SECTOR_LABEL[report.ad.sector]}
                </p>
              </div>
            </div>
          </Section>

          <Section
            title="Advertiser"
            action={
              <Link
                to={`/users?q=${encodeURIComponent(report.ad.owner.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open account
              </Link>
            }
          >
            <Rows>
              <Row label="Name">
                {report.ad.owner.name}
                {report.ad.owner.isSuspended && (
                  <Badge tone="danger" className="ml-2">
                    Suspended
                  </Badge>
                )}
              </Row>
            </Rows>
          </Section>

          <Section
            title="Reported by"
            action={
              <Link
                to={`/users?q=${encodeURIComponent(report.reporter.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Open account
              </Link>
            }
          >
            <Rows>
              <Row label="Name">{report.reporter.name}</Row>
              {report.reporter.email && (
                <Row label="Email">{report.reporter.email}</Row>
              )}
              {report.reporter.phone && (
                <Row label="Phone">{report.reporter.phone}</Row>
              )}
              <Row label="Reported">
                {formatDateTime(report.createdAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(report.createdAt)})
                </span>
              </Row>
            </Rows>
            <IdLine id={report.id} />
          </Section>

          <Section title="Related">
            <div className="flex flex-col gap-1.5">
              <Link
                to={`/reports?adId=${encodeURIComponent(report.adId)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Every report on this listing
              </Link>
              <Link
                to={`/audit-log?targetId=${encodeURIComponent(report.id)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Every admin action on this report
              </Link>
            </div>
          </Section>
        </>
      )}
    </Modal>
  );
}
