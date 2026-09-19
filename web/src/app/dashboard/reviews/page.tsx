import type { Metadata } from "next";
import { EmptyState } from "@/components/ui";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel, PanelNote } from "@/components/dashboard/panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardIcon } from "@/components/dashboard/icons";
import { ReviewForm } from "@/components/reviews/review-form";
import { StarRating } from "@/components/reviews/star-rating";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyConversations } from "@/lib/messaging/fetch-conversations";
import { fetchAdvertiserReviewsBatch } from "@/lib/reviews/fetch-advertiser-reviews-batch";
import { formatRelativeTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "Reviews | Jayga Lagbe",
};

export default async function ReviewsPage() {
  const user = await requireUser();
  const token = (await getToken())!;
  const conversations = await fetchMyConversations(token);

  // You can review anyone whose listing you enquired about.
  const reviewable = [
    ...new Map(
      conversations
        .filter((conversation) => conversation.customerId === user.id)
        .map((conversation) => [
          conversation.advertiserId,
          conversation.advertiser,
        ]),
    ).values(),
  ];

  const reviewsById = await fetchAdvertiserReviewsBatch([
    ...reviewable.map((party) => party.id),
    user.id,
  ]);

  const received = reviewsById[user.id];
  const receivedCount = received?.reviewCount ?? 0;
  const averageRating = received?.averageRating ?? 0;
  const writtenCount = reviewable.filter((party) =>
    reviewsById[party.id]?.reviews.some(
      (review) => review.customerId === user.id,
    ),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Reviews"
        description="What people said about you, and the owners you can rate."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          label="Your rating"
          value={receivedCount > 0 ? averageRating.toFixed(1) : "—"}
          hint={
            receivedCount > 0
              ? `From ${receivedCount} review${receivedCount === 1 ? "" : "s"}`
              : "No reviews yet"
          }
          tone="success"
          icon={<DashboardIcon name="star" />}
        />
        <StatCard
          label="Reviews received"
          value={receivedCount.toLocaleString()}
          hint="Across all your listings"
        />
        <StatCard
          label="Reviews written"
          value={writtenCount.toLocaleString()}
          hint={`${reviewable.length} owner${reviewable.length === 1 ? "" : "s"} you can rate`}
          tone="accent"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <Panel
        title="About you"
        description="Reviews left by people who contacted you."
        bodyClassName="flex flex-col gap-3 p-4 sm:p-5"
      >
        {receivedCount === 0 || !received ? (
          <PanelNote>
            Nobody has reviewed you yet. Reviews appear once someone you have
            talked to rates the experience.
          </PanelNote>
        ) : (
          received.reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col gap-2 rounded-xl bg-muted/50 p-4"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <StarRating value={review.rating} />
                <span className="text-sm font-semibold text-foreground">
                  {review.customer.name}
                </span>
                <span className="text-2xs text-subtle-foreground">
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              )}
            </article>
          ))
        )}
      </Panel>

      <Panel
        title="Rate an owner"
        description="Anyone whose listing you have messaged about."
        bodyClassName="flex flex-col gap-4 p-4 sm:p-5"
      >
        {reviewable.length === 0 ? (
          <EmptyState
            compact
            title="Nobody to review yet"
            description="Contact an owner about a listing and you will be able to rate them here."
          />
        ) : (
          reviewable.map((party) => {
            const existing = reviewsById[party.id]?.reviews.find(
              (review) => review.customerId === user.id,
            );
            return (
              <div
                key={party.id}
                className="flex flex-col gap-3 rounded-xl bg-muted/50 p-4"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-sm font-bold text-brand-800"
                  >
                    {party.name.trim().charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate font-heading text-sm font-bold text-foreground">
                    {party.name}
                  </span>
                </div>
                <ReviewForm
                  advertiserId={party.id}
                  existingRating={existing?.rating}
                  existingComment={existing?.comment ?? undefined}
                />
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}
