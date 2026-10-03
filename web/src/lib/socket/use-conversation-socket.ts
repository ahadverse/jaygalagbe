"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket, SOCKET_DISABLED, watchSocket } from "./client";
import { usePolling } from "./use-polling";
import type { Message } from "@/lib/messaging/types";

type ReadReceipt = { conversationId: string; readerId: string };
type WsError = { message?: string } | string;

const POLL_MS = 3000;

/**
 * Folds `incoming` into `prev` by id. Returns `prev` itself when nothing
 * changed, so a quiet poll causes no re-render and no flicker.
 */
function mergeMessages(prev: Message[], incoming: Message[]): Message[] {
  const byId = new Map(prev.map((message) => [message.id, message]));
  let changed = false;

  for (const message of incoming) {
    const existing = byId.get(message.id);
    if (!existing) {
      byId.set(message.id, message);
      changed = true;
    } else if (!existing.readAt && message.readAt) {
      byId.set(message.id, { ...existing, readAt: message.readAt });
      changed = true;
    }
  }
  if (!changed) return prev;

  return [...byId.values()].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function useConversationSocket({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [connected, setConnected] = useState(false);
  const [socketDown, setSocketDown] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const polling = SOCKET_DISABLED || (socketDown && !connected);
  const messagesUrl = `/api/conversations/${encodeURIComponent(conversationId)}/messages`;

  /** Pulls the thread over HTTP, merges it, and marks it read like the socket does. */
  const refetch = useCallback(async () => {
    const response = await fetch(messagesUrl, { cache: "no-store" });
    if (!response.ok) return;
    const incoming = (await response.json()) as Message[];
    setMessages((prev) => mergeMessages(prev, incoming));
    if (incoming.some((m) => m.senderId !== currentUserId && !m.readAt)) {
      await fetch(messagesUrl, { method: "PATCH" }).catch(() => {});
    }
  }, [messagesUrl, currentUserId]);

  usePolling(refetch, POLL_MS, polling);

  useEffect(() => {
    if (SOCKET_DISABLED) return;
    let cancelled = false;
    let stopWatching: (() => void) | undefined;

    createSocket()
      .then((socket) => {
        if (cancelled) {
          socket.disconnect();
          return;
        }
        socketRef.current = socket;

        const handleConnect = () => {
          setConnected(true);
          setSocketDown(false);
          socket.emit("conversation:join", { conversationId });
          // Close any gap left by time spent on the polling fallback.
          void refetch().catch(() => {});
        };
        const handleDisconnect = () => setConnected(false);
        const handleNewMessage = (message: Message) => {
          if (message.conversationId !== conversationId) return;
          setMessages((prev) => mergeMessages(prev, [message]));
          if (message.senderId !== currentUserId) {
            socket.emit("message:read", { conversationId });
          }
        };
        const handleRead = ({ conversationId: readId, readerId }: ReadReceipt) => {
          if (readId !== conversationId || readerId === currentUserId) return;
          setMessages((prev) =>
            prev.map((message) =>
              message.senderId === currentUserId && !message.readAt
                ? { ...message, readAt: new Date().toISOString() }
                : message,
            ),
          );
        };
        const handleException = (err: WsError) => {
          setSending(false);
          setError(typeof err === "string" ? err : (err?.message ?? "Something went wrong."));
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("message:new", handleNewMessage);
        socket.on("message:read", handleRead);
        socket.on("exception", handleException);

        stopWatching = watchSocket(socket, {
          onUp: () => {},
          onDown: () => setSocketDown(true),
        });
      })
      .catch(() => {
        if (!cancelled) setSocketDown(true);
      });

    return () => {
      cancelled = true;
      stopWatching?.();
      const socket = socketRef.current;
      if (socket) {
        socket.emit("conversation:leave", { conversationId });
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [conversationId, currentUserId, refetch]);

  const sendMessage = useCallback(
    (body: string) => {
      setSending(true);
      setError(null);

      const socket = socketRef.current;
      if (socket?.connected) {
        socket.emit(
          "message:send",
          { conversationId, body },
          (response: (Message & { error?: undefined }) | { error: string } | undefined) => {
            setSending(false);
            if (response && "error" in response && response.error) {
              setError(response.error);
            }
          },
        );
        return;
      }

      // Socket is not up: send over REST instead.
      fetch(messagesUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = (await response.json().catch(() => null)) as {
              message?: string | string[];
              error?: string;
            } | null;
            const detail = Array.isArray(data?.message)
              ? data.message[0]
              : (data?.message ?? data?.error);
            setError(detail ?? "Couldn't send the message.");
            return;
          }
          const message = (await response.json()) as Message;
          setMessages((prev) => mergeMessages(prev, [message]));
        })
        .catch(() => setError("Couldn't reach the server. Please try again."))
        .finally(() => setSending(false));
    },
    [conversationId, messagesUrl],
  );

  /** A transport that can send right now: the socket, or the REST fallback. */
  const ready = connected || polling;

  return { messages, connected, polling, ready, sending, error, sendMessage };
}
