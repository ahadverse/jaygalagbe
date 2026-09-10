import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyConversations } from "@/lib/messaging/fetch-conversations";
import { fetchAdvertiserReviews } from "@/lib/reviews/fetch-advertiser-reviews";
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
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">
          Your saved ads, messages, and reviews.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Saved ads</h2>
        <SavedAdsSection />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        {myConversations.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Messages you send to advertisers will show up here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {myConversations.map((conversation) => {
              const lastMessage = conversation.messages?.[0];
              return (
                <Link
                  key={conversation.id}
                  href={`/dashboard/messages/${conversation.id}`}
                  className="flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-primary"
                >
                  <p className="font-medium text-foreground">
                    {conversation.advertiser.name} — {conversation.ad.title}
                  </p>
                  {lastMessage && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {lastMessage.body}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
        {advertisers.length === 0 ? (
          <p className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
            Contact an advertiser to leave them a review.
          </p>
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
