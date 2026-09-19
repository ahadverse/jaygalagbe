import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button, EmptyState, buttonVariants } from "@/components/ui";
import { PhotoPlaceholder } from "@/components/ads/photo-placeholder";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel } from "@/components/dashboard/panel";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyAds } from "@/lib/ads/fetch-my-ads";
import { AD_STATUS_BADGE } from "@/lib/ads/status";
import type { AdStatus } from "@/lib/ads/types";
import { formatAmount, formatRelativeTime } from "@/lib/format";
import { cn, firstSearchParam } from "@/lib/utils";
import {
  markSoldAction,
  resubmitAdAction,
  deleteAdAction,
} from "@/lib/ads/actions";

export const metadata: Metadata = {
  title: "My listings | Jayga Lagbe",
};

const FILTERS: { value: string; label: string; status?: AdStatus }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live", status: "LIVE" },
  { value: "pending", label: "In review", status: "PENDING" },
  { value: "rejected", label: "Rejected", status: "REJECTED" },
  { value: "sold", label: "Sold", status: "SOLD" },
];

export default async function MyListingsPage({
  searchParams,
}: PageProps<"/dashboard/ads">) {
  await requireUser();
  const token = (await getToken())!;
  const ads = await fetchMyAds(token);

  const resolved = await searchParams;
  const requested = firstSearchParam(resolved?.status) ?? "all";
  const active = FILTERS.some((filter) => filter.value === requested)
    ? requested
    : "all";
  const activeStatus = FILTERS.find((filter) => filter.value === active)?.status;
  const visible = activeStatus
    ? ads.filter((ad) => ad.status === activeStatus)
    : ads;

  const liveCount = ads.filter((ad) => ad.status === "LIVE").length;
  const pendingCount = ads.filter((ad) => ad.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="My listings"
        description={
          ads.length === 0
            ? "Manage listings, boosts and performance from here."
            : `${liveCount} live${pendingCount > 0 ? ` · ${pendingCount} awaiting review` : ""} · ${ads.length} total`
        }
        action={
          <Link
            href="/dashboard/ads/new"
            className={buttonVariants({ variant: "primary" })}
          >
            Post a new ad
          </Link>
        }
      />

      {ads.length === 0 ? (
        <EmptyState
          title="No listings yet"
          description="Post your first property and it will be reviewed and published, usually within a day."
          action={
            <Link
              href="/dashboard/ads/new"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Post your first ad
            </Link>
          }
        />
      ) : (
        <>
          <nav
            aria-label="Filter listings by status"
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map((filter) => {
              const count = filter.status
                ? ads.filter((ad) => ad.status === filter.status).length
                : ads.length;
              return (
                <Link
                  key={filter.value}
                  href={
                    filter.value === "all"
                      ? "/dashboard/ads"
                      : `/dashboard/ads?status=${filter.value}`
                  }
                  aria-current={active === filter.value ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150",
                    active === filter.value
                      ? "bg-neutral-900 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {filter.label}
                  <span className="numeric ml-1.5 opacity-60">{count}</span>
                </Link>
              );
            })}
          </nav>

          {visible.length === 0 ? (
            <Panel>
              <EmptyState
                compact
                title="Nothing in this view"
                description="No listing currently has that status."
              />
            </Panel>
          ) : (
            <div className="flex flex-col gap-3">
              {visible.map((ad) => {
                const badge = AD_STATUS_BADGE[ad.status];
                return (
                  <article
                    key={ad.id}
                    className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5 transition-shadow duration-200 hover:shadow-md sm:flex-row sm:p-5"
                  >
                    <PhotoPlaceholder
                      sector={ad.sector}
                      photo={ad.photos[0]}
                      alt={ad.title}
                      className="h-40 w-full shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-32"
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
                          <span
                            aria-hidden="true"
                            className="mx-1.5 text-neutral-300"
                          >
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
                          href={`/dashboard/ads/${ad.id}/edit`}
                          className={buttonVariants({
                            variant: "outline",
                            size: "sm",
                          })}
                        >
                          Edit
                        </Link>
                        {ad.status === "LIVE" && (
                          <>
                            <Link
                              href={`/dashboard/ads/${ad.id}/boost`}
                              className={buttonVariants({
                                variant: "soft",
                                size: "sm",
                              })}
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
                              href={`/dashboard/ads/${ad.id}/stats`}
                              className={buttonVariants({
                                variant: "outline",
                                size: "sm",
                              })}
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
        </>
      )}
    </div>
  );
}
