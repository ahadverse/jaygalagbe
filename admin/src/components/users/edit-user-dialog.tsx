import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/field';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useUpdateUser, type UserEditFields } from '@/lib/ads/mutations';
import type { UserListItem } from '@/lib/api/types';

/** Only the fields an admin is allowed to correct on someone's account. */
type Draft = {
  name: string;
  email: string;
  phone: string;
  isVerified: 'true' | 'false';
};

function toDraft(user: UserListItem): Draft {
  return {
    name: user.name,
    email: user.email ?? '',
    phone: user.phone ?? '',
    isVerified: user.isVerified ? 'true' : 'false',
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EditForm({ user, onClose }: { user: UserListItem; onClose: () => void }) {
  const initial = toDraft(user);
  const [draft, setDraft] = useState<Draft>(initial);
  const [reason, setReason] = useState('');
  const update = useUpdateUser();

  const set = (key: 'name' | 'email' | 'phone') => (value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));

  // Only changed fields are sent, so the audit entry lists what actually
  // moved rather than every field on the form.
  const changes: UserEditFields = {};
  if (draft.name !== initial.name) changes.name = draft.name;
  if (draft.email !== initial.email) changes.email = draft.email;
  if (draft.phone !== initial.phone) changes.phone = draft.phone;
  if (draft.isVerified !== initial.isVerified) {
    changes.isVerified = draft.isVerified === 'true';
  }

  const changedKeys = Object.keys(changes);
  // A blank field is dropped server-side rather than clearing the column, so
  // emptying one is a no-op worth flagging here instead of silently ignoring.
  const clearedField =
    (changes.email === '' && 'Email') || (changes.phone === '' && 'Phone') || null;
  const emailValid =
    changes.email === undefined ||
    changes.email === '' ||
    EMAIL_PATTERN.test(changes.email);
  const nameValid = changes.name === undefined || changes.name.trim().length >= 2;
  const canSave =
    changedKeys.length > 0 && emailValid && nameValid && clearedField === null;

  async function submit() {
    if (!canSave) return;
    await update.mutateAsync({ userId: user.id, changes, reason });
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      variant="panel"
      title="Edit account"
      description={user.id}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={update.isPending}
          >
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
        Contact details are how this person signs in, so correcting one changes
        their login. Admin access and suspension have their own buttons. Before
        and after values are recorded in the audit log.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <Input
          label="Name"
          value={draft.name}
          maxLength={80}
          onChange={(event) => set('name')(event.target.value)}
          hint={nameValid ? undefined : 'At least 2 characters.'}
        />

        <Input
          label="Email"
          type="email"
          value={draft.email}
          onChange={(event) => set('email')(event.target.value)}
          hint={
            emailValid
              ? 'Used to sign in. Must not belong to another account.'
              : 'Enter a valid email address.'
          }
        />

        <Input
          label="Phone"
          value={draft.phone}
          maxLength={20}
          onChange={(event) => set('phone')(event.target.value)}
          hint="Used to sign in. Must not belong to another account."
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Verified
          </span>
          <SegmentedControl
            label="Verified"
            value={draft.isVerified}
            onChange={(value) =>
              setDraft((current) => ({ ...current, isVerified: value }))
            }
            options={[
              { value: 'false', label: 'Unverified' },
              { value: 'true', label: 'Verified' },
            ]}
            className="self-start"
          />
          <p className="text-xs text-muted-foreground">
            Mark an account verified by hand once you have checked the person's
            documents.
          </p>
        </div>

        <Textarea
          label="Why are you editing this? (optional)"
          value={reason}
          rows={2}
          maxLength={300}
          onChange={(event) => setReason(event.target.value)}
          hint="Recorded in the audit log alongside the changed values."
        />
      </div>

      {clearedField && (
        <p className="mt-4 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700">
          {clearedField} cannot be emptied from here — put the corrected value
          in, or restore the old one to save your other changes.
        </p>
      )}
    </Modal>
  );
}

export function EditUserDialog({
  user,
  onClose,
}: {
  user: UserListItem | null;
  onClose: () => void;
}) {
  // Mounted with the user, so each open starts from the stored values.
  if (!user) return null;
  return <EditForm user={user} onClose={onClose} />;
}
