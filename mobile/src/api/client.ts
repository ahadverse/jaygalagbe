import { API_URL } from './config';
import { ApiError, extractErrorMessage } from './errors';
import { getToken, setToken } from './token-store';

type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

/**
 * Lets the (not-yet-built) auth context react to a session dying mid-app,
 * without the API client needing to import React or navigation - it just
 * clears the token and fires this, whoever is listening decides what to do.
 */
export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

type ApiFetchOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Attach the Authorization header if a token exists. Default true. */
  auth?: boolean;
  signal?: AbortSignal;
};

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers, auth = true, signal } = options;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (cause) {
    throw new ApiError(
      0,
      "Couldn't reach the server. Please try again.",
      cause,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson =
    response.headers.get('content-type')?.includes('application/json') ?? false;
  const responseBody = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
      for (const listener of unauthorizedListeners) listener();
    }
    throw new ApiError(
      response.status,
      extractErrorMessage(responseBody, `Request failed (${response.status})`),
      responseBody,
    );
  }

  return responseBody as T;
}

type BodylessOptions = Omit<ApiFetchOptions, 'method' | 'body'>;

export function apiGet<T>(path: string, options?: BodylessOptions): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'GET' });
}

export function apiPost<T>(
  path: string,
  body?: unknown,
  options?: BodylessOptions,
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'POST', body });
}

export function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: BodylessOptions,
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'PATCH', body });
}

export function apiDelete<T>(
  path: string,
  options?: BodylessOptions,
): Promise<T> {
  return apiFetch<T>(path, { ...options, method: 'DELETE' });
}
