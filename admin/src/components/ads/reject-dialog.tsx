import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Select, Textarea } from '@/components/ui/field';
import { REJECTION_REASONS, type RejectionReasonCode } from '@/lib/ads/labels';
import { useRejectAd } from '@/lib/ads/mutations';

function RejectForm({
  adId,
  adTitle,
  onClose,
}: {
  adId: string;
  adTitle: string;
  onClose: () => void;
}) {
  const reject = useRejectAd();
  const [reasonCode, setReasonCode] = useState<RejectionReasonCode>(
    REJECTION_REASONS[0].code,
  );
  const [note, setNote] = useState('');

  const noteRequired = reasonCode === 'OTHER';
  const canSubmit = !noteRequired || note.trim().length > 0;

  async function submit() {
    if (!canSubmit) return;
    await reject.mutateAsync({ adId, reasonCode, note });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Reject this ad"
      description={adTitle}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={reject.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={submit}
            loading={reject.isPending}
            disabled={!canSubmit}
          >
            Reject ad
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
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

export function RejectDialog({
  adId,
  adTitle,
  onClose,
}: {
  adId: string | null;
  adTitle: string;
  onClose: () => void;
}) {
  if (adId === null) return null;

  return (
    <RejectForm key={adId} adId={adId} adTitle={adTitle} onClose={onClose} />
  );
}
