export interface PaystationCredentials {
  merchantId: string;
  password: string;
  baseUrl: string;
  callbackUrl: string;
}

export function getPaystationCredentials(): PaystationCredentials {
  const merchantId = process.env.PAYSTATION_MERCHANT_ID;
  const password = process.env.PAYSTATION_PASSWORD;
  const baseUrl = process.env.PAYSTATION_BASE_URL;
  const callbackUrl = process.env.PAYSTATION_CALLBACK_URL;
  if (!merchantId || !password || !baseUrl || !callbackUrl) {
    throw new Error(
      'PayStation is not configured: set PAYSTATION_MERCHANT_ID, PAYSTATION_PASSWORD, PAYSTATION_BASE_URL, PAYSTATION_CALLBACK_URL',
    );
  }
  return {
    merchantId,
    password,
    // Trailing slashes would double up when endpoints are appended.
    baseUrl: baseUrl.replace(/\/+$/, ''),
    callbackUrl,
  };
}
