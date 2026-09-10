"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "./client";
import type { Message } from "@/lib/messaging/types";

type ReadReceipt = { conversationId: string; readerId: string };
type WsError = { message?: string } | string;

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    createSocket()
      .then((socket) => {
        if (cancelled) {
          socket.disconnect();
          return;
        }
        socketRef.current = socket;

        const handleConnect = () => {
          setConnected(true);
          socket.emit("conversation:join", { conversationId });
        };
        const handleDisconnect = () => setConnected(false);
        const handleNewMessage = (message: Message) => {
          if (message.conversationId !== conversationId) return;
          setMessages((prev) =>
            prev.some((existing) => existing.id === message.id)
              ? prev
              : [...prev, message],
          );
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
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't connect to live chat.");
      });

    return () => {
      cancelled = true;
      const socket = socketRef.current;
      if (socket) {
        socket.emit("conversation:leave", { conversationId });
        socket.disconnect();
      }
      socketRef.current = null;
    };
  }, [conversationId, currentUserId]);

  const sendMessage = useCallback(
    (body: string) => {
      const socket = socketRef.current;
      if (!socket) return;
      setSending(true);
      setError(null);
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
    },
    [conversationId],
  );

  return { messages, connected, sending, error, sendMessage };
}
