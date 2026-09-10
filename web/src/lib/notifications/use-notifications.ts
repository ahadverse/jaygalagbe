"use client";

import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket/client";
import { useToast } from "@/lib/toast/toast-context";
import { formatNotification, type FormattedNotification } from "./format";
import type { AppNotification } from "./types";

export type NotificationEntry = FormattedNotification & { id: string; receivedAt: number };

export function useNotifications(enabled: boolean) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<NotificationEntry[]>([]);
  const [unread, setUnread] = useState(0);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    createSocket("/notifications")
      .then((socket) => {
        if (cancelled) {
          socket.disconnect();
          return;
        }
        socketRef.current = socket;
        socket.on("notification", (payload: AppNotification) => {
          const formatted = formatNotification(payload);
          setEntries((prev) =>
            [{ ...formatted, id: crypto.randomUUID(), receivedAt: Date.now() }, ...prev].slice(
              0,
              10,
            ),
          );
          setUnread((count) => count + 1);
          toast(formatted);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [enabled, toast]);

  function clearUnread() {
    setUnread(0);
  }

  return { entries, unread, clearUnread };
}
