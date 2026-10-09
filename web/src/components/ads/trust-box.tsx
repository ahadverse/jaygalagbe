function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="mt-0.5 size-4 shrink-0 text-success-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/**
 * What the moderation queue does and does not vouch for. It says "reviewed",
 * never "verified": nobody here has checked the deed.
 */
export function TrustBox({ isLive }: { isLive: boolean }) {
  return (
    <section
      aria-labelledby="trust-box-heading"
      className="overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-neutral-900/5"
    >
      <h2
        id="trust-box-heading"
        className="flex items-center gap-2 border-b border-border px-5 py-3.5 font-heading text-sm font-bold tracking-tight text-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4 text-brand-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        Jayga Lagbe review
      </h2>
      <div className="flex flex-col gap-3 px-5 py-4">
        <ul className="flex flex-col gap-2 text-sm text-foreground">
          <li className="flex gap-2.5">
            <Check />
            Listing reviewed before publication
          </li>
          <li className="flex gap-2.5">
            <Check />
            Advertiser information submitted to Jayga Lagbe
          </li>
          {isLive && (
            <li className="flex gap-2.5">
              <Check />
              Listing is currently active
            </li>
          )}
        </ul>
        <p className="rounded-lg bg-warning-50 px-3 py-2.5 text-xs leading-relaxed text-warning-800 ring-1 ring-warning-100">
          <strong className="font-semibold">Important:</strong> we review
          listings for quality and authenticity, but we do not verify ownership
          or legal status. Always visit the property and check ownership
          documents before making any payment.
        </p>
      </div>
    </section>
  );
}
