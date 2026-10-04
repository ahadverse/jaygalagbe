"use client";

import { io, type Socket } from "socket.io-client";
import { SOCKET_DISABLED, WS_URL } from "./config";

export { SOCKET_DISABLED };

async function fetchSocketToken(): Promise<string> {
  const response = await fetch("/api/auth/socket-token");
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function createSocket(namespace = ""): Promise<Socket> {
  const token = await fetchSocketToken();
  return io(`${WS_URL}${namespace}`, {
    auth: { token },
    transports: ["websocket"],
  });
}

/**
 * Reports whether the socket is usable. `onDown` fires when a connection
 * attempt fails or an open one drops; `onUp` when it (re)connects. Returns a
 * function that stops listening.
 */
export function watchSocket(
  socket: Socket,
  { onUp, onDown }: { onUp: () => void; onDown: () => void },
): () => void {
  socket.on("connect", onUp);
  socket.on("connect_error", onDown);
  socket.on("disconnect", onDown);
  return () => {
    socket.off("connect", onUp);
    socket.off("connect_error", onDown);
    socket.off("disconnect", onDown);
  };
}
