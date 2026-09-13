const steps = [
  {
    step: "01",
    title: "Browse & filter",
    description:
      "Search Jayga Jomi or Basha Bhara listings by location, price, and size — no account needed.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="m20 20-3.5-3.5" />
      </>
    ),
  },
  {
    step: "02",
    title: "Message the advertiser",
    description:
      "Create a free account to unlock direct, real-time chat with the person behind the listing.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z"
      />
    ),
  },
  {
    step: "03",
    title: "Close with confidence",
    description:
      "Every ad is manually reviewed before it goes live, so you're never chasing a fake listing.",
    icon: (
      <>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3.5 19 6v6c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5V6l7-2.5Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2.2 2.2L15.5 10" />
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="grain relative overflow-hidden border-t border-border bg-gradient-to-b from-background to-brand-50/60">
      <div className="shell py-16 sm:py-24">
        <div className="mb-12 flex max-w-xl flex-col gap-3 sm:mb-16">
          <p className="eyebrow text-brand-700">How it works</p>
          <h2 className="font-heading text-title text-neutral-900">
            From search to conversation in three steps
          </h2>
          <p className="measure text-base text-muted-foreground">
            No brokers in the middle, no paywall on browsing — just verified
            listings and a direct line to the owner.
          </p>
        </div>

        <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {steps.map((item, index) => (
            <li key={item.step} className="relative flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-card text-brand-700 shadow-sm ring-1 ring-neutral-900/5">
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.7}
                  >
                    {item.icon}
                  </svg>
                </span>
                {/* Rule links the steps into a sequence on wide screens. */}
                {index < steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-px flex-1 bg-gradient-to-r from-brand-200 to-transparent sm:block"
                  />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <p className="numeric eyebrow text-brand-600">{item.step}</p>
                <h3 className="font-heading text-lg font-bold tracking-tight text-neutral-900">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
