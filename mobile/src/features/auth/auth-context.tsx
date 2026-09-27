import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { onUnauthorized } from '../../api/client';
import {
  hydrateTokenStore,
  secureTokenStore,
} from '../../api/secure-token-store';
import { setToken, setTokenStore } from '../../api/token-store';
import { clearPushToken, registerPushToken } from '../notifications/push';
import {
  getCurrentUser,
  login as loginRequest,
  register as registerRequest,
} from './api';
import type { LoginInput, RegisterInput } from './api';
import type { User } from './types';

// Swap in the Keystore/Keychain-backed store once, at module load, in place
// of api/token-store's in-memory default.
setTokenStore(secureTokenStore);

type AuthContextValue = {
  user: User | null;
  /** True until the app-boot session restore below has finished. */
  isRestoring: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  /** Updates the in-memory user after a profile edit, without a re-fetch. */
  setUser: (user: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const logout = useCallback(() => {
    // Must fire before the token is cleared - the endpoint requires auth.
    void clearPushToken();
    setToken(null);
    setUser(null);
  }, []);

  // Restore a persisted session once at app boot: if a token was saved from
  // a previous launch, re-fetch the profile to confirm it's still valid
  // (the JWT has no refresh mechanism, so this can fail if it's expired -
  // that's fine, the user just ends up logged out for this run).
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await hydrateTokenStore();
      if (!token) {
        if (!cancelled) setIsRestoring(false);
        return;
      }
      try {
        const restoredUser = await getCurrentUser();
        if (!cancelled) {
          setUser(restoredUser);
          void registerPushToken();
        }
      } catch {
        // api/client's onUnauthorized (below) already clears an expired
        // token on a 401; any other failure just leaves the app logged out.
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // A 401 on any request (not just login) means the session is dead -
  // whoever is signed in gets logged out reactively, wherever they are.
  useEffect(() => onUnauthorized(logout), [logout]);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    setToken(response.accessToken);
    setUser(response.user);
    void registerPushToken();
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await registerRequest(input);
    setToken(response.accessToken);
    setUser(response.user);
    void registerPushToken();
  }, []);

  const value = useMemo(
    () => ({ user, isRestoring, login, register, logout, setUser }),
    [user, isRestoring, login, register, logout, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
