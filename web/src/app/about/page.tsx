import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us | Jayga Lagbe",
  description:
    "JaygaLagbe.com is an online platform that makes finding, buying, selling and renting property easier across Bangladesh.",
};

const offerings = [
  {
    title: "Land for Sale",
    body: "Explore land and plot advertisements in different locations.",
    icon: "M3 18h18M5 18V9l7-5 7 5v9M10 18v-5h4v5",
  },
  {
    title: "Houses for Sale",
    body: "Discover residential properties offered by owners and advertisers.",
    icon: "M4 11 12 4l8 7v9H4zM10 20v-5h4v5",
  },
  {
    title: "Property for Rent",
    body: "Find houses, apartments, rooms, and commercial spaces advertised for rent.",
    icon: "M7 14a4 4 0 1 1 3.9-5H21v3h-2v2h-3v-2h-5.1A4 4 0 0 1 7 14Z",
  },
  {
    title: "Commercial Property",
    body: "Explore shops, offices, and other commercial property listings where available.",
    icon: "M4 21V8l8-4 8 4v13M9 21v-6h6v6M8 11h2M14 11h2",
  },
  {
    title: "Property Advertising",
    body: "Give owners and authorized advertisers a place to promote their available properties.",
    icon: "M4 13v-2a1 1 0 0 1 1-1h3l8-5v14l-8-5H5a1 1 0 0 1-1-1ZM19 9a4 4 0 0 1 0 6",
  },
];

const reasons = [
  {
    title: "Nationwide Property Opportunities",
    body: "Explore property advertisements from different parts of Bangladesh and discover options that match your location and requirements.",
  },
  {
    title: "Convenient Property Search",
    body: "Browse listings and compare available details, including location, price, size, and property type, where provided.",
  },
  {
    title: "A Platform for Owners and Advertisers",
    body: "We aim to make it easier for property owners and authorized advertisers to publish listings and reach interested people.",
  },
  {
    title: "Designed for Buyers and Renters",
    body: "Our goal is to help users discover relevant property advertisements without having to search across numerous unrelated sources.",
  },
  {
    title: "A Growing Property Community",
    body: "We aim to build a useful online destination where people can explore property opportunities and connect with potential buyers, sellers, landlords, and tenants.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="eyebrow text-brand-700">{eyebrow}</span>
      <h2 className="font-heading text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h2>
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="flex-1">
      <section className="grain relative overflow-hidden bg-gradient-to-b from-brand-50 to-background">
        <div className="shell py-14 text-center sm:py-24">
          <span className="eyebrow text-brand-700">About Us</span>
          <h1 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            About JaygaLagbe.com
          </h1>
          <p className="mx-auto mt-3 max-w-2xl font-heading text-lg font-semibold text-brand-700 sm:text-xl">
            Your Trusted Destination for Property Listings in Bangladesh
          </p>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Welcome to JaygaLagbe.com, an online platform designed to make
            finding, buying, selling, and renting property easier across
            Bangladesh.
          </p>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5 sm:p-10">
          <p className="text-base leading-relaxed text-foreground">
            Whether you are looking for land to purchase, a house to sell, an
            apartment to rent, or a suitable property for your next investment,
            JaygaLagbe.com aims to help you discover property opportunities in
            one convenient place.
          </p>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="shell grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <SectionHeading eyebrow="Mission" title="Our Mission" />
          <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Our mission is to connect property owners, buyers, sellers,
              landlords, tenants, and real estate professionals through an
              accessible and user-friendly online platform.
            </p>
            <p>
              We aim to make property advertising more convenient and help
              people discover opportunities across different districts of
              Bangladesh.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="mb-10 flex max-w-2xl flex-col gap-3">
          <SectionHeading
            eyebrow="What we offer"
            title="What You Can Find on JaygaLagbe.com"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Our platform is designed for a range of property needs, including:
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offerings.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5 transition-shadow duration-200 hover:shadow-md"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={item.icon} />
                </svg>
              </span>
              <h3 className="font-heading text-lg font-bold text-neutral-900">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-subtle-foreground">
          Available categories and features may vary as the platform develops.
        </p>
      </section>

      <section className="bg-gradient-to-b from-brand-50 to-background">
        <div className="shell py-14 sm:py-20">
          <SectionHeading
            eyebrow="Why us"
            title="Why Choose JaygaLagbe.com?"
            className="mb-10 max-w-2xl"
          />
          <ol className="grid gap-5 md:grid-cols-2">
            {reasons.map((reason, index) => (
              <li
                key={reason.title}
                className="flex gap-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-600 font-heading text-base font-bold text-white">
                  {index + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-heading text-base font-bold text-neutral-900">
                    {reason.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {reason.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="grid gap-8 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5 sm:p-10 lg:grid-cols-5">
          <SectionHeading
            eyebrow="Commitment"
            title="Our Commitment"
            className="lg:col-span-2"
          />
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground lg:col-span-3">
            <p>
              We believe that clear information and responsible communication
              are important when dealing with property.
            </p>
            <p>
              We encourage users to provide accurate advertisements,
              communicate honestly, and verify property ownership and legal
              documents before making payments or entering into agreements.
            </p>
            <p className="rounded-xl bg-warning-50 px-4 py-3 text-warning-800 ring-1 ring-warning-100">
              JaygaLagbe.com aims to support property discovery and advertising.
              Unless a specific verification service is expressly offered, we do
              not guarantee the accuracy, ownership, availability, or legal
              status of individual listings.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/40">
        <div className="shell grid items-start gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <SectionHeading eyebrow="Vision" title="Our Vision" />
          <div className="flex flex-col gap-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Our vision is to become a recognized online destination for land,
              housing, rental, and other property listings across Bangladesh.
            </p>
            <p>
              We want to make it easier for people to find suitable property
              opportunities, advertise available properties, and connect with
              others in the property market.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-600 px-6 py-12 text-center text-white shadow-lg sm:px-12">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Get Started Today
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
            Looking for land? Planning to sell a property? Searching for a house
            or apartment to rent? Visit JaygaLagbe.com and explore the property
            opportunities available on our platform.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/jayga-jomi"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
            >
              Browse land
            </Link>
            <Link
              href="/basha-bhara"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
            >
              Find a rental
            </Link>
            <Link
              href="/dashboard/ads/new"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Post an ad
            </Link>
          </div>
          <p className="mt-2 font-heading text-sm font-semibold tracking-wide text-white/90">
            JaygaLagbe.com — Find Property. Connect with People. Explore
            Opportunities.
          </p>
        </div>
      </section>
    </main>
  );
}
