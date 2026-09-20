"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DashboardNavItem } from "./nav-items";

function isActive(pathname: string, href: string): boolean {
  return href === "/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

/** Rail on large screens; the mobile version is `DashboardTabs` below. */
export function DashboardSidebar({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className="sticky top-24 hidden w-56 shrink-0 flex-col gap-1 lg:flex"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors duration-150",
              active
                ? "bg-brand-50 text-brand-800"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardTabs({ items }: { items: DashboardNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Dashboard"
      className="bleed-shell no-scrollbar flex gap-1 overflow-x-auto pb-px lg:hidden"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors duration-150",
              active
                ? "bg-brand-600 text-white shadow-brand"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
