import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, EmptyState, buttonVariants } from "@/components/ui";
import { PhotoPlaceholder } from "@/components/ads/photo-placeholder";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyAds } from "@/lib/ads/fetch-my-ads";
import { formatAmount, formatRelativeTime } from "@/lib/format";
import { markSoldAction, resubmitAdAction, deleteAdAction } from "@/lib/ads/actions";

export const metadata: Metadata = {
  title: "Your ads | Jayga Lagbe",
};

const statusBadge = {
  LIVE: { label: "Live", variant: "success" as const },
  PENDING: { label: "Pending review", variant: "warning" as const },
  REJECTED: { label: "Rejected", variant: "danger" as const },
  SOLD: { label: "Sold", variant: "info" as const },
  REMOVED: { label: "Removed", variant: "neutral" as const },
};

export default async function AdvertiserDashboardPage() {
  await requireUser();
  const token = (await getToken())!;
  const ads = await fetchMyAds(token);

  const liveCount = ads.filter((ad) => ad.status === "LIVE").length;
  const pendingCount = ads.filter((ad) => ad.status === "PENDING").length;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-title text-neutral-900">Your ads</h1>
          <p className="text-sm text-muted-foreground">
            {ads.length === 0
              ? "Manage listings, boosts, and performance from here."
              : `${liveCount} live${pendingCount > 0 ? ` · ${pendingCount} awaiting review` : ""} · ${ads.length} total`}
          </p>
        </div>
        <Link
          href="/advertiser/ads/new"
          className={buttonVariants({ variant: "primary" })}
        >
          Post a new ad
        </Link>
      </header>

      {ads.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Post your first property and it will be reviewed and published, usually within a day."
          action={
            <Link
              href="/advertiser/ads/new"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Post your first ad
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {ads.map((ad) => {
            const badge = statusBadge[ad.status];
            return (
              <article
                key={ad.id}
                className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5 transition-shadow duration-200 hover:shadow-md sm:flex-row sm:p-5"
              >
                <PhotoPlaceholder
                  sector={ad.sector}
                  photo={ad.photos[0]}
                  alt={ad.title}
                  className="h-36 w-full shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-32"
                />

                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badge.variant} size="sm">
                      {badge.label}
                    </Badge>
                    <span className="text-2xs text-subtle-foreground">
                      {formatRelativeTime(ad.createdAt)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Link
                      href={`/ads/${ad.id}`}
                      className="font-heading text-base font-bold tracking-tight text-foreground transition-colors hover:text-primary"
                    >
                      {ad.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {ad.locationArea}, {ad.locationDistrict}
                      <span aria-hidden="true" className="mx-1.5 text-neutral-300">
                        ·
                      </span>
                      <span className="numeric font-semibold text-primary">
                        ৳ {formatAmount(ad.price)}
                      </span>
                    </p>
                  </div>

                  {ad.status === "REJECTED" && ad.rejectionReason && (
                    <p className="rounded-lg bg-danger-50 px-3 py-2 text-xs text-danger-800 ring-1 ring-danger-100">
                      <span className="font-semibold">Rejected:</span>{" "}
                      {ad.rejectionReason}
                    </p>
                  )}

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/advertiser/ads/${ad.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Edit
                    </Link>
                    {ad.status === "LIVE" && (
                      <>
                        <Link
                          href={`/advertiser/ads/${ad.id}/boost`}
                          className={buttonVariants({ variant: "soft", size: "sm" })}
                        >
                          <svg
                            viewBox="0 0 12 12"
                            aria-hidden="true"
                            className="size-3"
                          >
                            <path
                              d="M6.6 1 2.2 6.9h3L5.4 11l4.4-5.9h-3L6.6 1Z"
                              fill="currentColor"
                            />
                          </svg>
                          Boost
                        </Link>
                        <Link
                          href={`/advertiser/ads/${ad.id}/stats`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Stats
                        </Link>
                        <form action={markSoldAction}>
                          <input type="hidden" name="id" value={ad.id} />
                          <Button type="submit" variant="ghost" size="sm">
                            Mark sold
                          </Button>
                        </form>
                      </>
                    )}
                    {ad.status === "REJECTED" && (
                      <form action={resubmitAdAction}>
                        <input type="hidden" name="id" value={ad.id} />
                        <Button type="submit" variant="outline" size="sm">
                          Resubmit
                        </Button>
                      </form>
                    )}
                    <form action={deleteAdAction} className="sm:ml-auto">
                      <input type="hidden" name="id" value={ad.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:bg-danger-50 hover:text-danger-700"
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
