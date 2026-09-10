import type { Metadata } from "next";
import Link from "next/link";
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
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground">
          Conversations from interested customers.
        </p>
      </div>

      {conversations.length === 0 ? (
        <p className="rounded-lg border border-border bg-muted p-6 text-center text-muted-foreground">
          Messages from customers will show up here.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => {
            const lastMessage = conversation.messages?.[0];
            return (
              <Link
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                className="flex flex-col gap-1 rounded-lg border border-border p-4 transition-colors hover:border-primary"
              >
                <p className="font-medium text-foreground">
                  {conversation.customer.name} — {conversation.ad.title}
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
    </main>
  );
}
