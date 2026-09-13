import { PageHeader } from '@/components/layout/page-header';
import { AdsTableSection } from '@/components/ads/ads-table-section';

export function AdsPage() {
  return (
    <>
      <PageHeader
        title="Ads"
        description="Every listing on the platform, in any state. Search, filter and take down anything that should not be live."
      />

      <AdsTableSection
        mode="manage"
        defaultSort="createdAt"
        defaultOrder="desc"
        searchPlaceholder="Search title, description, area, advertiser…"
        emptyTitle="No ads yet"
        emptyDescription="Listings appear here as soon as advertisers submit them."
      />
    </>
  );
}
