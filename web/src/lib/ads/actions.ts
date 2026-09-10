"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/config";
import { getToken } from "@/lib/auth/session";
import type { Sector } from "./types";

export type AdFormState = { error?: string };

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

function buildAttributes(sector: Sector, formData: FormData): Record<string, unknown> {
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
    locationArea: String(formData.get("locationArea") ?? ""),
    locationDistrict: String(formData.get("locationDistrict") ?? ""),
    address: String(formData.get("address") ?? "") || undefined,
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

  revalidatePath("/advertiser");
  redirect("/advertiser");
}

export async function updateAdAction(
  _prevState: AdFormState,
  formData: FormData,
): Promise<AdFormState> {
  const token = await getToken();
  if (!token) {
    return { error: "You need to be logged in." };
  }

  const id = String(formData.get("id") ?? "");
  const sector = String(formData.get("sector")) as Sector;
  const payload = buildAdPayload(formData, sector);

  try {
    const response = await fetch(`${API_URL}/ads/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      return { error: extractErrorMessage(body, "Couldn't update the ad.") };
    }
  } catch {
    return { error: "Couldn't reach the server. Please try again." };
  }

  revalidatePath("/advertiser");
  redirect("/advertiser");
}

export async function markSoldAction(formData: FormData) {
  const token = await getToken();
  if (!token) return;
  const id = String(formData.get("id") ?? "");
  await fetch(`${API_URL}/ads/${id}/mark-sold`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  revalidatePath("/advertiser");
}

export async function resubmitAdAction(formData: FormData) {
  const token = await getToken();
  if (!token) return;
  const id = String(formData.get("id") ?? "");
  await fetch(`${API_URL}/ads/${id}/resubmit`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  revalidatePath("/advertiser");
}

export async function deleteAdAction(formData: FormData) {
  const token = await getToken();
  if (!token) return;
  const id = String(formData.get("id") ?? "");
  await fetch(`${API_URL}/ads/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  revalidatePath("/advertiser");
}
