import { apiPost } from '../../api/client';
import type { Boost, BoostTier, PaymentGateway } from './types';

export function purchaseBoost(
  adId: string,
  input: { tier: BoostTier; gateway: PaymentGateway },
): Promise<Boost> {
  return apiPost<Boost>(`/ads/${adId}/boosts`, input);
}

export function startCheckout(
  paymentId: string,
): Promise<{ gatewayPageUrl: string }> {
  return apiPost<{ gatewayPageUrl: string }>(`/payments/${paymentId}/checkout`);
}

// Mirrors web/src/lib/boost/actions.ts's isGatewayUrl allowlist - a
// deliberate check before ever opening an externally-returned URL.
const GATEWAY_HOSTS = new Set([
  'api.paystation.com.bd',
  'sandbox.paystation.com.bd',
]);

export function isTrustedGatewayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && GATEWAY_HOSTS.has(url.host);
  } catch {
    return false;
  }
}
