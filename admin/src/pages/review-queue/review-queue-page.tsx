import { PageHeader } from '@/components/layout/page-header';
import { AdsTableSection } from '@/components/ads/ads-table-section';
import { useAdCountsQuery } from '@/lib/api/queries';
import { formatCount } from '@/lib/format';

export function ReviewQueuePage() {
  const { data: counts } = useAdCountsQuery();
  const pending = counts?.byStatus.PENDING ?? 0;

  return (
    <>
      <PageHeader
        title="Review queue"
        description={
          pending > 0
            ? `${formatCount(pending)} listing${pending === 1 ? '' : 's'} waiting for a decision. Oldest first — open one to see photos and advertiser history before approving.`
            : 'Listings waiting for a decision. Oldest first.'
        }
      />

      {/* Oldest-first: an advertiser who submitted first should not wait behind
          someone who submitted this morning. */}
      <AdsTableSection
        mode="review"
        lockedStatus={['PENDING']}
        defaultSort="createdAt"
        defaultOrder="asc"
        searchPlaceholder="Search title, area, advertiser…"
        emptyTitle="Queue is clear"
        emptyDescription="Nothing is waiting for review right now. New submissions appear here immediately."
      />
    </>
  );
}
