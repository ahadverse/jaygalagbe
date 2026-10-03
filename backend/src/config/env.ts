const MIN_JWT_SECRET_LENGTH = 32;

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters`,
    );
  }
  return secret;
}

export function getCorsOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  if (!configured) {
    if (isProduction()) {
      throw new Error('CORS_ORIGINS must be set in production');
    }
    return ['http://localhost:3000', 'http://localhost:5173'];
  }

  return configured
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Fails the process at boot rather than at the first request that needs a
 * missing secret, so a misconfigured deploy never serves traffic.
 */
export function assertRequiredEnv(): void {
  getJwtSecret();
  getCorsOrigins();

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  // Optional: push is a no-op without it, but a malformed value should be
  // loud at boot rather than silently disabling push.
  const firebaseJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (firebaseJson) {
    try {
      JSON.parse(firebaseJson);
    } catch {
      console.warn(
        'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON - push notifications will be disabled',
      );
    }
  }
}
