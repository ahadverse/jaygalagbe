"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button, Card, CardContent, buttonVariants } from "@/components/ui";
import { revealPhoneAction } from "@/lib/ads/reveal-phone";
import type { AuthUser } from "@/lib/auth/types";

/* Stand-in digits for the hidden part; the real ones never reach the client
 * until the server hands them to a signed-in user. */
const HIDDEN_DIGITS = "12345678";
const PREVIEW_LENGTH = 3;

export function PhoneReveal({
  adId,
  maskedPhone,
  currentUser,
}: {
  adId: string;
  maskedPhone: string | null | undefined;
  currentUser: AuthUser | null;
}) {
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!maskedPhone) {
    return null;
  }

  function reveal() {
    setError(null);
    startTransition(async () => {
      const result = await revealPhoneAction(adId);
      if (result.phone) setPhone(result.phone);
      else setError(result.error ?? "Couldn't load the phone number.");
    });
  }

  const from = encodeURIComponent(`/ads/${adId}`);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <span className="eyebrow text-subtle-foreground">Phone</span>
        {phone ? (
          <a
            href={`tel:${phone}`}
            className="numeric font-heading text-2xl font-bold tracking-tight text-primary"
          >
            {phone}
          </a>
        ) : (
          <p
            className="numeric font-heading text-2xl font-bold tracking-tight text-neutral-900"
            aria-label={`${maskedPhone.slice(0, PREVIEW_LENGTH)}, rest hidden`}
          >
            {maskedPhone.slice(0, PREVIEW_LENGTH)}
            <span aria-hidden="true" className="select-none blur-sm">
              {HIDDEN_DIGITS.slice(0, Math.max(maskedPhone.length - PREVIEW_LENGTH, 0))}
            </span>
          </p>
        )}

        {phone ? null : currentUser ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              loading={pending}
              onClick={reveal}
            >
              Show phone number
            </Button>
            {error && (
              <p role="alert" className="text-xs text-danger-700">
                {error}
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Log in or create a free account to see the full number.
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/register?from=${from}`}
                className={buttonVariants({ variant: "primary", className: "w-full" })}
              >
                Register to unlock
              </Link>
              <Link
                href={`/login?from=${from}`}
                className={buttonVariants({ variant: "ghost", className: "w-full" })}
              >
                Log in
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
