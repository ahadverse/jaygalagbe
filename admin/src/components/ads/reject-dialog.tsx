import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select, Textarea } from '@/components/ui/field';
import { REJECTION_REASONS, type RejectionReasonCode } from '@/lib/ads/labels';
import { useRejectAd } from '@/lib/ads/mutations';

type Submit = (
  reasonCode: RejectionReasonCode,
  note: string | undefined,
) => Promise<unknown>;

function RejectForm({
  adTitle,
  bulk,
  onSubmit,
  onClose,
}: {
  adTitle: string;
  bulk: boolean;
  onSubmit: Submit;
  onClose: () => void;
}) {
  const [reasonCode, setReasonCode] = useState<RejectionReasonCode>(
    REJECTION_REASONS[0].code,
  );
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const noteRequired = reasonCode === 'OTHER';
  const canSubmit = !noteRequired || note.trim().length > 0;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await onSubmit(reasonCode, note.trim() || undefined);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={bulk ? 'Reject these ads' : 'Reject this ad'}
      description={adTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => void submit()}
            loading={busy}
            disabled={!canSubmit}
          >
            {bulk ? 'Reject all' : 'Reject ad'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {bulk && (
          <p className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
            The same reason and note go to every selected advertiser. Anything
            that has already been decided is skipped and reported back.
          </p>
        )}

        <Select
          label="Reason code"
          value={reasonCode}
          onChange={(event) =>
            setReasonCode(event.target.value as RejectionReasonCode)
          }
        >
          {REJECTION_REASONS.map((reason) => (
            <option key={reason.code} value={reason.code}>
              {reason.label}
            </option>
          ))}
        </Select>

        <Textarea
          label={noteRequired ? 'Note (required)' : 'Note (optional)'}
          value={note}
          maxLength={500}
          onChange={(event) => setNote(event.target.value)}
          placeholder="What does the advertiser need to change before resubmitting?"
          hint={`${note.length}/500 · The advertiser sees this reason.`}
        />
      </div>
    </Modal>
  );
}

/**
 * Rejecting one ad or a whole selection. `onSubmit` switches it to bulk mode;
 * without it the dialog rejects the single `adId` itself.
 */
export function RejectDialog({
  adId,
  adTitle,
  onClose,
  onSubmit,
}: {
  adId: string | null;
  adTitle: string;
  onClose: () => void;
  onSubmit?: Submit;
}) {
  const reject = useRejectAd();
  if (adId === null) return null;

  return (
    <RejectForm
      // Remount per target so the reason resets between ads.
      key={adId}
      adTitle={adTitle}
      bulk={onSubmit !== undefined}
      onSubmit={
        onSubmit ??
        ((reasonCode, note) => reject.mutateAsync({ adId, reasonCode, note }))
      }
      onClose={onClose}
    />
  );
}
