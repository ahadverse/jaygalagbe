const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact' });
const count = new Intl.NumberFormat('en-US');

const dateOnly = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTime = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTaka(amount: string | number): string {
  return `৳${currency.format(Number(amount))}`;
}

export function formatCompactTaka(amount: string | number): string {
  return `৳${compact.format(Number(amount))}`;
}

export function formatCount(value: number): string {
  return count.format(value);
}

export function formatDate(value: string | Date): string {
  return dateOnly.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTime.format(new Date(value));
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
];

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "3 days ago" — how long an item has been sitting in a queue. */
export function formatRelative(value: string | Date): string {
  const elapsed = new Date(value).getTime() - Date.now();

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(elapsed) >= ms) {
      return relative.format(Math.round(elapsed / ms), unit);
    }
  }
  return 'just now';
}

/** "2 mo" / "14 d" — compact queue age for a table cell. */
export function formatAge(value: string | Date): string {
  const days = Math.floor(
    (Date.now() - new Date(value).getTime()) / (24 * 60 * 60 * 1000),
  );
  if (days >= 365) return `${Math.floor(days / 365)} y`;
  if (days >= 30) return `${Math.floor(days / 30)} mo`;
  if (days >= 1) return `${days} d`;
  return 'today';
}

/** `HOUSE_RENT` → `House rent` for enum values rendered in cells and filters. */
export function humanize(value: string): string {
  const lower = value.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
