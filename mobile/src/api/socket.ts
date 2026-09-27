import { io, type Socket } from 'socket.io-client';

import { API_URL } from './config';
import { getToken } from './token-store';

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
