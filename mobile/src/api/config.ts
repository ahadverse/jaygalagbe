import { Platform } from 'react-native';

// The Android emulator can't reach the host machine via `localhost` - that
// address resolves to the emulator's own loopback interface, not the host's.
// `10.0.2.2` is the alias Android's emulator provides for the host's
// localhost. A physical device needs the host's real LAN IP instead, set via
// EXPO_PUBLIC_API_URL in a local .env file (not committed).
//
// Other EXPO_PUBLIC_ settings:
// - EXPO_PUBLIC_DISABLE_SOCKET=true: never open a Socket.IO connection (for
//   backends that can't hold WebSockets, e.g. Vercel serverless). Chat and the
//   unread badge then run on HTTP polling only. When unset, Socket.IO is used
//   and polling only kicks in if the socket can't connect (see socket.ts).
const DEV_FALLBACK =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';

function resolveApiUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_URL;
  if (configured) return configured;

  if (__DEV__) return DEV_FALLBACK;

  throw new Error(
    'EXPO_PUBLIC_API_URL must be set for a non-development build - refusing to fall back to a dev URL in production.',
  );
}

export const API_URL = resolveApiUrl();
