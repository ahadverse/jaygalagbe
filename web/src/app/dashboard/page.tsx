import type { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  buttonVariants,
} from "@/components/ui";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyConversations } from "@/lib/messaging/fetch-conversations";
import { fetchAdvertiserReviews } from "@/lib/reviews/fetch-advertiser-reviews";
import { ConversationCard } from "@/components/messaging/conversation-card";
import { ReviewForm } from "@/components/reviews/review-form";
import { SavedAdsSection } from "@/components/dashboard/saved-ads-section";

export const metadata: Metadata = {
  title: "Your dashboard | Jayga Lagbe",
};

export default async function DashboardPage() {
  const user = await requireUser();
  const token = (await getToken())!;

  const allConversations = await fetchMyConversations(token);
  const myConversations = allConversations.filter(
    (conversation) => conversation.customerId === user.id,
  );

  const advertisers = Array.from(
    new Map(
      myConversations.map((conversation) => [
        conversation.advertiserId,
        conversation.advertiser,
      ]),
    ).values(),
  );
  const advertiserReviews = await Promise.all(
    advertisers.map((advertiser) => fetchAdvertiserReviews(advertiser.id)),
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 font-heading text-lg font-bold text-white shadow-brand"
        >
          {user.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your saved ads, messages, and reviews.
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold tracking-tight text-neutral-900">
          Saved ads
        </h2>
        <SavedAdsSection />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold tracking-tight text-neutral-900">
          Messages
        </h2>
        {myConversations.length === 0 ? (
          <EmptyState
            compact
            title="No conversations yet"
            description="Message an advertiser from any listing and the thread will appear here."
            action={
              <Link
                href="/jayga-jomi"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Browse listings
              </Link>
            }
            icon={
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
              >
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z" />
              </svg>
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {myConversations.map((conversation) => (
              <ConversationCard
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                name={conversation.advertiser.name}
                adTitle={conversation.ad.title}
                preview={conversation.messages?.[0]?.body}
              />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-bold tracking-tight text-neutral-900">
          Reviews
        </h2>
        {advertisers.length === 0 ? (
          <EmptyState
            compact
            title="Nothing to review yet"
            description="Once you've contacted an advertiser you can rate how the conversation went."
            icon={
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
              >
                <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z" />
              </svg>
            }
          />
        ) : (
          <div className="flex flex-col gap-4">
            {advertisers.map((advertiser, index) => {
              const existing = advertiserReviews[index].reviews.find(
                (review) => review.customerId === user.id,
              );
              return (
                <Card key={advertiser.id}>
                  <CardHeader>
                    <CardTitle>{advertiser.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReviewForm
                      advertiserId={advertiser.id}
                      existingRating={existing?.rating}
                      existingComment={existing?.comment ?? undefined}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
