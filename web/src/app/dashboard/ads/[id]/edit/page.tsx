import Link from "next/link";
import { notFound } from "next/navigation";
import { AdForm } from "@/components/dashboard/ad-form";
import { buttonVariants } from "@/components/ui";
import { PageTitle } from "@/components/dashboard/page-title";
import { requireUser } from "@/lib/auth/require-user";
import { fetchAd } from "@/lib/ads/fetch-ad";

export default async function EditAdPage({
  params,
}: PageProps<"/dashboard/ads/[id]/edit">) {
  const user = await requireUser();
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        eyebrow="Editing"
        title={ad.title}
        description={
          ad.status === "LIVE"
            ? "Changing the title, price, photos or description sends the listing back for a quick re-check before it returns to public results."
            : "Changes are checked by our team before the listing goes live."
        }
        action={
          <Link
            href="/dashboard/ads"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to listings
          </Link>
        }
      />
      <AdForm ad={ad} />
    </div>
  );
}
