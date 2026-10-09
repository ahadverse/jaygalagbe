const safeguards = [
  {
    title: "Manually Reviewed Listings",
    body: "Every listing is reviewed before publication. Anything fake, duplicated or in the wrong sector is rejected with a reason.",
    icon: (
      <>
        <path d="M12 3.5 19 6v6c0 4.2-2.9 7.4-7 8.5-4.1-1.1-7-4.3-7-8.5V6l7-2.5Z" />
        <path d="m9 12 2.2 2.2L15.5 10" />
      </>
    ),
  },
  {
    title: "Free Property Posting",
    body: "List your property without a listing fee. You only pay if you choose to boost.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5v9M9.5 10a2.5 1.8 0 0 1 5 0c0 2-5 1.6-5 3.8a2.5 1.8 0 0 0 5 0" />
      </>
    ),
  },
  {
    title: "Direct Communication",
    body: "Connect directly with the advertiser. Messages arrive in real time inside Jayga Lagbe, so you keep the whole thread.",
    icon: (
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z" />
    ),
  },
  {
    title: "No Money Handling",
    body: "We don't handle property transaction payments between users. Always verify ownership documents before paying anyone.",
    icon: (
      <>
        <rect x="3.5" y="7" width="17" height="10.5" rx="2" />
        <circle cx="12" cy="12.2" r="2.3" />
        <path d="M4 20 20 4" />
      </>
    ),
  },
];

export function TrustBand({ liveCount }: { liveCount: number }) {
  return (
    <section aria-labelledby="trust-heading" className="shell py-16 sm:py-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="flex flex-col gap-4">
          <p className="eyebrow text-brand-700">Why Jayga Lagbe</p>
          <h2
            id="trust-heading"
            className="font-heading text-title text-neutral-900"
          >
            Every listing here was opened by a person first
          </h2>
          <p className="measure text-base leading-relaxed text-muted-foreground">
            Fake listings are the thing that makes property classifieds
            miserable, so approval is a real step and not a formality. An ad
            stays invisible until someone on our team has read it and let it
            through.
            {liveCount > 0 && (
              <>
                {" "}
                All{" "}
                <span className="numeric font-semibold text-foreground">
                  {liveCount}
                </span>{" "}
                listings live on the site right now cleared that queue.
              </>
            )}
          </p>
        </div>

        <ul className="flex flex-col gap-3">
          {safeguards.map((item) => (
            <li
              key={item.title}
              className="flex gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon}
                </svg>
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h3 className="font-heading text-sm font-bold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
