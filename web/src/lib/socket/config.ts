export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:5000";

/**
 * Set NEXT_PUBLIC_DISABLE_SOCKET=true where the API cannot hold a WebSocket
 * open (serverless hosting). Chat then runs on HTTP polling alone.
 */
export const SOCKET_DISABLED =
  process.env.NEXT_PUBLIC_DISABLE_SOCKET === "true";
