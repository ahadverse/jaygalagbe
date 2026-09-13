import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { AuthUser } from "@/lib/auth/types";

const navLinks = [
  { href: "/jayga-jomi", label: "Jayga Jomi" },
  { href: "/basha-bhara", label: "Basha Bhara" },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 text-white shadow-brand">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1.125rem]">
          <path
            d="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-heading text-lg font-extrabold tracking-tight text-neutral-900">
        Jayga<span className="text-primary">Lagbe</span>
      </span>
    </span>
  );
}

export function SiteHeader({ user }: { user: AuthUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="shell flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link href="/" className="shrink-0 rounded-lg" aria-label="Jayga Lagbe home">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {user ? (
            <>
              <NotificationBell />
              <Link
                href={user.isAdvertiser ? "/advertiser" : "/dashboard"}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden gap-2 sm:inline-flex",
                )}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-2xs font-bold text-brand-800">
                  {user.name.trim().charAt(0).toUpperCase()}
                </span>
                {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction} className="hidden sm:block">
                <Button type="submit" variant="ghost" size="sm">
                  Log out
                </Button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Log in
            </Link>
          )}
          <Link
            href="/advertiser/ads/new"
            className={cn(buttonVariants({ variant: "primary", size: "sm" }), "gap-1.5")}
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Post an ad
          </Link>
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
