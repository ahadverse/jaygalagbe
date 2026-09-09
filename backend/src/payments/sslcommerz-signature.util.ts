import { createHash } from 'node:crypto';

export function verifySslcommerzSignature(
  payload: Record<string, string>,
  storePassword: string,
): boolean {
  const { verify_sign: verifySign, verify_key: verifyKey } = payload;
  if (!verifySign || !verifyKey) {
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

  const computedSign = createHash('md5').update(hashString).digest('hex');
  return computedSign === verifySign;
}
