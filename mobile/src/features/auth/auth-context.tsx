import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { setToken } from '../../api/token-store';
import { login as loginRequest, register as registerRequest } from './api';
import type { LoginInput, RegisterInput } from './api';
import type { User } from './types';

type AuthContextValue = {
  user: User | null;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// In-memory only for now, so the session doesn't survive an app restart -
// commit 70 adds expo-secure-store persistence and an app-boot restore
// effect on top of this same context, plus wires api/client's
// onUnauthorized into logout().
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input);
    setToken(response.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const response = await registerRequest(input);
    setToken(response.accessToken);
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
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
