import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { formatDateTime } from '@/lib/format';
import type { BoostListItem } from '@/lib/api/types';

const PRESET_DAYS = ['1', '3', '7', '15'] as const;
const MAX_DAYS = 30;

function ExtendForm({
  boost,
  onClose,
  onExtend,
}: {
  boost: BoostListItem;
  onClose: () => void;
  onExtend: (days: number, reason?: string) => Promise<unknown>;
}) {
  const [days, setDays] = useState('3');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const parsed = Number(days);
  const valid = Number.isInteger(parsed) && parsed >= 1 && parsed <= MAX_DAYS;

  // Extension runs from the current end date, so nothing already paid for is
  // lost — worth showing, because "extend by 3 days" is otherwise ambiguous.
  const newEnd =
    boost.endAt && valid
      ? new Date(new Date(boost.endAt).getTime() + parsed * 86_400_000)
      : null;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    try {
      await onExtend(parsed, reason.trim() || undefined);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Extend this boost"
      description={boost.ad.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={busy}
            disabled={!valid}
            onClick={() => void submit()}
          >
            Extend
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">
            Extend by
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              label="Days to add"
              value={PRESET_DAYS.includes(days as (typeof PRESET_DAYS)[number]) ? days : ''}
              onChange={setDays}
              options={PRESET_DAYS.map((value) => ({
                value,
                label: `${value}d`,
              }))}
            />
            <label className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">or</span>
              <input
                type="number"
                min={1}
                max={MAX_DAYS}
                value={days}
                onChange={(event) => setDays(event.target.value)}
                aria-label="Custom number of days"
                className="h-9 w-20 rounded-md border border-border-strong bg-card px-2 text-sm tnum shadow-xs focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
              />
              <span className="text-xs text-muted-foreground">days</span>
            </label>
          </div>
          {!valid && (
            <p className="mt-1 text-xs text-danger-700">
              Pick between 1 and {MAX_DAYS} days.
            </p>
          )}
        </div>

        <dl className="rounded-md border border-border bg-ink-50 px-3 py-2 text-xs">
          <div className="flex justify-between gap-3 py-0.5">
            <dt className="text-muted-foreground">Currently ends</dt>
            <dd className="font-medium">
              {boost.endAt ? formatDateTime(boost.endAt) : '—'}
            </dd>
          </div>
          <div className="flex justify-between gap-3 py-0.5">
            <dt className="text-muted-foreground">New end</dt>
            <dd className="font-medium text-brand-700">
              {newEnd ? formatDateTime(newEnd) : '—'}
            </dd>
          </div>
        </dl>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Reason (optional)
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={2}
            maxLength={300}
            placeholder="Listing was down for two days after a wrongful take-down"
            className="w-full resize-y rounded-md border border-border-strong bg-card px-2.5 py-2 text-sm shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          />
          <span className="text-[0.6875rem] text-muted-foreground">
            Recorded in the audit log alongside the old and new end dates.
          </span>
        </label>
      </div>
    </Modal>
  );
}

/**
 * The form is a child so it mounts with the boost — each open starts from the
 * default extension rather than whatever was typed for the previous one.
 */
export function ExtendBoostDialog({
  boost,
  onClose,
  onExtend,
}: {
  boost: BoostListItem | null;
  onClose: () => void;
  onExtend: (days: number, reason?: string) => Promise<unknown>;
}) {
  if (!boost) return null;
  return <ExtendForm boost={boost} onClose={onClose} onExtend={onExtend} />;
}
