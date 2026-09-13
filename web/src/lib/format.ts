const priceFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatPrice(price: string | number): string {
  return `৳ ${priceFormatter.format(Number(price))}`;
}

/** Digits only, so the ৳ can be typeset separately from the figure. */
export function formatAmount(price: string | number): string {
  return priceFormatter.format(Number(price));
}

const DAY = 86_400_000;

/** Listing freshness is the strongest trust signal on a classifieds card. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";

  const elapsed = Date.now() - then;
  if (elapsed < 3_600_000) {
    const minutes = Math.max(1, Math.floor(elapsed / 60_000));
    return `${minutes}m ago`;
  }
  if (elapsed < DAY) {
    return `${Math.floor(elapsed / 3_600_000)}h ago`;
  }
  if (elapsed < 7 * DAY) {
    const days = Math.floor(elapsed / DAY);
    return days === 1 ? "Yesterday" : `${days}d ago`;
  }
  if (elapsed < 60 * DAY) {
    const weeks = Math.floor(elapsed / (7 * DAY));
    return `${weeks}w ago`;
  }
  return new Date(then).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
