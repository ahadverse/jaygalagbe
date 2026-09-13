import type { Metadata } from "next";
import { EmptyState } from "@/components/ui";
import { ConversationCard } from "@/components/messaging/conversation-card";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyConversations } from "@/lib/messaging/fetch-conversations";

export const metadata: Metadata = {
  title: "Messages | Jayga Lagbe",
};

export default async function AdvertiserMessagesPage() {
  const user = await requireUser();
  const token = (await getToken())!;

  const allConversations = await fetchMyConversations(token);
  const conversations = allConversations.filter(
    (conversation) => conversation.advertiserId === user.id,
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-title text-neutral-900">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Conversations from customers interested in your listings.
        </p>
      </header>

      {conversations.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="When a customer contacts you about one of your listings, the conversation shows up here."
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
          {conversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              href={`/dashboard/messages/${conversation.id}`}
              name={conversation.customer.name}
              adTitle={conversation.ad.title}
              preview={conversation.messages?.[0]?.body}
            />
          ))}
        </div>
      )}
    </main>
  );
}
