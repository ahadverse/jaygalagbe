import { createContext } from 'react';
import type { AuthUser } from '@/lib/api/types';

export interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'anonymous';
  login: (credentials: {
    identifier: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);
