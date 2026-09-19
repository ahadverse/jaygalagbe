import { API_URL, TOKEN_STORAGE_KEY } from './config';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeToken(token: string | null) {
  try {
    if (token === null) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } else {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // A locked-down browser profile just means the session ends on reload.
  }
}

/** Params with `undefined`, `null`, `''` or an empty array are dropped. */
export type QueryParams = Record<
  string,
  string | number | boolean | string[] | undefined | null
>;

export function buildQuery(params: QueryParams): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      if (value.length > 0) search.set(key, value.join(','));
      continue;
    }
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message: unknown };
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
  } catch {
    // Not JSON — fall back to the status text.
  }
  return response.statusText || 'Request failed';
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

/** Fires when the API rejects the stored token, so the app can sign out. */
const unauthorizedHandlers = new Set<() => void>();

export function onUnauthorized(handler: () => void): () => void {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {},
): Promise<T> {
  const token = readToken();

  const response = await fetch(`${API_URL}${path}`, {
    method,
    signal,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    // An expired or revoked token must not leave a half-signed-in console up.
    if ((response.status === 401 || response.status === 403) && token) {
      writeToken(null);
      for (const handler of unauthorizedHandlers) handler();
    }
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
