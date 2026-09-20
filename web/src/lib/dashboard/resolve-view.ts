import { cache } from "react";
import { cookies } from "next/headers";
import { getToken } from "@/lib/auth/session";
import { fetchMyAds } from "@/lib/ads/fetch-my-ads";
import {
  DASHBOARD_VIEW_COOKIE,
  isDashboardView,
  type DashboardView,
} from "./view";

/**
 * Until someone switches it themselves, having posted an ad is the only signal
 * we have about which half of the dashboard they came for.
 *
 * Cached for the render pass: the layout picks the nav from it and the page
 * picks its sections, and neither should pay for the lookup twice.
 */
export const resolveDashboardView = cache(async (): Promise<DashboardView> => {
  const store = await cookies();
  const stored = store.get(DASHBOARD_VIEW_COOKIE)?.value;
  if (isDashboardView(stored)) {
    return stored;
  }

  const token = await getToken();
  if (!token) return "customer";

  const ads = await fetchMyAds(token);
  return ads.length > 0 ? "advertiser" : "customer";
});
