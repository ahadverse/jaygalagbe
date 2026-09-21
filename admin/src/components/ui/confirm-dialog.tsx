import { useState } from 'react';
import { Modal } from './modal';
import { Button } from './button';

export interface ConfirmRequest {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  /** When set, the operator must type a reason before confirming. */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  /** Matches the endpoint's own minimum, so it fails here and not there. */
  reasonMinLength?: number;
  onConfirm: (reason: string) => Promise<unknown> | void;
}

function ConfirmForm({
  request,
  onClose,
}: {
  request: ConfirmRequest;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const needsReason = request.reasonLabel !== undefined;
  const minLength = request.reasonMinLength ?? 4;
  const canConfirm = !needsReason || reason.trim().length >= minLength;

  async function confirm() {
    if (!canConfirm) return;
    setBusy(true);
    try {
      await request.onConfirm(reason.trim());
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={request.title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant={request.danger ? 'danger' : 'primary'}
            loading={busy}
            disabled={!canConfirm}
            onClick={() => void confirm()}
          >
            {request.confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-foreground">
        {request.description}
      </p>

      {needsReason && (
        <label className="mt-4 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {request.reasonLabel}
          </span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            maxLength={300}
            placeholder={request.reasonPlaceholder}
            className="w-full resize-y rounded-md border border-border-strong bg-card px-2.5 py-2 text-sm text-foreground shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30"
          />
          <span className="text-[0.6875rem] text-muted-foreground">
            Recorded in the audit log. At least {minLength} characters.
          </span>
        </label>
      )}
    </Modal>
  );
}

/**
 * Confirmation for anything that is awkward to undo — a bulk take-down, a
 * suspension, closing a payment. Actions that can carry a reason collect it
 * here, because the reason is what the audit log will show later.
 *
 * The form is a child so it mounts and unmounts with the request: each open
 * starts from a clean field without an effect resetting state.
 */
export function ConfirmDialog({
  request,
  onClose,
}: {
  request: ConfirmRequest | null;
  onClose: () => void;
}) {
  if (!request) return null;
  return <ConfirmForm request={request} onClose={onClose} />;
}
