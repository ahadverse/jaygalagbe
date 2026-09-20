import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import {
  DashboardSidebar,
  DashboardTabs,
} from "@/components/dashboard/dashboard-nav";
import { DASHBOARD_NAV } from "@/components/dashboard/nav-items";
import { DashboardViewSwitcher } from "@/components/dashboard/view-switcher";
import { requireUser } from "@/lib/auth/require-user";
import { resolveDashboardView } from "@/lib/dashboard/resolve-view";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  const view = await resolveDashboardView();
  const firstName = user.name.trim().split(" ")[0];

  // Whichever side you are on, the other one's entry point stays reachable —
  // just demoted to the quieter button.
  const primary =
    view === "advertiser"
      ? { href: "/dashboard/ads/new", label: "Post an ad" }
      : { href: "/jayga-jomi", label: "Browse listings" };
  const secondary =
    view === "advertiser"
      ? { href: "/jayga-jomi", label: "Browse listings" }
      : { href: "/dashboard/ads/new", label: "Post an ad" };

  return (
    <div className="shell flex w-full flex-col gap-6 py-6 sm:py-8 lg:flex-row lg:gap-10 lg:py-10">
      <div className="flex flex-col gap-4 lg:w-56 lg:shrink-0">
        <div className="flex items-center gap-3 lg:flex-col lg:items-start lg:gap-3 lg:rounded-2xl lg:bg-card lg:p-4 lg:shadow-sm lg:ring-1 lg:ring-neutral-900/5">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-600 font-heading text-base font-bold text-white shadow-brand"
          >
            {firstName.charAt(0).toUpperCase()}
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-heading text-sm font-bold text-foreground">
              {user.name}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user.email ?? user.phone ?? "Signed in"}
            </span>
          </div>
          <div className="ml-auto flex shrink-0 gap-2 lg:ml-0 lg:mt-1 lg:w-full lg:flex-col">
            <Link
              href={secondary.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "hidden lg:inline-flex lg:w-full",
              )}
            >
              {secondary.label}
            </Link>
            <Link
              href={primary.href}
              className={cn(
                buttonVariants({ variant: "primary", size: "sm" }),
                "lg:w-full",
              )}
            >
              {primary.label}
            </Link>
          </div>
        </div>

        <DashboardViewSwitcher view={view} />

        <DashboardSidebar items={DASHBOARD_NAV[view]} />
        <DashboardTabs items={DASHBOARD_NAV[view]} />
      </div>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
