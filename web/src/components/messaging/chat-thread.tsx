"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { Alert, Button } from "@/components/ui";
import { useConversationSocket } from "@/lib/socket/use-conversation-socket";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/messaging/types";

function ConnectionDot({ connected }: { connected: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-2xs font-medium text-muted-foreground">
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 rounded-full",
          connected ? "bg-success-500" : "bg-warning-500",
        )}
      />
      {connected ? "Live" : "Connecting…"}
    </span>
  );
}

export function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const { messages, connected, sending, error, sendMessage } = useConversationSocket({
    conversationId,
    currentUserId,
    initialMessages,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = String(new FormData(event.currentTarget).get("body") ?? "").trim();
    if (!body) return;
    sendMessage(body);
    formRef.current?.reset();
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="eyebrow text-subtle-foreground">Conversation</span>
        <ConnectionDot connected={connected} />
      </div>

      <div
        ref={listRef}
        className="flex max-h-[60vh] min-h-72 flex-1 flex-col gap-2.5 overflow-y-auto rounded-2xl bg-muted/60 p-4 ring-1 ring-neutral-900/5"
      >
        {messages.length === 0 ? (
          <div className="m-auto flex flex-col items-center gap-2 text-center">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-card text-brand-600 shadow-xs">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinejoin="round"
              >
                <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z" />
              </svg>
            </span>
            <p className="text-sm font-medium text-foreground">
              No messages yet
            </p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Say hello and ask whatever you need to know about the property.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[85%] animate-fade-in flex-col gap-1 px-3.5 py-2.5 text-sm shadow-xs sm:max-w-[75%]",
                  mine
                    ? "self-end rounded-2xl rounded-br-md bg-primary text-primary-foreground"
                    : "self-start rounded-2xl rounded-bl-md bg-card text-foreground ring-1 ring-neutral-900/5",
                )}
              >
                <span className="whitespace-pre-line break-words leading-relaxed">
                  {message.body}
                </span>
                <span
                  className={cn(
                    "self-end text-2xs",
                    mine ? "text-brand-100/80" : "text-subtle-foreground",
                  )}
                >
                  {/* Local-time render differs from the server's; the clock
                   * is cosmetic, so let the client value win. */}
                  <time dateTime={message.createdAt} suppressHydrationWarning>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                  {mine && ` · ${message.readAt ? "Seen" : "Sent"}`}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
        {error && <Alert>{error}</Alert>}
        <div className="flex items-end gap-2 rounded-2xl bg-card p-2 shadow-sm ring-1 ring-neutral-900/5">
          <textarea
            name="body"
            placeholder={connected ? "Write a message…" : "Connecting…"}
            required
            minLength={1}
            maxLength={2000}
            rows={1}
            disabled={!connected}
            aria-label="Message"
            className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-2.5 py-2.5 text-sm text-foreground placeholder:text-subtle-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!connected}
            loading={sending}
            aria-label="Send message"
          >
            {!sending && (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-[1.125rem]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4.5 12 20 4.5 15.5 20l-3.8-5.7L4.5 12Z" />
              </svg>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
