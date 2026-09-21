import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelative } from '@/lib/format';
import { AUDIT_ACTION_LABEL, AUDIT_ACTION_TONE } from '@/lib/audit/labels';
import type { AuditEntry } from '@/lib/api/types';

export function ActivityFeed({
  entries,
  loading,
}: {
  entries: AuditEntry[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-xs text-muted-foreground">
        No admin actions recorded yet. Every approval, rejection and suspension
        will appear here.
      </p>
    );
  }

  return (
    <ul className="max-h-80 divide-y divide-border overflow-y-auto">
      {entries.map((entry) => (
        <li key={entry.id} className="px-4 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <Badge tone={AUDIT_ACTION_TONE[entry.action]}>
              {AUDIT_ACTION_LABEL[entry.action]}
            </Badge>
            <span
              className="shrink-0 text-[0.6875rem] whitespace-nowrap text-muted-foreground"
              title={new Date(entry.createdAt).toLocaleString()}
            >
              {formatRelative(entry.createdAt)}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground">
            {entry.summary}
          </p>
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground">
            by {entry.actor.name}
          </p>
        </li>
      ))}
    </ul>
  );
}
