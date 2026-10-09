import Image from "next/image";
import Link from "next/link";
import { SocialLinks } from "@/components/social/social-links";

const footerColumns = [
  {
    title: "For Buyers",
    links: [
      { href: "/jayga-jomi", label: "Browse Land" },
      { href: "/basha-bhara", label: "Browse Rentals" },
      { href: "/#districts-heading", label: "Search by District" },
    ],
  },
  {
    title: "For Owners",
    links: [
      { href: "/dashboard/ads/new", label: "Post Your Property" },
      { href: "/register", label: "Become an Advertiser" },
      { href: "/dashboard/ads", label: "Boost Your Listing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/founder", label: "Meet the Founder" },
      { href: "/contact", label: "Contact Us" },
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "Contact Support" },
      { href: "/contact#safety-tips", label: "Safety Tips" },
      { href: "/#faq-heading", label: "Frequently Asked Questions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-neutral-950 text-neutral-300">
      <div className="shell grid gap-10 py-14 sm:grid-cols-2 sm:py-16 lg:grid-cols-5">
        <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
          <span className="inline-flex w-fit rounded-2xl bg-white p-3">
            <Image
              src="/logo.png"
              alt="Jayga Lagbe"
              width={900}
              height={740}
              className="h-24 w-auto"
            />
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-neutral-400">
            Bangladesh&apos;s property listing platform. Every listing is
            manually reviewed before publication.
          </p>
          <SocialLinks tone="dark" />
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
