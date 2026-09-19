import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * MD5 is the scheme SSLCommerz mandates for `verify_sign`; it is a gateway
 * contract, not a security choice of ours. The comparison itself is
 * constant-time so a forged signature cannot be tuned byte by byte.
 */
export function verifySslcommerzSignature(
  payload: Record<string, string>,
  storePassword: string,
): boolean {
  const { verify_sign: verifySign, verify_key: verifyKey } = payload;
  if (typeof verifySign !== 'string' || typeof verifyKey !== 'string') {
    return false;
  }

  const data: Record<string, string> = {};
  for (const field of verifyKey.split(',')) {
    if (payload[field] !== undefined) {
      data[field] = payload[field];
    }
  }
  data.store_passwd = createHash('md5').update(storePassword).digest('hex');

  const hashString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('&');

  const computed = createHash('md5').update(hashString).digest('hex');
  return constantTimeEquals(computed, verifySign);
}

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8');
  const right = Buffer.from(b, 'utf8');
  return left.length === right.length && timingSafeEqual(left, right);
}
