import Link from "next/link";
import { notFound } from "next/navigation";
import { EmptyState, buttonVariants } from "@/components/ui";
import { requireUser } from "@/lib/auth/require-user";
import { fetchAd } from "@/lib/ads/fetch-ad";
import { BoostForm } from "@/components/advertiser/boost-form";

export default async function BoostAdPage({
  params,
}: PageProps<"/advertiser/ads/[id]/boost">) {
  const user = await requireUser();
  const { id } = await params;
  const ad = await fetchAd(id);
  if (!ad || ad.ownerId !== user.id) {
    notFound();
  }

  if (ad.status !== "LIVE") {
    return (
      <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-5 py-12 sm:py-16">
        <EmptyState
          tone="danger"
          title="This ad can't be boosted yet"
          description={`Only live listings can be boosted. This one is currently ${ad.status.toLowerCase()}.`}
          action={
            <Link
              href="/advertiser"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Back to your ads
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-7 px-5 py-10 sm:py-14">
      <header className="flex flex-col gap-2">
        <p className="eyebrow text-accent-700">Paid placement</p>
        <h1 className="font-heading text-title text-neutral-900">
          Boost this ad
        </h1>
        <p className="text-sm text-muted-foreground">
          Boosted listings sit above every organic result in{" "}
          {ad.sector === "LAND" ? "Jayga Jomi" : "Basha Bhara"} search and
          category pages for the whole period.
        </p>
      </header>

      <div className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-accent-600 shadow-xs"
        >
          <svg viewBox="0 0 12 12" className="size-4">
            <path d="M6.6 1 2.2 6.9h3L5.4 11l4.4-5.9h-3L6.6 1Z" fill="currentColor" />
          </svg>
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {ad.title}
        </p>
      </div>

      <BoostForm adId={ad.id} />
    </main>
  );
}
