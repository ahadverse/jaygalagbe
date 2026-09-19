"use server";

import { redirect } from "next/navigation";
import { apiUrl, isValidId } from "@/lib/api/config";
import { readError } from "@/lib/api/errors";
import { getToken } from "@/lib/auth/session";

export type BoostFormState = { error?: string };

/** The only hosts a checkout may hand us back. */
const GATEWAY_HOSTS = new Set([
  "securepay.sslcommerz.com",
  "sandbox.sslcommerz.com",
]);

function isGatewayUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && GATEWAY_HOSTS.has(url.host);
  } catch {
    return false;
  }
}

export async function purchaseBoostAction(
  _prevState: BoostFormState,
  formData: FormData,
): Promise<BoostFormState> {
  const adId = formData.get("adId")?.toString();
  const tier = String(formData.get("tier") ?? "");
  const gateway = String(formData.get("gateway") ?? "");

  if (!isValidId(adId)) {
    return { error: "That listing could not be found." };
  }

  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in." };
  }

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let paymentId: string;
  try {
    const boostResponse = await fetch(apiUrl`/ads/${adId}/boosts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ tier, gateway }),
    });
    if (!boostResponse.ok) {
      return {
        error: await readError(
          boostResponse,
          "Couldn't start the boost purchase.",
        ),
      };
    }
    const boost = (await boostResponse.json()) as { paymentId: string };
    paymentId = boost.paymentId;
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  let gatewayPageUrl: string;
  try {
    const checkoutResponse = await fetch(
      apiUrl`/payments/${paymentId}/checkout`,
      { method: "POST", headers: authHeaders },
    );
    if (!checkoutResponse.ok) {
      return {
        error: await readError(checkoutResponse, "Couldn't start checkout."),
      };
    }
    const data = (await checkoutResponse.json()) as { gatewayPageUrl: string };
    gatewayPageUrl = data.gatewayPageUrl;
  } catch {
    return { error: "Couldn't reach the payment gateway. Please try again." };
  }

  // This redirect leaves the site, so the destination has to be the gateway.
  if (!isGatewayUrl(gatewayPageUrl)) {
    return { error: "The payment gateway returned an unexpected address." };
  }

  redirect(gatewayPageUrl);
}
