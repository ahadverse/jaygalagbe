"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Alert, Button, Input } from "@/components/ui";
import { loginAction, type AuthFormState } from "@/lib/auth/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {pending ? "Logging in…" : "Log in"}
    </Button>
  );
}

export function LoginForm({
  from,
  visitId,
}: {
  from?: string;
  visitId?: string;
}) {
  const [state, formAction] = useActionState<AuthFormState, FormData>(
    loginAction,
    {},
  );
  const query = from
    ? `?from=${encodeURIComponent(from)}${
        visitId ? `&visitId=${encodeURIComponent(visitId)}` : ""
      }`
    : "";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {from && <input type="hidden" name="from" value={from} />}
      {visitId && <input type="hidden" name="visitId" value={visitId} />}

      {state.error && <Alert>{state.error}</Alert>}

      <div className="flex flex-col gap-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-muted-foreground">
        New to Jayga Lagbe?{" "}
        <Link
          href={`/register${query}`}
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
