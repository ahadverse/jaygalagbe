"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sectors = [
  { value: "jayga-jomi", label: "Jayga Jomi" },
  { value: "basha-bhara", label: "Basha Bhara" },
] as const;

type SectorValue = (typeof sectors)[number]["value"];

const popularAreas = ["Dhanmondi", "Bashundhara", "Uttara", "Chattogram", "Sylhet"];

const assurances = [
  "Every ad manually reviewed",
  "Free to browse, no login",
  "Chat directly with the owner",
];

/* Keeps copy above 5.6:1 contrast over the photo, from 360px up. */
const scrimLayers = [
  "radial-gradient(80% 90% at 50% 50%, oklch(12% 0.006 56 / 0.68), transparent 100%)",
  "linear-gradient(to bottom, oklch(12% 0.006 56 / 0.35), transparent 30%)",
  "linear-gradient(to top, oklch(12% 0.006 56 / 0.4), transparent 30%)",
  "radial-gradient(75% 70% at 50% 112%, oklch(58% 0.185 39 / 0.3), transparent 65%)",
].join(", ");

export function Hero() {
  const router = useRouter();
  const [sector, setSector] = useState<SectorValue>(sectors[0].value);
  const [location, setLocation] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = location.trim() ? `?location=${encodeURIComponent(location.trim())}` : "";
    router.push(`/${sector}${params}`);
  }

  return (
    // bg-neutral-950 is the floor: if the photo is slow or fails, the hero
    // degrades to a dark band the white type still reads against.
    <section className="relative isolate overflow-hidden bg-neutral-950">
      <Image
        src="/hero-dhaka-dusk.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-[58%_62%]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-neutral-950/34" />
      {/* Narrow viewports crop into the brightest part of the sky. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-neutral-950/20 lg:hidden" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ backgroundImage: scrimLayers }}
      />

      {/* Extra bottom padding leaves room for the stats shelf to overlap. */}
      <div className="shell relative flex min-h-[41rem] items-center justify-center pb-28 pt-16 sm:pb-32 sm:pt-20 lg:min-h-[45rem]">
        <div className="flex w-full flex-col items-center gap-7 text-center sm:gap-8">
          <span className="eyebrow inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-400" />
            Land &amp; rentals across Bangladesh
          </span>

          <div className="mx-auto flex max-w-[44rem] flex-col gap-4">
            <h1 className="text-balance font-heading text-display text-white">
              Find the right jayga.
              <span className="block text-brand-200">Or the right basha.</span>
            </h1>
            <p className="text-pretty text-base text-neutral-200 sm:text-lg">
              Plots to buy and homes to rent across Bangladesh — every listing
              checked by a human before it reaches you.
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mx-auto w-full max-w-[40rem] rounded-2xl bg-card p-2.5 text-left shadow-xl ring-1 ring-white/10 sm:p-3"
          >
            <div
              role="group"
              aria-label="What are you looking for?"
              className="mb-2.5 flex gap-1 rounded-full bg-muted p-1"
            >
              {sectors.map((option) => {
                const active = sector === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSector(option.value)}
                    className={cn(
                      "flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                      active
                        ? "bg-card text-brand-800 shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-subtle-foreground"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path d="M12 21s-6.5-5.4-6.5-10a6.5 6.5 0 1 1 13 0c0 4.6-6.5 10-6.5 10Z" />
                  <circle cx="12" cy="11" r="2.25" />
                </svg>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Area or district — e.g. Dhanmondi, Dhaka"
                  aria-label="Location"
                  className="h-13 w-full rounded-xl border border-transparent bg-muted pl-12 pr-4 text-base text-foreground transition-colors placeholder:text-subtle-foreground hover:bg-neutral-150 focus-visible:border-brand-300 focus-visible:bg-card sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-brand transition-[background-color,box-shadow,transform] duration-200 ease-soft hover:bg-brand-800 hover:shadow-lg active:translate-y-px"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                  className="size-4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="m20 20-3.5-3.5" />
                </svg>
                Search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-neutral-300">Popular:</span>
            {popularAreas.map((area) => (
              <Link
                key={area}
                href={`/${sector}?location=${encodeURIComponent(area)}`}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors duration-150 hover:bg-white/20"
              >
                {area}
              </Link>
            ))}
          </div>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {assurances.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-xs text-neutral-200"
              >
                <svg
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  className="size-3.5 text-success-100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 8.5 3.2 3.2L13 5" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
