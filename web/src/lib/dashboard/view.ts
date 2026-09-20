/**
 * Which side of the marketplace the dashboard is showing. Everyone can be both
 * — the account carries no role — so this is a view preference, not a
 * permission.
 *
 * Constants only: the switcher is a client component, so the server-side
 * lookup lives in `resolve-view.ts` instead.
 */

export const DASHBOARD_VIEW_COOKIE = "jl_dashboard_view";

export const DASHBOARD_VIEWS = ["customer", "advertiser"] as const;

export type DashboardView = (typeof DASHBOARD_VIEWS)[number];

export const DASHBOARD_VIEW_LABEL: Record<DashboardView, string> = {
  customer: "Customer",
  advertiser: "Advertiser",
};

export function isDashboardView(value: unknown): value is DashboardView {
  return DASHBOARD_VIEWS.includes(value as DashboardView);
}
