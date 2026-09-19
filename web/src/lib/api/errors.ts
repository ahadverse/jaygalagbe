/** Pulls the first readable line out of a Nest error body. */
export function extractErrorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
    if (typeof message === "string") {
      return message;
    }
  }
  return fallback;
}

export async function readError(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = await response.json().catch(() => null);
  return extractErrorMessage(body, fallback);
}
