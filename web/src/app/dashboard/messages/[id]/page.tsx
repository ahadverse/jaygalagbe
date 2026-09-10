import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchConversation, fetchMessages } from "@/lib/messaging/fetch-conversations";
import { ReplyForm } from "@/components/messaging/reply-form";
import { cn } from "@/lib/utils";

export default async function ConversationPage({
  params,
}: PageProps<"/dashboard/messages/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const token = (await getToken())!;

  const conversation = await fetchConversation(id, token);
  if (
    !conversation ||
    (conversation.customerId !== user.id && conversation.advertiserId !== user.id)
  ) {
    notFound();
  }

  const messages = await fetchMessages(id, token);
  const otherParty =
    conversation.customerId === user.id
      ? conversation.advertiser
      : conversation.customer;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-xl font-bold text-foreground">{otherParty.name}</h1>
        <p className="text-sm text-muted-foreground">{conversation.ad.title}</p>
      </div>

      <div className="flex flex-1 flex-col gap-3 rounded-xl border border-border p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === user.id;
            return (
              <div
                key={message.id}
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  mine
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-muted text-foreground",
                )}
              >
                {message.body}
              </div>
            );
          })
        )}
      </div>

      <ReplyForm conversationId={conversation.id} />
    </main>
  );
}
