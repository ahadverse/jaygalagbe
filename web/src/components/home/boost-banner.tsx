import Link from "next/link";
import { boostTiers } from "@/lib/boost/config";
import { formatAmount } from "@/lib/format";

const cheapestBoost = boostTiers.reduce((cheapest, tier) =>
  tier.priceBdt < cheapest.priceBdt ? tier : cheapest,
);

export function BoostBanner() {
  return (
    <section aria-labelledby="boost-banner-heading" className="shell py-6 sm:py-10">
      <div className="flex flex-col items-start gap-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />
            </svg>
          </span>
          <div className="flex flex-col gap-1">
            <h2
              id="boost-banner-heading"
              className="font-heading text-xl font-bold tracking-tight sm:text-2xl"
            >
              Get More Buyers
            </h2>
            <p className="text-sm leading-relaxed text-white/85 sm:text-base">
              Boost your property from only ৳{formatAmount(cheapestBoost.priceBdt)}{" "}
              and place it above regular listings.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/ads"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
        >
          Boost your listing
        </Link>
      </div>
    </section>
  );
}
