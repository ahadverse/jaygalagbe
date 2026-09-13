import type { ReactNode } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AdStatusBadge,
  Badge,
  BoostStatusBadge,
  ReportStatusBadge,
} from '@/components/ui/badge';
import { AdThumb } from '@/components/ads/ad-thumb';
import { useAdQuery } from '@/lib/api/queries';
import {
  formatCount,
  formatDateTime,
  formatRelative,
  formatTaka,
} from '@/lib/format';
import { BOOST_TIER_LABEL, SECTOR_LABEL } from '@/lib/ads/labels';
import { useApproveAd, useRemoveAd } from '@/lib/ads/mutations';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium break-words">{children}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-ink-50 px-2.5 py-2">
      <p className="text-base font-semibold tnum">{formatCount(value)}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function AdDetailPanel({
  adId,
  onClose,
  onReject,
}: {
  adId: string | null;
  onClose: () => void;
  onReject: (adId: string, title: string) => void;
}) {
  const { data: ad, isLoading, error } = useAdQuery(adId);
  const approve = useApproveAd();
  const remove = useRemoveAd();

  const canApprove = ad?.status === 'PENDING';
  const canRemove = ad ? ad.status !== 'REMOVED' : false;

  return (
    <Modal
      open={adId !== null}
      onClose={onClose}
      variant="panel"
      title={ad?.title ?? 'Listing'}
      description={ad ? `${SECTOR_LABEL[ad.sector]} · ${ad.id}` : undefined}
      footer={
        ad && (
          <>
            {canRemove && (
              <Button
                variant="subtleDanger"
                loading={remove.isPending}
                onClick={async () => {
                  await remove.mutateAsync(ad.id);
                  onClose();
                }}
              >
                Take down
              </Button>
            )}
            {canApprove && (
              <>
                <Button
                  variant="danger"
                  onClick={() => onReject(ad.id, ad.title)}
                >
                  Reject
                </Button>
                <Button
                  variant="success"
                  loading={approve.isPending}
                  onClick={async () => {
                    await approve.mutateAsync(ad.id);
                    onClose();
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </>
        )
      }
    >
      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {error && (
        <p className="text-sm text-danger-700">
          Could not load this listing. {error.message}
        </p>
      )}

      {ad && (
        <>
          {ad.photos.length > 0 && (
            <div className="-mx-4 -mt-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pt-4 pb-1">
              {ad.photos.map((photo, index) => (
                <AdThumb
                  key={photo}
                  photos={[photo]}
                  alt={`${ad.title} photo ${index + 1}`}
                  className="h-32 w-44 shrink-0"
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <AdStatusBadge status={ad.status} />
            <Badge tone="neutral">{SECTOR_LABEL[ad.sector]}</Badge>
            {ad._count.reports > 0 && (
              <Badge tone="danger">
                {ad._count.reports} report{ad._count.reports === 1 ? '' : 's'}
              </Badge>
            )}
          </div>

          {ad.rejectionReason && (
            <p className="mt-3 rounded-md border border-danger-200 bg-danger-50 px-3 py-2 text-xs text-danger-700">
              <span className="font-semibold">Last rejection:</span>{' '}
              {ad.rejectionReason}
            </p>
          )}

          <Section title="Listing">
            <dl className="divide-y divide-border">
              <Row label="Price">{formatTaka(ad.price)}</Row>
              <Row label="Location">
                {ad.locationArea}, {ad.locationDistrict}
              </Row>
              {ad.address && <Row label="Address">{ad.address}</Row>}
              <Row label="Submitted">
                {formatDateTime(ad.createdAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(ad.createdAt)})
                </span>
              </Row>
              {ad.attributes &&
                Object.entries(ad.attributes).map(([key, value]) => (
                  <Row key={key} label={key}>
                    {String(value)}
                  </Row>
                ))}
            </dl>
          </Section>

          <Section title="Description">
            <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
              {ad.description}
            </p>
          </Section>

          <Section title="Advertiser">
            <dl className="divide-y divide-border">
              <Row label="Name">
                {ad.owner.name}
                {ad.owner.isSuspended && (
                  <Badge tone="danger" className="ml-2">
                    Suspended
                  </Badge>
                )}
              </Row>
              {ad.owner.email && <Row label="Email">{ad.owner.email}</Row>}
              {ad.owner.phone && <Row label="Phone">{ad.owner.phone}</Row>}
              <Row label="Joined">{formatDateTime(ad.owner.createdAt)}</Row>
            </dl>
          </Section>

          <Section title="Performance">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Impressions" value={ad._count.impressions} />
              <Stat label="Visits" value={ad._count.visits} />
              <Stat label="Conversions" value={ad._count.conversions} />
              <Stat label="Chats" value={ad._count.conversations} />
            </div>
          </Section>

          {ad.boosts.length > 0 && (
            <Section title="Boosts">
              <ul className="flex flex-col gap-1.5">
                {ad.boosts.map((boost) => (
                  <li
                    key={boost.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-border px-2.5 py-2 text-sm"
                  >
                    <span>{BOOST_TIER_LABEL[boost.tier]}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {boost.endAt && `ends ${formatRelative(boost.endAt)}`}
                      <BoostStatusBadge status={boost.status} />
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {ad.reports.length > 0 && (
            <Section title={`Reports (${ad.reports.length})`}>
              <ul className="flex flex-col gap-2">
                {ad.reports.map((report) => (
                  <li
                    key={report.id}
                    className="rounded-md border border-border px-2.5 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">
                        {report.reporter.name}
                      </span>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {report.reason}
                    </p>
                    <p className="mt-1 text-[0.6875rem] text-ink-400">
                      {formatRelative(report.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}
    </Modal>
  );
}
