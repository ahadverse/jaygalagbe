import { Link } from 'react-router';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import {
  EmptyNote,
  IdLine,
  Row,
  Rows,
  Section,
} from '@/components/detail/detail-parts';
import {
  AUDIT_ACTION_LABEL,
  AUDIT_ACTION_TONE,
  AUDIT_TARGET_LABEL,
  targetLink,
} from '@/lib/audit/labels';
import { formatDateTime, formatRelative } from '@/lib/format';
import type { AuditEntry } from '@/lib/api/types';

/** `previousStatus` → `Previous status` */
function humanizeKey(key: string): string {
  const spaced = key.replace(/([A-Z])/g, ' $1').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function AuditDetailPanel({
  entry,
  onClose,
}: {
  entry: AuditEntry | null;
  onClose: () => void;
}) {
  const metadata = entry?.metadata
    ? Object.entries(entry.metadata).filter(
        ([, value]) => value !== null && value !== undefined && value !== '',
      )
    : [];

  const href = entry ? targetLink(entry.targetType, entry.targetId) : null;

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      variant="panel"
      title={entry ? AUDIT_ACTION_LABEL[entry.action] : 'Audit entry'}
      description={entry ? formatDateTime(entry.createdAt) : undefined}
    >
      {entry && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={AUDIT_ACTION_TONE[entry.action]}>
              {AUDIT_ACTION_LABEL[entry.action]}
            </Badge>
            <Badge tone="neutral">
              {AUDIT_TARGET_LABEL[entry.targetType]}
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-relaxed">{entry.summary}</p>

          <Section title="Who and when">
            <Rows>
              <Row label="Admin">{entry.actor.name}</Row>
              {entry.actor.email && (
                <Row label="Email">{entry.actor.email}</Row>
              )}
              <Row label="When">
                {formatDateTime(entry.createdAt)}{' '}
                <span className="font-normal text-muted-foreground">
                  ({formatRelative(entry.createdAt)})
                </span>
              </Row>
            </Rows>
          </Section>

          <Section
            title="Record"
            action={
              href && (
                <Link
                  to={href}
                  className="text-xs font-medium text-brand-600 hover:underline"
                >
                  Open {AUDIT_TARGET_LABEL[entry.targetType].toLowerCase()}
                </Link>
              )
            }
          >
            <Rows>
              <Row label="Type">
                {AUDIT_TARGET_LABEL[entry.targetType]}
              </Row>
              <Row label="ID" mono>
                {entry.targetId}
              </Row>
            </Rows>
          </Section>

          <Section title="Detail">
            {metadata.length > 0 ? (
              <Rows>
                {metadata.map(([key, value]) => (
                  <Row key={key} label={humanizeKey(key)} mono>
                    {renderValue(value)}
                  </Row>
                ))}
              </Rows>
            ) : (
              <EmptyNote>This action recorded no extra detail.</EmptyNote>
            )}
          </Section>

          <Section title="Related">
            <div className="flex flex-col gap-1.5">
              <Link
                to={`/audit-log?targetId=${encodeURIComponent(entry.targetId)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Full history of this record
              </Link>
              <Link
                to={`/audit-log?actorId=${encodeURIComponent(entry.actorId)}`}
                className="text-xs font-medium text-brand-600 hover:underline"
              >
                Everything {entry.actor.name} has done
              </Link>
            </div>
            <IdLine id={entry.id} />
          </Section>
        </>
      )}
    </Modal>
  );
}
