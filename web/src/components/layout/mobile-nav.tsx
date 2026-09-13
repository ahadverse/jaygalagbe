"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui";
import { logoutAction } from "@/lib/auth/actions";
import type { AuthUser } from "@/lib/auth/types";

const navLinks = [
  {
    href: "/jayga-jomi",
    label: "Jayga Jomi",
    hint: "Land for sale",
    icon: "M4 20h24M7 20V9l9-5 9 5v11M12 20v-6h6v6",
  },
  {
    href: "/basha-bhara",
    label: "Basha Bhara",
    hint: "Houses for rent",
    icon: "M5 18V10l11-6 11 6v8M9 26V16h5v10M20 26h6v-7h-6v7Z",
  },
];

export function MobileNav({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

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
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-16 z-30 cursor-default bg-neutral-950/25 backdrop-blur-[2px]"
          />
          <div className="absolute inset-x-0 top-16 z-40 animate-slide-down border-b border-border bg-card px-4 pb-5 pt-4 shadow-lg">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
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
                href={user ? (user.isAdvertiser ? "/advertiser" : "/dashboard") : "/login"}
                onClick={() => setOpen(false)}
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
