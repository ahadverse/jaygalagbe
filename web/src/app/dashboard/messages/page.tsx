import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, buttonVariants } from "@/components/ui";
import { ConversationCard } from "@/components/messaging/conversation-card";
import { PageTitle } from "@/components/dashboard/page-title";
import { Panel, PanelNote } from "@/components/dashboard/panel";
import { requireUser } from "@/lib/auth/require-user";
import { getToken } from "@/lib/auth/session";
import { fetchMyConversations } from "@/lib/messaging/fetch-conversations";
import type { Conversation } from "@/lib/messaging/types";
import { cn, firstSearchParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Messages | Jayga Lagbe",
};

type View = "all" | "received" | "sent";

const VIEWS: { value: View; label: string }[] = [
  { value: "all", label: "All" },
  { value: "received", label: "About your listings" },
  { value: "sent", label: "Your enquiries" },
];

function MailIcon() {
  return (
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
  );
}

export default async function MessagesPage({
  searchParams,
}: PageProps<"/dashboard/messages">) {
  const user = await requireUser();
  const token = (await getToken())!;
  const conversations = await fetchMyConversations(token);

  const resolved = await searchParams;
  const requested = firstSearchParam(resolved?.view) as View | undefined;
  const view: View = VIEWS.some((candidate) => candidate.value === requested)
    ? requested!
    : "all";

  // One inbox, two sides of the same marketplace: threads about listings you
  // posted, and threads about listings you enquired about.
  const received = conversations.filter(
    (conversation) => conversation.advertiserId === user.id,
  );
  const sent = conversations.filter(
    (conversation) => conversation.customerId === user.id,
  );

  const unreadIn = (items: Conversation[]) =>
    items.filter((conversation) => {
      const last = conversation.messages?.[0];
      return last && last.senderId !== user.id && !last.readAt;
    }).length;

  const groups = [
    {
      key: "received" as const,
      title: "About your listings",
      description: "People who contacted you about something you posted.",
      empty: "Nobody has messaged you about a listing yet.",
      items: received,
      side: "customer" as const,
    },
    {
      key: "sent" as const,
      title: "Your enquiries",
      description: "Owners you reached out to about their listings.",
      empty: "You have not contacted an owner yet.",
      items: sent,
      side: "advertiser" as const,
    },
  ];

  const visible = groups.filter(
    (group) => view === "all" || view === group.key,
  );

  const counts: Record<View, number> = {
    all: conversations.length,
    received: received.length,
    sent: sent.length,
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Messages"
        description="Every conversation you are part of, on either side of a listing."
      />

      {conversations.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="When someone contacts you about a listing — or you contact an owner — the conversation shows up here."
          action={
            <Link
              href="/jayga-jomi"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Browse listings
            </Link>
          }
          icon={<MailIcon />}
        />
      ) : (
        <>
          <nav
            aria-label="Filter conversations"
            className="flex flex-wrap gap-2"
          >
            {VIEWS.map((candidate) => (
              <Link
                key={candidate.value}
                href={
                  candidate.value === "all"
                    ? "/dashboard/messages"
                    : `/dashboard/messages?view=${candidate.value}`
                }
                aria-current={view === candidate.value ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150",
                  view === candidate.value
                    ? "bg-neutral-900 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground",
                )}
              >
                {candidate.label}
                <span className="numeric ml-1.5 opacity-60">
                  {counts[candidate.value]}
                </span>
              </Link>
            ))}
          </nav>

          {visible.map((group) => {
            const unread = unreadIn(group.items);
            return (
              <Panel
                key={group.key}
                title={group.title}
                description={group.description}
                action={
                  unread > 0 ? (
                    <span className="rounded-full bg-accent-50 px-2 py-0.5 text-2xs font-semibold text-accent-700">
                      {unread} unread
                    </span>
                  ) : undefined
                }
                bodyClassName="flex flex-col gap-2 p-3 sm:p-3"
              >
                {group.items.length === 0 ? (
                  <PanelNote>{group.empty}</PanelNote>
                ) : (
                  group.items.map((conversation) => {
                    const last = conversation.messages?.[0];
                    return (
                      <ConversationCard
                        key={conversation.id}
                        href={`/dashboard/messages/${conversation.id}`}
                        name={conversation[group.side].name}
                        adTitle={conversation.ad.title}
                        preview={last?.body}
                        unread={Boolean(
                          last && last.senderId !== user.id && !last.readAt,
                        )}
                      />
                    );
                  })
                )}
              </Panel>
            );
          })}
        </>
      )}
    </div>
  );
}
