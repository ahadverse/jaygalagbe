"use server";

import { revalidatePath } from "next/cache";
import { API_URL } from "@/lib/api/config";
import { getToken } from "./session";

export async function upgradeToAdvertiserAction() {
  const token = await getToken();
  if (!token) return;

  await fetch(`${API_URL}/users/me/advertiser-upgrade`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  revalidatePath("/advertiser");
}
