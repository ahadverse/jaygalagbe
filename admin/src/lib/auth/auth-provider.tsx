import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, apiRequest, readToken, writeToken } from '@/lib/api/client';
import type { AuthUser } from '@/lib/api/types';
import { AuthContext, type AuthState } from './auth-context';

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

/** The API takes either an email or a phone, so the login form asks for one field. */
function credentialBody(identifier: string, password: string) {
  return identifier.includes('@')
    ? { email: identifier, password }
    : { phone: identifier, password };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  // No stored token means there is nothing to verify — start settled rather
  // than flashing the loading screen on every cold visit.
  const [status, setStatus] = useState<AuthState['status']>(() =>
    readToken() ? 'loading' : 'anonymous',
  );

  const logout = useCallback(() => {
    writeToken(null);
    setUser(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  // Restore the session on load: a stored token is only trusted once /auth/me
  // confirms it is still valid and still belongs to an admin.
  useEffect(() => {
    if (!readToken()) return;

    let active = true;
    apiRequest<AuthUser>('/auth/me')
      .then((me) => {
        if (!active) return;
        if (!me.isAdmin) {
          writeToken(null);
          setStatus('anonymous');
          return;
        }
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!active) return;
        writeToken(null);
        setStatus('anonymous');
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback<AuthState['login']>(
    async ({ identifier, password }) => {
      const result = await apiRequest<LoginResponse>('/auth/login', {
        method: 'POST',
        body: credentialBody(identifier.trim(), password),
      });

      if (!result.user.isAdmin) {
        throw new ApiError(403, 'This account does not have admin access');
      }

      writeToken(result.accessToken);
      setUser(result.user);
      setStatus('authenticated');
    },
    [],
  );

  const value = useMemo<AuthState>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
