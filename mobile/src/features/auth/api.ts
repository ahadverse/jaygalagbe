import { apiPost } from '../../api/client';
import type { AuthResponse } from './types';

export type LoginInput = {
  identifier: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  identifier: string;
  password: string;
};

// Matches web/src/lib/auth/actions.ts's splitIdentifier: the backend takes
// separate optional email/phone fields, not one combined identifier.
function splitIdentifier(identifier: string): {
  email?: string;
  phone?: string;
} {
  const trimmed = identifier.trim();
  return trimmed.includes('@') ? { email: trimmed } : { phone: trimmed };
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>(
    '/auth/login',
    { ...splitIdentifier(input.identifier), password: input.password },
    { auth: false },
  );
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiPost<AuthResponse>(
    '/auth/register',
    {
      name: input.name.trim(),
      ...splitIdentifier(input.identifier),
      password: input.password,
    },
    { auth: false },
  );
}
