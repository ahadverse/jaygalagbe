import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/field';
import { useUpdateAd, type AdEditFields } from '@/lib/ads/mutations';
import type { AdDetail } from '@/lib/api/types';

/** Only the fields an admin is allowed to correct. */
type Draft = {
  title: string;
  description: string;
  price: string;
  locationDistrict: string;
  locationArea: string;
  address: string;
};

function toDraft(ad: AdDetail): Draft {
  return {
    title: ad.title,
    description: ad.description,
    price: String(ad.price),
    locationDistrict: ad.locationDistrict,
    locationArea: ad.locationArea,
    address: ad.address ?? '',
  };
}

function EditForm({ ad, onClose }: { ad: AdDetail; onClose: () => void }) {
  const initial = toDraft(ad);
  const [draft, setDraft] = useState<Draft>(initial);
  const [reason, setReason] = useState('');
  const update = useUpdateAd();

  const set = (key: keyof Draft) => (value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // Only changed fields are sent, so the audit entry lists what actually
  // moved rather than every field on the form.
  const changes: AdEditFields = {};
  for (const key of Object.keys(initial) as (keyof Draft)[]) {
    if (draft[key] === initial[key]) continue;
    if (key === 'price') {
      changes.price = Number(draft.price);
    } else {
      changes[key] = draft[key];
    }
  }

  const changedKeys = Object.keys(changes);
  const priceValid =
    changes.price === undefined ||
    (Number.isFinite(changes.price) && changes.price >= 0);
  const canSave = changedKeys.length > 0 && priceValid;

  async function submit() {
    if (!canSave) return;
    await update.mutateAsync({ adId: ad.id, changes, reason });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="panel"
      title="Edit listing"
      description={ad.id}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={update.isPending}
            disabled={!canSave}
            onClick={() => void submit()}
          >
            {changedKeys.length > 0
              ? `Save ${changedKeys.length} change${changedKeys.length === 1 ? '' : 's'}`
              : 'Save'}
          </Button>
        </>
      }
    >
      <p className="rounded-md border border-info-200 bg-info-50 px-3 py-2 text-xs text-info-700">
        An admin edit does not send a live listing back for review, and the
        advertiser is not notified. Before and after values are recorded in the
        audit log.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <Input
          label="Title"
          value={draft.title}
          maxLength={120}
          onChange={(event) => set('title')(event.target.value)}
        />

        <Input
          label="Price (৳)"
          type="number"
          min={0}
          value={draft.price}
          onChange={(event) => set('price')(event.target.value)}
          hint={priceValid ? undefined : 'Enter a number of 0 or more.'}
        />

        <Input
          label="District"
          value={draft.locationDistrict}
          maxLength={80}
          onChange={(event) => set('locationDistrict')(event.target.value)}
          hint="Must be a real division/district/thana combination."
        />

        <Input
          label="Area (thana)"
          value={draft.locationArea}
          maxLength={80}
          onChange={(event) => set('locationArea')(event.target.value)}
        />

        <Input
          label="Address"
          value={draft.address}
          maxLength={255}
          onChange={(event) => set('address')(event.target.value)}
        />

        <Textarea
          label="Description"
          value={draft.description}
          rows={6}
          maxLength={5000}
          onChange={(event) => set('description')(event.target.value)}
          hint={`${draft.description.length}/5000`}
        />

        <Textarea
          label="Why are you editing this? (optional)"
          value={reason}
          rows={2}
          maxLength={300}
          onChange={(event) => setReason(event.target.value)}
          hint="Recorded in the audit log alongside the changed values."
        />
      </div>
    </Modal>
  );
}

export function EditAdDialog({
  ad,
  onClose,
}: {
  ad: AdDetail | null;
  onClose: () => void;
}) {
  // Mounted with the ad, so each open starts from the stored values.
  if (!ad) return null;
  return <EditForm ad={ad} onClose={onClose} />;
}
