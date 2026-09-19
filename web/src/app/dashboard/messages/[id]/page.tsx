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
  const isEnquiry = conversation.customerId === user.id;
  const otherParty = isEnquiry
    ? conversation.advertiser
    : conversation.customer;

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <header className="flex items-center gap-3.5">
        <Link
          href="/dashboard/messages"
          aria-label="Back to messages"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 6-6 6 6 6" />
          </svg>
        </Link>
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-base font-bold text-brand-800"
        >
          {otherParty.name.trim().charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-heading text-lg font-bold tracking-tight text-neutral-900 sm:text-xl">
              {otherParty.name}
            </h1>
            {/* Which side of the listing you are on in this thread. */}
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-2xs font-semibold text-muted-foreground">
              {isEnquiry ? "Your enquiry" : "About your listing"}
            </span>
          </div>
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
    </div>
  );
}
