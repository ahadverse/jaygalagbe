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
    <Button type="submit" disabled={pending} className="w-full">
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
      <p className="text-sm text-success-700">
        Message sent — the advertiser will reply here soon.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="adId" value={adId} />
      <Textarea
        name="body"
        placeholder="Hi, I'm interested in this listing..."
        required
        minLength={1}
        maxLength={2000}
      />
      {state.error && <p className="text-sm text-danger-600">{state.error}</p>}
      <SendButton />
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
            href="/advertiser"
            className={buttonVariants({ variant: "outline" })}
          >
            Manage in advertiser dashboard
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
    <Card>
      <CardHeader>
        <CardTitle>Contact the advertiser</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Log in or create a free account to message the advertiser directly.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/login?${suffix}`}
            className={buttonVariants({ variant: "primary" })}
          >
            Log in
          </Link>
          <Link
            href={`/register?${suffix}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
