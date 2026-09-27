// Mirrors web/src/lib/analytics/session-id.ts's role (a stable id sent with
// visit pings so the backend can correlate repeat visits) but stays
// in-memory rather than persisted: the backend never uses sessionId for
// dedup/validation (it's just stored on the AdVisit row), and AsyncStorage
// isn't a dependency yet - it lands with the saved/recently-viewed commit.
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

let sessionId: string | null = null;

export function getSessionId(): string {
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  return sessionId;
}
