"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

const sectors = [
  { value: "jayga-bikroy", label: "Jayga Bikroy", hint: "Land for sale" },
  { value: "basa-bhara", label: "Basa Bhara", hint: "House rent" },
] as const;

const trustPoints = [
  "Every listing manually verified",
  "Message advertisers directly",
  "No hidden fees to browse",
];

export function Hero() {
  const router = useRouter();
  const [sector, setSector] = useState<(typeof sectors)[number]["value"]>(
    sectors[0].value,
  );
  const [location, setLocation] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = location.trim() ? `?location=${encodeURIComponent(location.trim())}` : "";
    router.push(`/${sector}${params}`);
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-20 text-center sm:py-28">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
          Land &amp; house rent, vetted before you ever see them
        </span>

        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Find your next <span className="text-primary">Jayga</span> or{" "}
          <span className="text-accent-600">Basa</span> with confidence
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground">
          Browse land-for-sale and house-rent listings across Bangladesh,
          every one reviewed by our team before it goes live — then message
          the advertiser directly, no middleman.
        </p>

        <form
          onSubmit={handleSearch}
          className="w-full max-w-2xl rounded-xl border border-border bg-background p-3 text-left shadow-sm"
        >
          <div className="mb-3 inline-flex rounded-md bg-muted p-1">
            {sectors.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSector(option.value)}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                  sector === option.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
                <span className="ml-1.5 hidden text-xs text-muted-foreground sm:inline">
                  ({option.hint})
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1">
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Search by area, e.g. Bashundhara, Dhaka"
                aria-label="Location"
              />
            </div>
            <Button type="submit" size="md" className="sm:w-auto">
              Search
            </Button>
          </div>
        </form>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
