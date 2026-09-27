export type TokenStore = {
  getToken: () => string | null;
  setToken: (token: string | null) => void;
};

function createInMemoryTokenStore(): TokenStore {
  let token: string | null = null;
  return {
    getToken: () => token,
    setToken: (next) => {
      token = next;
    },
  };
}

// In-memory until commit 70 backs this with expo-secure-store and calls
// setTokenStore once at app start. Kept as an indirection so the API client
// never needs to know how (or whether) the token is persisted to disk.
let current: TokenStore = createInMemoryTokenStore();

export function setTokenStore(store: TokenStore): void {
  current = store;
}

export function getToken(): string | null {
  return current.getToken();
}

export function setToken(token: string | null): void {
  current.setToken(token);
}
