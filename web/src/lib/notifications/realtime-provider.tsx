"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Socket } from "socket.io-client";
import { createSocket } from "@/lib/socket/client";
import { useToast } from "@/lib/toast/toast-context";
import { formatNotification, type FormattedNotification } from "./format";
import {
  getMessageSoundServerSnapshot,
  isMessageSoundMuted,
  playMessageChime,
  setMessageSoundMuted,
  subscribeToMessageSound,
} from "./message-chime";
import type { AppNotification } from "./types";

export type NotificationEntry = FormattedNotification & {
  id: string;
  receivedAt: number;
};

export type MessageEntry = NotificationEntry & {
  conversationId: string;
  senderId: string;
};

const MAX_ENTRIES = 10;

type RealtimeValue = {
  /** Account activity only — approvals, rejections. Never messages. */
  notifications: NotificationEntry[];
  unreadNotifications: number;
  markNotificationsSeen: () => void;

  /** Chat only, with its own badge and its own sound. */
  messages: MessageEntry[];
  unreadMessages: number;
  markMessagesSeen: () => void;

  soundMuted: boolean;
  toggleSound: () => void;
};

const RealtimeContext = createContext<RealtimeValue | null>(null);

/**
 * One socket, two streams.
 *
 * Messages and account notifications used to share a bell, which meant a busy
 * conversation buried the one "your ad was rejected" that actually needed
 * acting on. They are split here at the source: the provider owns the single
 * `/notifications` connection and routes `message.received` to the message
 * badge and everything else to the notification bell.
 */
export function RealtimeProvider({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  const { toast } = useToast();
  const pathname = usePathname();

  const [notifications, setNotifications] = useState<NotificationEntry[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const soundMuted = useSyncExternalStore(
    subscribeToMessageSound,
    isMessageSoundMuted,
    getMessageSoundServerSnapshot,
  );

  const socketRef = useRef<Socket | null>(null);

  // `pathname` is mirrored into a ref so the socket handler can read the
  // current route without `pathname` becoming a dependency of the connection
  // effect — that would tear down and re-open the socket on every navigation.
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Opening a thread marks it read server-side, so the badge follows. Done as
  // a render-phase adjustment rather than an effect: it is derived from the
  // route, and an effect would paint the stale count for a frame first.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    if (pathname.startsWith("/dashboard/messages") && unreadMessages !== 0) {
      setUnreadMessages(0);
    }
  }

  // Seed the badge from the server — the socket only sees what arrives while
  // this tab is open, so a fresh load would otherwise start at zero.
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;

    fetch("/api/messages/unread-count")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { messages?: number } | null) => {
        if (!cancelled && typeof data?.messages === "number") {
          setUnreadMessages(data.messages);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  useEffect(() => {
    if (!signedIn) return;
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
          const entry = {
            ...formatted,
            id: crypto.randomUUID(),
            receivedAt: Date.now(),
          };

          if (payload.type === "message.received") {
            // Already reading this thread: it is not unread, and a chime for
            // a message you are watching arrive is just noise.
            const inThisThread =
              pathnameRef.current ===
              `/dashboard/messages/${payload.conversationId}`;

            setMessages((prev) =>
              [
                {
                  ...entry,
                  conversationId: payload.conversationId,
                  senderId: payload.senderId,
                },
                ...prev,
              ].slice(0, MAX_ENTRIES),
            );

            if (!inThisThread) {
              setUnreadMessages((count) => count + 1);
              if (!isMessageSoundMuted()) playMessageChime();
              toast(formatted);
            }
            return;
          }

          setNotifications((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
          setUnreadNotifications((count) => count + 1);
          toast(formatted);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [signedIn, toast]);

  const markNotificationsSeen = useCallback(
    () => setUnreadNotifications(0),
    [],
  );
  const markMessagesSeen = useCallback(() => setUnreadMessages(0), []);

  const toggleSound = useCallback(
    () => setMessageSoundMuted(!isMessageSoundMuted()),
    [],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadNotifications,
      markNotificationsSeen,
      messages,
      unreadMessages,
      markMessagesSeen,
      soundMuted,
      toggleSound,
    }),
    [
      notifications,
      unreadNotifications,
      markNotificationsSeen,
      messages,
      unreadMessages,
      markMessagesSeen,
      soundMuted,
      toggleSound,
    ],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
