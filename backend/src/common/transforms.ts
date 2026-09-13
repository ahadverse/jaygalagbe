import { Transform } from 'class-transformer';

/**
 * Accepts both `?status=LIVE&status=SOLD` and `?status=LIVE,SOLD`, always
 * yielding a de-duplicated string array (or `undefined` when empty).
 */
export function ToStringArray() {
  return Transform(({ value }: { value: unknown }) => {
    const raw = Array.isArray(value) ? value : [value];
    const items = raw
      .flatMap((entry) => String(entry ?? '').split(','))
      .map((entry) => entry.trim())
      .filter(Boolean);

    return items.length > 0 ? [...new Set(items)] : undefined;
  });
}

/** Maps `true`/`false`/`1`/`0` query strings onto a real boolean. */
export function ToBoolean() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return undefined;
  });
}

/** Trims a free-text query param and drops it entirely when blank. */
export function ToTrimmedString() {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });
}
