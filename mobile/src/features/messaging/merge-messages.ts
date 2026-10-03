import type { Message } from './types';

/**
 * Merges `incoming` (e.g. a polled page) into `current` by message id: new
 * ids are added, existing ones pick up a newly-set `readAt`. Returns the same
 * array reference when nothing changed so callers don't re-render or re-run
 * effects on every poll.
 */
export function mergeMessages(
  current: Message[],
  incoming: Message[],
): Message[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  let changed = false;

  for (const message of incoming) {
    const existing = byId.get(message.id);
    if (!existing) {
      byId.set(message.id, message);
      changed = true;
    } else if (!existing.readAt && message.readAt) {
      byId.set(message.id, { ...existing, readAt: message.readAt });
      changed = true;
    }
  }

  if (!changed) return current;
  return [...byId.values()].sort(
    (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
  );
}
