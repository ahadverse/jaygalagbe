"use client";

import { io, type Socket } from "socket.io-client";
import { WS_URL } from "./config";

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
