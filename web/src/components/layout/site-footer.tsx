import Link from "next/link";

const footerColumns = [
  {
    title: "Browse",
    links: [
      { href: "/jayga-jomi", label: "Jayga Jomi (Land for sale)" },
      { href: "/basha-bhara", label: "Basha Bhara (House rent)" },
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
    <footer className="mt-auto bg-neutral-950 text-neutral-300">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-4">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <span className="inline-flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 text-white">
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
            <span className="font-heading text-lg font-extrabold tracking-tight text-white">
              Jayga<span className="text-brand-400">Lagbe</span>
            </span>
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
            Verified land and rental listings, with every ad manually reviewed
            before it goes live.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <span className="eyebrow text-neutral-500">{column.title}</span>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors duration-150 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="shell flex flex-wrap items-center justify-between gap-2 py-5">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Jayga Lagbe. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">Made for Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
