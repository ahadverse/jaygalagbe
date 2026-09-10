"use client";

import { useEffect, useRef, type FormEvent } from "react";
import { Button, Textarea } from "@/components/ui";
import { useConversationSocket } from "@/lib/socket/use-conversation-socket";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/messaging/types";

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
      <div
        ref={listRef}
        className="flex max-h-[60vh] min-h-64 flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-border p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={cn(
                  "flex max-w-[80%] flex-col gap-0.5 rounded-lg px-3 py-2 text-sm",
                  mine
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-muted text-foreground",
                )}
              >
                <span>{message.body}</span>
                {mine && (
                  <span className="self-end text-[10px] opacity-70">
                    {message.readAt ? "Seen" : "Sent"}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          name="body"
          placeholder={connected ? "Write a message..." : "Connecting…"}
          required
          minLength={1}
          maxLength={2000}
          disabled={!connected}
        />
        {error && <p className="text-sm text-danger-600">{error}</p>}
        <Button type="submit" disabled={!connected || sending}>
          {connected ? (sending ? "Sending…" : "Send") : "Connecting…"}
        </Button>
      </form>
    </div>
  );
}
