import { io, type Socket } from 'socket.io-client';

import { API_URL } from './config';
import { getToken } from './token-store';

// Set EXPO_PUBLIC_DISABLE_SOCKET=true when the backend cannot hold WebSocket
// connections (e.g. Vercel serverless). The app then never opens a socket and
// relies on HTTP polling only.
export const SOCKET_DISABLED =
  process.env.EXPO_PUBLIC_DISABLE_SOCKET === 'true';

// How long a socket may stay unconnected before polling takes over.
export const FALLBACK_AFTER_MS = 4000;

// The backend serves REST and Socket.io from the same NestJS process, so the
// API's own base URL doubles as the socket URL - no separate WS_URL needed.
// Auth mirrors web/src/lib/socket/client.ts: the same JWT used for
// `Authorization: Bearer` is passed as `auth.token` at handshake time (see
// backend/src/auth/ws-auth.util.ts) - there's no separate ws-only ticket.
export function createSocket(namespace = ''): Socket {
  return io(`${API_URL}${namespace}`, {
    auth: { token: getToken() ?? undefined },
    transports: ['websocket'],
  });
}

type SocketLike = Pick<Socket, 'on' | 'off' | 'connected'>;

/**
 * Reports whether HTTP polling should stand in for the socket. Fallback turns
 * on at `connect_error`, when the socket is still not connected after
 * `afterMs`, or when it dropped and has not come back within `afterMs`; it
 * turns off the moment the socket connects. `onChange` fires only on actual
 * transitions (initial assumed state: not in fallback). Returns a disposer.
 */
export function trackSocketFallback(
  socket: SocketLike,
  onChange: (fallback: boolean) => void,
  afterMs: number = FALLBACK_AFTER_MS,
): () => void {
  let fallback = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const set = (next: boolean) => {
    if (next === fallback) return;
    fallback = next;
    onChange(next);
  };
  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  const armTimer = () => {
    clearTimer();
    timer = setTimeout(() => {
      timer = null;
      if (!socket.connected) set(true);
    }, afterMs);
  };

  const onConnect = () => {
    clearTimer();
    set(false);
  };
  const onConnectError = () => set(true);
  const onDisconnect = () => armTimer();

  socket.on('connect', onConnect);
  socket.on('connect_error', onConnectError);
  socket.on('disconnect', onDisconnect);
  if (!socket.connected) armTimer();

  return () => {
    clearTimer();
    socket.off('connect', onConnect);
    socket.off('connect_error', onConnectError);
    socket.off('disconnect', onDisconnect);
  };
}
