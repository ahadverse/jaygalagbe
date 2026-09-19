import Link from "next/link";
import { buttonVariants } from "@/components/ui";
import { boostTiers } from "@/lib/boost/config";
import { formatAmount } from "@/lib/format";

const cheapestBoost = boostTiers.reduce((cheapest, tier) =>
  tier.priceBdt < cheapest.priceBdt ? tier : cheapest,
);

const points = [
  {
    title: "Posting is free",
    body: "No listing fee, no commission on the deal. You only ever pay if you choose to boost.",
  },
  {
    title: "Reviewed, usually within a day",
    body: "A person checks the ad and either publishes it or tells you exactly what to fix.",
  },
  {
    title: "Buyers message you in the app",
    body: "Replies arrive in your inbox in real time — no phone number posted in public.",
  },
  {
    title: `Boost from ৳${formatAmount(cheapestBoost.priceBdt)}`,
    body: `Optional paid placement above organic results, from ${cheapestBoost.label}, paid by bKash, Nagad or card.`,
  },
];

export function AdvertiserCta() {
  return (
    <section
      aria-labelledby="advertiser-heading"
      className="relative isolate overflow-hidden bg-neutral-950"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(60% 80% at 12% 110%, oklch(58% 0.185 39 / 0.35), transparent 62%), radial-gradient(45% 60% at 92% 0%, oklch(59% 0.2 18 / 0.22), transparent 68%)",
        }}
      />

      <div className="shell grid gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
        <div className="flex flex-col gap-5">
          <p className="eyebrow text-brand-300">For owners and agents</p>
          <h2
            id="advertiser-heading"
            className="font-heading text-title text-white"
          >
            Have a plot or a flat to put on the market?
          </h2>
          <p className="measure text-base leading-relaxed text-neutral-300">
            Put it in front of people who are already searching for it. You keep
            control of the listing, you talk to buyers directly, and you can see
            exactly how the ad is performing.
          </p>

          <div className="mt-1 flex flex-wrap gap-3">
            <Link
              href="/dashboard/ads/new"
              className={buttonVariants({ variant: "primary", size: "lg" })}
            >
              Post your property
            </Link>
            <Link
              href="/register"
              className="inline-flex h-13 items-center justify-center rounded-full px-7 text-base font-medium text-white ring-1 ring-white/25 transition-colors duration-200 hover:bg-white/10"
            >
              Create an account
            </Link>
          </div>
        </div>

        <ul className="grid gap-px overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10 sm:grid-cols-2">
          {points.map((point) => (
            <li key={point.title} className="flex flex-col gap-1.5 bg-neutral-950 p-5">
              <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-white">
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="size-3.5 shrink-0 text-brand-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 8.5 3.2 3.2L13 5" />
                </svg>
                {point.title}
              </h3>
              <p className="text-xs leading-relaxed text-neutral-400">
                {point.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
