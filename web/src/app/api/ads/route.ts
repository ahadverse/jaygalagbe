import { NextResponse } from "next/server";
import { apiUrl, isValidId } from "@/lib/api/config";
import type { Ad } from "@/lib/ads/types";

const MAX_IDS = 50;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(isValidId)
    .slice(0, MAX_IDS);

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const response = await fetch(apiUrl`/ads/${id}`, { cache: "no-store" });
        if (!response.ok) return null;
        return (await response.json()) as Ad;
      } catch {
        return null;
      }
    }),
  );

  return NextResponse.json(results.filter((ad): ad is Ad => ad !== null));
}
