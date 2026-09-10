import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, buttonVariants } from "@/components/ui";
import { PhotoPlaceholder } from "@/components/ads/photo-placeholder";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyAds } from "@/lib/ads/fetch-my-ads";
import { formatPrice } from "@/lib/format";
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

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Your ads</h1>
          <p className="text-muted-foreground">
            Manage listings, boosts, and stats.
          </p>
        </div>
        <Link
          href="/advertiser/ads/new"
          className={buttonVariants({ variant: "accent" })}
        >
          Post a new ad
        </Link>
      </div>

      {ads.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
          You haven&apos;t posted any ads yet.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {ads.map((ad) => {
            const badge = statusBadge[ad.status];
            return (
              <div
                key={ad.id}
                className="flex gap-4 rounded-xl border border-border p-4 shadow-sm"
              >
                <PhotoPlaceholder
                  sector={ad.sector}
                  className="h-20 w-28 shrink-0 rounded-lg"
                />
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                    {ad.status === "REJECTED" && ad.rejectionReason && (
                      <span className="text-xs text-danger-600">
                        {ad.rejectionReason}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/ads/${ad.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {ad.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {ad.locationArea}, {ad.locationDistrict} —{" "}
                    {formatPrice(ad.price)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
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
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
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
                    <form action={deleteAdAction}>
                      <input type="hidden" name="id" value={ad.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Remove
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
