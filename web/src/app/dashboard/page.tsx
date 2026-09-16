import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { DashboardSection } from "@/components/dashboard/dashboard-section";
import { CustomerStatsRow } from "@/components/dashboard/customer-stats-row";
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-10 sm:px-8 sm:py-14">
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

      <CustomerStatsRow
        conversationCount={myConversations.length}
        advertiserCount={advertisers.length}
      />

      <DashboardSection title="Saved ads">
        <SavedAdsSection />
      </DashboardSection>

      {myConversations.length > 0 && (
        <DashboardSection title="Messages">
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
        </DashboardSection>
      )}

      {advertisers.length > 0 && (
        <DashboardSection title="Reviews">
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
        </DashboardSection>
      )}
    </main>
  );
}
