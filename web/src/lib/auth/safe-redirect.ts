/**
 * `from` reaches us straight from a query string, so it is only honoured when
 * it is a path on this site. Protocol-relative (`//evil.com`), backslash and
 * absolute URLs all fall back to the default.
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value || !value.startsWith("/")) {
    return fallback;
  }
  if (value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
