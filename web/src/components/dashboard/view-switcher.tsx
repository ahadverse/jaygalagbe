"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setDashboardView } from "@/lib/dashboard/actions";
import {
  DASHBOARD_VIEWS,
  DASHBOARD_VIEW_LABEL,
  type DashboardView,
} from "@/lib/dashboard/view";

/* Switching lands on the overview: the role-specific pages differ between the
 * two sides, so staying put could leave you on a page the new nav no longer
 * lists. */
export function DashboardViewSwitcher({ view }: { view: DashboardView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function select(next: DashboardView) {
    if (next === view || pending) return;
    startTransition(async () => {
      await setDashboardView(next);
      router.push("/dashboard");
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="eyebrow px-1 text-subtle-foreground">Viewing as</p>
      <div
        role="group"
        aria-label="Dashboard view"
        aria-busy={pending || undefined}
        className="flex gap-1 rounded-full bg-muted p-1"
      >
        {DASHBOARD_VIEWS.map((candidate) => {
          const active = candidate === view;
          return (
            <button
              key={candidate}
              type="button"
              aria-pressed={active}
              onClick={() => select(candidate)}
              className={cn(
                "flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors duration-200",
                active
                  ? "bg-card text-brand-800 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
                pending && "opacity-70",
              )}
            >
              {DASHBOARD_VIEW_LABEL[candidate]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
