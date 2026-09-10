import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";
import type { AuthUser } from "@/lib/auth/types";

const navLinks = [
  { href: "/jayga-bikroy", label: "Jayga Bikroy" },
  { href: "/basa-bhara", label: "Basa Bhara" },
];

export function SiteHeader({ user }: { user: AuthUser | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-primary"
        >
          Jayga Lagbe
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={user.isAdvertiser ? "/advertiser" : "/dashboard"}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden sm:inline-flex",
                )}
              >
                {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
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
            className={buttonVariants({ variant: "accent", size: "sm" })}
          >
            Post an ad
          </Link>
        </div>
      </div>
    </header>
  );
}
