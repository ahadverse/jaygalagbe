import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api/config";
import type { Ad } from "@/lib/ads/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 50);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await fetch(`${API_URL}/ads/${id}`, { cache: "no-store" });
        if (!response.ok) return null;
        return (await response.json()) as Ad;
      } catch {
        return null;
      }
    }),
  );

  return NextResponse.json(results.filter((ad): ad is Ad => ad !== null));
}
