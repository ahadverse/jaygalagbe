export function sslcommerzBaseUrl(): string {
  return process.env.SSLCOMMERZ_IS_LIVE === 'true'
    ? 'https://securepay.sslcommerz.com'
    : 'https://sandbox.sslcommerz.com';
}

export interface SslcommerzCredentials {
  storeId: string;
  storePassword: string;
  apiBaseUrl: string;
}

export function getSslcommerzCredentials(): SslcommerzCredentials {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!storeId || !storePassword || !apiBaseUrl) {
    throw new Error(
      'SSLCommerz is not configured: set SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, API_BASE_URL',
    );
  }
  return { storeId, storePassword, apiBaseUrl };
}
