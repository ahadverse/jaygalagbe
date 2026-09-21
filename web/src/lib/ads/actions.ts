"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { API_URL, apiUrl, isValidId } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";
import { setDashboardView } from "@/lib/dashboard/actions";
import type { Sector } from "./types";

export type AdFormState = { error?: string };

const ADS_PATH = "/dashboard/ads";

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

function buildAttributes(
  sector: Sector,
  formData: FormData,
): Record<string, unknown> {
  if (sector === "LAND") {
    const attributes: Record<string, unknown> = {
      sizeKatha: Number(formData.get("sizeKatha")),
    };
    const propertyType = String(formData.get("propertyType") ?? "");
    if (propertyType) attributes.propertyType = propertyType;
    return attributes;
  }

  const attributes: Record<string, unknown> = {
    bedrooms: Number(formData.get("bedrooms")),
    furnished: formData.get("furnished") === "on",
  };
  const bathrooms = formData.get("bathrooms");
  if (bathrooms) attributes.bathrooms = Number(bathrooms);
  const propertyType = String(formData.get("propertyType") ?? "");
  if (propertyType) attributes.propertyType = propertyType;
  return attributes;
}

function buildAdPayload(formData: FormData, sector: Sector) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: Number(formData.get("price")),
    locationDivision: String(formData.get("locationDivision") ?? ""),
    locationDistrict: String(formData.get("locationDistrict") ?? ""),
    locationArea: String(formData.get("locationArea") ?? ""),
    address: String(formData.get("address") ?? "") || undefined,
    // The uploader emits one hidden input per stored photo, in cover-first
    // order; the API re-checks that each one is an absolute http(s) URL.
    photos: formData.getAll("photos").map(String),
    attributes: buildAttributes(sector, formData),
  };
}

export async function createAdAction(
  _prevState: AdFormState,
  formData: FormData,
): Promise<AdFormState> {
  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in." };
  }

  const sector = String(formData.get("sector")) as Sector;
  const payload = { sector, ...buildAdPayload(formData, sector) };

  try {
    const response = await fetch(`${API_URL}/ads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: extractErrorMessage(body, "Couldn't create the ad.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  // Posting is the moment someone becomes an advertiser, and the page we are
  // about to redirect to only exists in that view's nav.
  await setDashboardView("advertiser");

  revalidatePath(ADS_PATH);
  redirect(ADS_PATH);
}

export async function updateAdAction(
  _prevState: AdFormState,
  formData: FormData,
): Promise<AdFormState> {
  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in." };
  }

  const id = formData.get("id")?.toString();
  if (!isValidId(id)) {
    return { error: "That listing could not be found." };
  }

  const sector = String(formData.get("sector")) as Sector;

  try {
    const response = await fetch(apiUrl`/ads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(buildAdPayload(formData, sector)),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: extractErrorMessage(body, "Couldn't update the ad.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath(ADS_PATH);
  redirect(ADS_PATH);
}

async function mutateAd(formData: FormData, path: string, method: string) {
  const token = await getToken();
  const id = formData.get("id")?.toString();
  if (!token || !isValidId(id)) return;

  await fetch(`${apiUrl`/ads/${id}`}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
  });
  revalidatePath(ADS_PATH);
}

export async function markSoldAction(formData: FormData) {
  await mutateAd(formData, "/mark-sold", "PATCH");
}

export async function resubmitAdAction(formData: FormData) {
  await mutateAd(formData, "/resubmit", "PATCH");
}

export async function deleteAdAction(formData: FormData) {
  await mutateAd(formData, "", "DELETE");
}
