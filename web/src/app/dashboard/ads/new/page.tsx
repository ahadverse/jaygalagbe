import type { Metadata } from "next";
import { AdForm } from "@/components/dashboard/ad-form";
import { PageTitle } from "@/components/dashboard/page-title";

export const metadata: Metadata = {
  title: "Post a new ad | Jayga Lagbe",
};

export default function NewAdPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        eyebrow="New listing"
        title="Post a new ad"
        description="Fill in the details below. Our team checks every listing before it goes live, which usually takes less than a day."
      />
      <AdForm />
    </div>
  );
}
