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
    <nav className="mx-auto flex w-full max-w-5xl gap-4 overflow-x-auto px-6">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "shrink-0 border-b-2 border-transparent px-1 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
              active && "border-primary text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
