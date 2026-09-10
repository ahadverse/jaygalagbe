"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button, Textarea } from "@/components/ui";
import {
  replyToConversationAction,
  type SendMessageState,
} from "@/lib/messaging/actions";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send"}
    </Button>
  );
}

export function ReplyForm({ conversationId }: { conversationId: string }) {
  const [state, formAction] = useActionState<SendMessageState, FormData>(
    replyToConversationAction,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="conversationId" value={conversationId} />
      <Textarea
        name="body"
        placeholder="Write a reply..."
        required
        minLength={1}
        maxLength={2000}
      />
      {state.error && <p className="text-sm text-danger-600">{state.error}</p>}
      <SendButton />
    </form>
  );
}
