"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { registerAction, type AuthFormState } from "@/lib/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : "Create account"}
    </Button>
  );
}

export function RegisterForm({
  from,
  visitId,
}: {
  from?: string;
  visitId?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    registerAction,
    {},
  );
  const query = from
    ? `?from=${encodeURIComponent(from)}${
        visitId ? `&visitId=${encodeURIComponent(visitId)}` : ""
      }`
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {from && <input type="hidden" name="from" value={from} />}
      {visitId && <input type="hidden" name="visitId" value={visitId} />}
      <Input name="name" label="Full name" autoComplete="name" required />
      <Input
        name="identifier"
        label="Email or phone"
        placeholder="you@example.com"
        autoComplete="username"
        required
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      {state.error && <p className="text-sm text-danger-600">{state.error}</p>}
      <SubmitButton />
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href={`/login${query}`}
          className="font-medium text-primary hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
