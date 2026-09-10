import Link from "next/link";

const footerColumns = [
  {
    title: "Browse",
    links: [
      { href: "/jayga-bikroy", label: "Jayga Bikroy (Land for sale)" },
      { href: "/basa-bhara", label: "Basa Bhara (House rent)" },
    ],
  },
  {
    title: "For advertisers",
    links: [
      { href: "/advertiser/ads/new", label: "Post an ad" },
      { href: "/register", label: "Become an advertiser" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Jayga Lagbe" },
      { href: "/contact", label: "Contact us" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="flex flex-col gap-2 sm:col-span-2 md:col-span-1">
          <span className="text-lg font-bold tracking-tight text-primary">
            Jayga Lagbe
          </span>
          <p className="text-sm text-muted-foreground">
            Verified land and rental listings, with every ad manually
            reviewed before it goes live.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <span className="text-sm font-semibold text-foreground">
              {column.title}
            </span>
            <ul className="flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Jayga Lagbe. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
