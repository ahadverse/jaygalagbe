export const API_URL = process.env.API_URL ?? "http://localhost:5000";

/** IDs the backend mints (cuid/uuid shapes). Anything else is not an ID. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export function isValidId(value: unknown): value is string {
  return typeof value === "string" && ID_PATTERN.test(value);
}

/**
 * Builds an API URL with every dynamic segment encoded, so a value that
 * reached us from a form, a route param or a request body can never walk out
 * of its path (`../admin/users`) or graft on a query string.
 */
export function apiUrl(
  template: TemplateStringsArray,
  ...segments: (string | number)[]
): string {
  const path = template.reduce(
    (acc, literal, index) =>
      index === 0
        ? literal
        : `${acc}${encodeURIComponent(String(segments[index - 1]))}${literal}`,
    "",
  );
  return `${API_URL}${path}`;
}
