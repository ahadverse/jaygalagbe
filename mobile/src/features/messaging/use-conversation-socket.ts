import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import {
  createSocket,
  SOCKET_DISABLED,
  trackSocketFallback,
} from '../../api/socket';
import { markConversationRead, sendMessageRest } from './api';
import type { Message } from './types';

type SendAck = Message | { error: string };

// Mirrors web/src/lib/socket/use-conversation-socket.ts: a chat thread opens
// its own socket on the default namespace (separate from the notifications
// socket), joins the conversation's room, and sends over the socket while it
// is connected. When the socket cannot connect (or is disabled) sending and
// mark-read go over REST, and `fallback` tells the screen to poll instead.
export function useConversationSocket(
  conversationId: string,
  onMessage: (message: Message) => void,
  onRead: (readerId: string) => void,
  /** Fired when the socket connects again after a fallback period. */
  onResync?: () => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketFallback, setSocketFallback] = useState(false);
  const handlers = useRef({ onMessage, onRead, onResync });

  // Keeps the "latest callback" ref in sync without mutating it during
  // render - the socket listeners below always read handlers.current, so
  // this only needs to run after each commit, not synchronously.
  useEffect(() => {
    handlers.current = { onMessage, onRead, onResync };
  });

  useEffect(() => {
    if (SOCKET_DISABLED) return;
    const socket = createSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('conversation:join', { conversationId });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('message:new', (message: Message) => {
      if (message.conversationId === conversationId) {
        handlers.current.onMessage(message);
      }
    });
    socket.on(
      'message:read',
      (payload: { conversationId: string; readerId: string }) => {
        if (payload.conversationId === conversationId) {
          handlers.current.onRead(payload.readerId);
        }
      },
    );
    const stopTracking = trackSocketFallback(socket, (fallback) => {
      setSocketFallback(fallback);
      if (!fallback) handlers.current.onResync?.();
    });

    return () => {
      stopTracking();
      socket.emit('conversation:leave', { conversationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    (body: string): Promise<Message> => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        return sendMessageRest(conversationId, body);
      }
      return new Promise((resolve, reject) => {
        socket.emit(
          'message:send',
          { conversationId, body },
          (ack: SendAck) => {
            if (ack && 'error' in ack) {
              reject(new Error(ack.error));
            } else {
              resolve(ack);
            }
          },
        );
      });
    },
    [conversationId],
  );

  const markRead = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('message:read', { conversationId });
    } else {
      void markConversationRead(conversationId).catch(() => undefined);
    }
  }, [conversationId]);

  return {
    connected,
    fallback: SOCKET_DISABLED || socketFallback,
    sendMessage,
    markRead,
  };
}
