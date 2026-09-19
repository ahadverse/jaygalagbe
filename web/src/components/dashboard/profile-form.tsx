"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button, Input } from "@/components/ui";
import {
  updateProfileAction,
  type ProfileFormState,
} from "@/lib/auth/profile-actions";
import type { AuthUser } from "@/lib/auth/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProfileForm({ user }: { user: AuthUser }) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        name="name"
        label="Full name"
        defaultValue={user.name}
        required
        minLength={2}
        maxLength={80}
        autoComplete="name"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="email"
          type="email"
          label="Email"
          defaultValue={user.email ?? ""}
          autoComplete="email"
          hint="Used for listing decisions and alerts."
        />
        <Input
          name="phone"
          type="tel"
          label="Phone"
          defaultValue={user.phone ?? ""}
          autoComplete="tel"
          hint="Bangladeshi number, e.g. 01712345678."
        />
      </div>

      {state.error && <Alert>{state.error}</Alert>}
      {state.success && <Alert variant="success">Profile updated.</Alert>}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
