"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  buttonVariants,
} from "@/components/ui";
import { pingVisit } from "@/lib/analytics/track";
import { sendFirstMessageAction, type SendMessageState } from "@/lib/messaging/actions";
import type { AuthUser } from "@/lib/auth/types";

function useVisitId(adId: string): string | null {
  const [visitId, setVisitId] = useState<string | null>(null);
  const pinged = useRef(false);

  useEffect(() => {
    if (pinged.current) return;
    pinged.current = true;
    void pingVisit(adId).then(setVisitId);
  }, [adId]);

  return visitId;
}

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} className="w-full">
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

function MessageForm({ adId }: { adId: string }) {
  const [state, formAction] = useActionState<SendMessageState, FormData>(
    sendFirstMessageAction,
    {},
  );

  if (state.success) {
    return (
      <div className="flex animate-fade-in flex-col items-center gap-2 rounded-lg bg-success-50 px-4 py-6 text-center ring-1 ring-success-100">
        <span className="flex size-9 items-center justify-center rounded-full bg-success-100 text-success-700">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="text-sm font-semibold text-success-800">Message sent</p>
        <p className="text-xs text-success-700">
          The advertiser will reply in your inbox.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="adId" value={adId} />
      <Textarea
        name="body"
        placeholder="Hi, I'm interested in this listing — is it still available?"
        required
        minLength={1}
        maxLength={2000}
        error={state.error}
      />
      <SendButton />
      <p className="text-2xs leading-relaxed text-subtle-foreground">
        Your name is shared with the advertiser when you send a message.
      </p>
    </form>
  );
}

export function ContactGate({
  adId,
  ownerId,
  currentUser,
}: {
  adId: string;
  ownerId: string;
  currentUser: AuthUser | null;
}) {
  const visitId = useVisitId(adId);

  if (currentUser?.id === ownerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>This is your listing</CardTitle>
        </CardHeader>
        <CardContent>
          <Link
            href="/dashboard/ads"
            className={buttonVariants({ variant: "outline", className: "w-full" })}
          >
            Manage in dashboard
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Message the advertiser</CardTitle>
        </CardHeader>
        <CardContent>
          <MessageForm adId={adId} />
        </CardContent>
      </Card>
    );
  }

  const from = `/ads/${adId}`;
  const suffix = `from=${encodeURIComponent(from)}${
    visitId ? `&visitId=${encodeURIComponent(visitId)}` : ""
  }`;

  return (
    <Card className="overflow-hidden">
      {/* Registration gate — the conversion moment, so it gets the warm tint. */}
      <div className="bg-gradient-to-br from-brand-50 to-accent-50 px-5 py-5">
        <span className="flex size-10 items-center justify-center rounded-xl bg-card text-brand-700 shadow-xs">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z" />
          </svg>
        </span>
        <p className="mt-3 font-heading text-lg font-bold tracking-tight text-neutral-900">
          Contact the advertiser
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">
          Create a free account to chat directly with the owner — no broker, no
          fee.
        </p>
      </div>
      <CardContent className="flex flex-col gap-2 pt-4">
        <Link
          href={`/register?${suffix}`}
          className={buttonVariants({ variant: "primary", className: "w-full" })}
        >
          Create free account
        </Link>
        <Link
          href={`/login?${suffix}`}
          className={buttonVariants({ variant: "ghost", className: "w-full" })}
        >
          I already have an account
        </Link>
      </CardContent>
    </Card>
  );
}
