import * as SecureStore from 'expo-secure-store';

import type { TokenStore } from './token-store';

const STORAGE_KEY = 'jl_access_token';

// SecureStore's API is async (it's backed by iOS Keychain / Android
// Keystore), but the API client needs a synchronous read on every request.
// So this keeps an in-memory mirror as the fast path and pushes writes to
// disk in the background; hydrateTokenStore() fills the mirror once at app
// boot, before anything else asks for a token.
let cached: string | null = null;

export const secureTokenStore: TokenStore = {
  getToken: () => cached,
  setToken: (token) => {
    cached = token;
    if (token) {
      SecureStore.setItemAsync(STORAGE_KEY, token).catch(() => {
        // Best-effort: the session still works for the current app run even
        // if the write fails - worst case, the user logs in again next launch.
      });
    } else {
      SecureStore.deleteItemAsync(STORAGE_KEY).catch(() => {});
    }
  },
};

/** Reads the persisted token into the in-memory cache. Call once at app boot. */
export async function hydrateTokenStore(): Promise<string | null> {
  cached = await SecureStore.getItemAsync(STORAGE_KEY).catch(() => null);
  return cached;
}
