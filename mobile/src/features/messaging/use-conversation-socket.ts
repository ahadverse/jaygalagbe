import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import { createSocket } from '../../api/socket';
import type { Message } from './types';

type SendAck = Message | { error: string };

// Mirrors web/src/lib/socket/use-conversation-socket.ts: a chat thread opens
// its own socket on the default namespace (separate from the notifications
// socket), joins the conversation's room, and sends over the socket rather
// than the REST endpoint while the thread is open.
export function useConversationSocket(
  conversationId: string,
  onMessage: (message: Message) => void,
  onRead: (readerId: string) => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const handlers = useRef({ onMessage, onRead });

  // Keeps the "latest callback" ref in sync without mutating it during
  // render - the socket listeners below always read handlers.current, so
  // this only needs to run after each commit, not synchronously.
  useEffect(() => {
    handlers.current = { onMessage, onRead };
  });

  useEffect(() => {
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

    return () => {
      socket.emit('conversation:leave', { conversationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId]);

  const sendMessage = useCallback(
    (body: string): Promise<Message> => {
      return new Promise((resolve, reject) => {
        const socket = socketRef.current;
        if (!socket) {
          reject(new Error('Not connected'));
          return;
        }
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
    socketRef.current?.emit('message:read', { conversationId });
  }, [conversationId]);

  return { connected, sendMessage, markRead };
}
