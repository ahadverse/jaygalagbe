import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState } from 'react-native';
import type { Socket } from 'socket.io-client';

import {
  createSocket,
  SOCKET_DISABLED,
  trackSocketFallback,
} from '../../api/socket';
import { useAppActive } from '../../lib/use-app-active';
import { useAuth } from '../auth/auth-context';
import { getUnreadCount } from '../messaging/api';
import type { NotificationEntry, NotificationPayload } from './types';

// Mirrors web's realtime-provider.tsx: one socket to the /notifications
// namespace per signed-in session, account-activity events kept as a capped,
// session-ephemeral list (there's no server-side history endpoint - see
// app.md's open items), message events only bump an unread counter here
// since the Messages tab owns the actual conversation data.
const MAX_ENTRIES = 10;
// Unread-badge poll period while the socket is unavailable.
const UNREAD_POLL_MS = 15000;

type NotificationsContextValue = {
  activity: NotificationEntry[];
  unreadActivity: number;
  markActivitySeen: () => void;
  unreadMessages: number;
  markMessagesSeen: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const [activity, setActivity] = useState<NotificationEntry[]>([]);
  const [unreadActivity, setUnreadActivity] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const stopTrackingRef = useRef<(() => void) | null>(null);
  const [socketFallback, setSocketFallback] = useState(false);
  const appActive = useAppActive();
  const polling = SOCKET_DISABLED || socketFallback;

  const refreshUnread = useCallback(() => {
    void getUnreadCount()
      .then((count) => setUnreadMessages(count.messages))
      .catch(() => undefined);
  }, []);

  const markActivitySeen = useCallback(() => setUnreadActivity(0), []);
  const markMessagesSeen = useCallback(() => setUnreadMessages(0), []);

  useEffect(() => {
    // No socket while logged out - the stale state left behind from a
    // previous session is masked in `value` below rather than reset here,
    // so this effect never needs to setState synchronously in its own body.
    if (!user) return;

    let disposed = false;

    function connect() {
      if (SOCKET_DISABLED) return;
      const socket = createSocket('/notifications');
      socketRef.current = socket;
      stopTrackingRef.current?.();
      stopTrackingRef.current = trackSocketFallback(socket, (fallback) => {
        setSocketFallback(fallback);
        // Socket is back: one refetch closes any gap left while polling.
        if (!fallback) refreshUnread();
      });
      socket.on('notification', (payload: NotificationPayload) => {
        if (payload.type === 'message.received') {
          setUnreadMessages((count) => count + 1);
          return;
        }
        const entry: NotificationEntry = {
          ...payload,
          id: `${Date.now()}-${Math.random()}`,
          receivedAt: Date.now(),
        };
        setActivity((entries) => [entry, ...entries].slice(0, MAX_ENTRIES));
        setUnreadActivity((count) => count + 1);
      });
    }

    connect();
    void getUnreadCount().then((count) => {
      if (!disposed) setUnreadMessages(count.messages);
    });

    // Reconnect on foreground, disconnect on background - per app.md's
    // cross-cutting architecture note for the real-time layer.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        if (!socketRef.current?.connected) connect();
      } else {
        stopTrackingRef.current?.();
        stopTrackingRef.current = null;
        socketRef.current?.disconnect();
        socketRef.current = null;
      }
    });

    return () => {
      disposed = true;
      subscription.remove();
      stopTrackingRef.current?.();
      stopTrackingRef.current = null;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user, refreshUnread]);

  // Fallback mode: poll the unread count while signed in and foregrounded.
  useEffect(() => {
    if (!user || !polling || !appActive) return;
    const timer = setInterval(refreshUnread, UNREAD_POLL_MS);
    return () => clearInterval(timer);
  }, [user, polling, appActive, refreshUnread]);

  const value = useMemo(
    () =>
      user
        ? {
            activity,
            unreadActivity,
            markActivitySeen,
            unreadMessages,
            markMessagesSeen,
          }
        : {
            activity: [],
            unreadActivity: 0,
            markActivitySeen,
            unreadMessages: 0,
            markMessagesSeen,
          },
    [
      user,
      activity,
      unreadActivity,
      markActivitySeen,
      unreadMessages,
      markMessagesSeen,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationsProvider',
    );
  }
  return context;
}
