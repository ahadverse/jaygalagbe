"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";
import { sectorConfigs } from "@/lib/ads/sectors";
import type { AuthUser } from "@/lib/auth/types";

const sectorNavLinks = [
  {
    href: "/jayga-jomi",
    label: "For Sale",
    hint: "Land for sale",
    icon: "M4 20h24M7 20V9l9-5 9 5v11M12 20v-6h6v6",
    items: sectorConfigs["jayga-jomi"].propertyTypes,
  },
  {
    href: "/basha-bhara",
    label: "For Rent",
    hint: "Houses for rent",
    icon: "M5 18V10l11-6 11 6v8M9 26V16h5v10M20 26h6v-7h-6v7Z",
    items: sectorConfigs["basha-bhara"].propertyTypes,
  },
];

const otherNavLinks = [
  {
    href: "/founder",
    label: "Meet the Founder",
    hint: "The story behind Jayga Lagbe",
    icon: "M16 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM6 27a10 10 0 0 1 20 0",
  },
  {
    href: "/contact",
    label: "Contact Us",
    hint: "Get help from our team",
    icon: "M5 8h22v16H5zM5 9l11 9 11-9",
  },
];

export function MobileNav({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function closeAll() {
    setOpen(false);
    setExpanded(null);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="inline-flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.9}
          aria-hidden="true"
          className="size-5"
        >
          {open ? (
            <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={closeAll}
            className="fixed inset-x-0 bottom-0 top-16 z-30 cursor-default bg-neutral-950/25 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] animate-slide-down overflow-y-auto border-b border-border bg-card px-4 pb-5 pt-4 shadow-lg">
            <nav className="flex flex-col gap-2">
              {sectorNavLinks.map((link) => {
                const isExpanded = expanded === link.href;
                return (
                  <div key={link.href} className="overflow-hidden rounded-xl bg-muted/70">
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : link.href)}
                      aria-expanded={isExpanded}
                      className="flex w-full items-center gap-3.5 px-3.5 py-3 text-left transition-colors hover:bg-brand-50"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-brand-700 shadow-xs">
                        <svg viewBox="0 0 32 32" aria-hidden="true" className="size-5">
                          <path
                            d={link.icon}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="flex flex-1 flex-col">
                        <span className="font-heading text-sm font-bold text-foreground">
                          {link.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {link.hint}
                        </span>
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform duration-150",
                          isExpanded && "rotate-180",
                        )}
                      >
                        <path
                          d="m6 8.5 4 4 4-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="flex flex-col gap-0.5 border-t border-border/70 bg-card px-2 py-2">
                        <Link
                          href={link.href}
                          onClick={closeAll}
                          className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-muted"
                        >
                          All {link.label.toLowerCase()} listings
                        </Link>
                        {link.items.map((item) => (
                          <Link
                            key={item}
                            href={`${link.href}?propertyType=${encodeURIComponent(item)}`}
                            onClick={closeAll}
                            className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {otherNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  className="flex items-center gap-3.5 rounded-xl bg-muted/70 px-3.5 py-3 transition-colors hover:bg-brand-50"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-card text-brand-700 shadow-xs">
                    <svg viewBox="0 0 32 32" aria-hidden="true" className="size-5">
                      <path
                        d={link.icon}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="flex flex-col">
                    <span className="font-heading text-sm font-bold text-foreground">
                      {link.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {link.hint}
                    </span>
                  </span>
                </Link>
              ))}
            </nav>

            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:hidden">
              <Link
                href={user ? "/dashboard" : "/login"}
                onClick={closeAll}
                className={buttonVariants({ variant: "outline" })}
              >
                {user ? `${user.name.split(" ")[0]}'s dashboard` : "Log in"}
              </Link>
              {user && (
                <form action={logoutAction}>
                  <Button type="submit" variant="ghost" className="w-full">
                    Log out
                  </Button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
