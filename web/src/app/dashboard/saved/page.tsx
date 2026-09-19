import type { Metadata } from "next";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel } from "@/components/dashboard/panel";
import { LocalAdsGrid } from "@/components/dashboard/local-ads-grid";

export const metadata: Metadata = {
  title: "Saved listings | Jayga Lagbe",
};

export default function SavedAdsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Saved & viewed"
        description="Your shortlist and your browsing history. Both are kept in this browser, so they stay private to this device."
      />

      <Panel
        title="Saved listings"
        description="Everything you tapped “Save” on."
      >
        <LocalAdsGrid source="saved" skeletonCount={6} />
      </Panel>

      <Panel
        title="Recently viewed"
        description="The last dozen listings you opened."
      >
        <LocalAdsGrid source="viewed" skeletonCount={3} />
      </Panel>
    </div>
  );
}
