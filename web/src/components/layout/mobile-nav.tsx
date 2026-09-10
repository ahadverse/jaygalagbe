"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui";
import { logoutAction } from "@/lib/auth/actions";
import type { AuthUser } from "@/lib/auth/types";

const navLinks = [
  { href: "/jayga-bikroy", label: "Jayga Bikroy" },
  { href: "/basa-bhara", label: "Basa Bhara" },
];

export function MobileNav({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="h-5 w-5">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-border bg-background p-4 shadow-md">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3 sm:hidden">
            <Link
              href={user ? (user.isAdvertiser ? "/advertiser" : "/dashboard") : "/login"}
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {user ? user.name.split(" ")[0] : "Log in"}
            </Link>
            {user && (
              <form action={logoutAction}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Log out
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
