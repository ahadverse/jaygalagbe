"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/advertiser", label: "Your ads" },
  { href: "/advertiser/messages", label: "Messages" },
];

export function AdvertiserTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Advertiser sections"
      className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-5 sm:px-8"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative shrink-0 rounded-t-lg px-3.5 py-3.5 text-sm font-semibold transition-colors duration-150",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {tab.label}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
