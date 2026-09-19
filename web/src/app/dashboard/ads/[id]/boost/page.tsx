import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, buttonVariants } from "@/components/ui";
import { PageTitle } from "@/components/dashboard/page-title";
import { BoostForm } from "@/components/dashboard/boost-form";
import { requireUser } from "@/lib/auth/require-user";
import { fetchAd } from "@/lib/ads/fetch-ad";

export default async function BoostAdPage({
  params,
}: PageProps<"/dashboard/ads/[id]/boost">) {
  const user = await requireUser();
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  if (ad.status !== "LIVE") {
    return (
      <EmptyState
        tone="danger"
        title="This ad can't be boosted yet"
        description={`Only live listings can be boosted. This one is currently ${ad.status.toLowerCase()}.`}
        action={
          <Link
            href="/dashboard/ads"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to your listings
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <PageTitle
        eyebrow="Paid placement"
        title="Boost this ad"
        description={`Boosted listings sit above every organic result in ${
          ad.sector === "LAND" ? "Jayga Jomi" : "Basha Bhara"
        } search and category pages for the whole period.`}
      />

      <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-accent-600 shadow-xs"
        >
          <svg viewBox="0 0 12 12" aria-hidden="true" className="size-4">
            <path
              d="M6.6 1 2.2 6.9h3L5.4 11l4.4-5.9h-3L6.6 1Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {ad.title}
        </p>
      </div>

      <BoostForm adId={ad.id} />
    </div>
  );
}
