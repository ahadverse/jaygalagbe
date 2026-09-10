"use server";

import { redirect } from "next/navigation";
import { API_URL } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";

export type BoostFormState = { error?: string };

function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
    if (typeof message === "string") {
      return message;
    }
  }
  return fallback;
}

export async function purchaseBoostAction(
  _prevState: BoostFormState,
  formData: FormData,
): Promise<BoostFormState> {
  const adId = String(formData.get("adId") ?? "");
  const tier = String(formData.get("tier") ?? "");
  const gateway = String(formData.get("gateway") ?? "");

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
    const boostResponse = await fetch(`${API_URL}/ads/${adId}/boosts`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ tier, gateway }),
    });
    if (!boostResponse.ok) {
      const body = await boostResponse.json().catch(() => null);
      return { error: extractErrorMessage(body, "Couldn't start the boost purchase.") };
    }
    const boost = (await boostResponse.json()) as { paymentId: string };
    paymentId = boost.paymentId;
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  let gatewayPageUrl: string;
  try {
    const checkoutResponse = await fetch(`${API_URL}/payments/${paymentId}/checkout`, {
      method: "POST",
      headers: authHeaders,
    });
    if (!checkoutResponse.ok) {
      const body = await checkoutResponse.json().catch(() => null);
      return { error: extractErrorMessage(body, "Couldn't start checkout.") };
    }
    const data = (await checkoutResponse.json()) as { gatewayPageUrl: string };
    gatewayPageUrl = data.gatewayPageUrl;
  } catch {
    return { error: "Couldn't reach the payment gateway. Please try again." };
  }

  redirect(gatewayPageUrl);
}
