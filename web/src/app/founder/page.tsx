import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meet the Founder | Jayga Lagbe",
  description:
    "Meet Ziaul Haque, Founder & Managing Director of JaygaLagbe.com, and the vision behind the platform.",
};

/**
 * Set to a file under /public (for example "/founder.jpg") to show a photo.
 * Left empty, the avatar shows the founder's initials.
 */
const FOUNDER_PHOTO = "/founder.jpeg";

const FOUNDER = {
  name: "Ziaul Haque",
  initials: "ZH",
  role: "Founder & Managing Director",
  company: "JaygaLagbe.com",
};

function Avatar() {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute -inset-3 rounded-full bg-gradient-to-br from-brand-200 to-brand-50 blur-md"
      />
      {FOUNDER_PHOTO ? (
        <Image
          src={FOUNDER_PHOTO}
          alt={FOUNDER.name}
          width={288}
          height={288}
          className="relative size-56 rounded-full object-cover object-[50%_18%] shadow-lg ring-4 ring-white sm:size-72"
          priority
        />
      ) : (
        <span
          role="img"
          aria-label={FOUNDER.name}
          className="relative flex size-56 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-800 font-heading text-7xl font-bold tracking-wide text-white shadow-lg ring-4 ring-white sm:size-72 sm:text-8xl"
        >
          {FOUNDER.initials}
        </span>
      )}
    </div>
  );
}

export default function FounderPage() {
  return (
    <main className="flex-1">
      <section className="grain relative overflow-hidden bg-gradient-to-b from-brand-50 to-background">
        <div className="shell flex flex-col items-center py-14 text-center sm:py-20">
          <span className="eyebrow text-brand-700">Meet the Founder</span>
          <div className="mt-8">
            <Avatar />
          </div>
          <h1 className="mt-8 font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            {FOUNDER.name}
          </h1>
          <p className="mt-2 font-heading text-base font-semibold text-brand-700 sm:text-lg">
            {FOUNDER.role}, {FOUNDER.company}
          </p>
        </div>
      </section>

      <section className="shell pb-16 pt-4 sm:pb-24">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5 sm:p-10">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mb-4 size-9 text-brand-200"
            fill="currentColor"
          >
            <path d="M9.5 6C5.9 7.2 4 9.9 4 13.5V18h6v-6H7c.1-1.9 1.1-3.3 3-4l-.5-2Zm9 0C14.9 7.2 13 9.9 13 13.5V18h6v-6h-3c.1-1.9 1.1-3.3 3-4l-.5-2Z" />
          </svg>
          <div className="flex flex-col gap-5 text-base leading-relaxed text-foreground sm:text-lg">
            <p>
              JaygaLagbe.com was created with a simple vision: to make property
              discovery and advertising easier, more accessible, and more
              convenient for people across Bangladesh.
            </p>
            <p className="text-muted-foreground">
              Our goal is to connect property owners, buyers, sellers,
              landlords, and tenants through a modern online platform where
              people can discover property opportunities more easily.
            </p>
            <p className="text-muted-foreground">
              We believe that technology can make the property market more
              transparent, accessible, and convenient for everyone.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-600 font-heading text-base font-bold text-white"
            >
              {FOUNDER.initials}
            </span>
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold text-neutral-900">
                — {FOUNDER.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {FOUNDER.role}
              </span>
              <span className="text-sm text-muted-foreground">
                {FOUNDER.company}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
          <Link href="/about" className="text-brand-700 hover:underline">
            About JaygaLagbe.com →
          </Link>
          <Link href="/contact" className="text-brand-700 hover:underline">
            Get in touch →
          </Link>
        </div>
      </section>
    </main>
  );
}
