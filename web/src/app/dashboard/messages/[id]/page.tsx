import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchConversation, fetchMessages } from "@/lib/messaging/fetch-conversations";
import { ChatThread } from "@/components/messaging/chat-thread";

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

      <ChatThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={messages}
      />
    </main>
  );
}
