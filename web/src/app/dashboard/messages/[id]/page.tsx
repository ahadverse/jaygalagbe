import Link from "next/link";
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex items-center gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-base font-bold text-brand-800"
        >
          {otherParty.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col">
          <h1 className="truncate font-heading text-xl font-bold tracking-tight text-neutral-900">
            {otherParty.name}
          </h1>
          <Link
            href={`/ads/${conversation.ad.id}`}
            className="truncate text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {conversation.ad.title}
          </Link>
        </div>
      </header>

      <ChatThread
        conversationId={conversation.id}
        currentUserId={user.id}
        initialMessages={messages}
      />
    </main>
  );
}
