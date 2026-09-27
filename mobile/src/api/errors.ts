export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/**
 * Mirrors web/src/lib/auth/actions.ts's extractErrorMessage: NestJS's
 * ValidationPipe returns `{ message: string[] }` for validation failures and
 * `{ message: string }` for thrown HttpExceptions. Both apps need to unwrap
 * the same shape since they hit the same backend.
 */
export function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message) && typeof message[0] === 'string') {
      return message[0];
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  return fallback;
}
