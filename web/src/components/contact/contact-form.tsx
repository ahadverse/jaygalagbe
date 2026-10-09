"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button, Input, Select, Textarea } from "@/components/ui";
import {
  sendContactMessageAction,
  type ContactFormState,
} from "@/lib/contact/actions";

const topics = [
  { value: "general", label: "General question" },
  { value: "listing", label: "A listing on the site" },
  { value: "advertising", label: "Posting or boosting an ad" },
  { value: "account", label: "My account" },
  { value: "report", label: "Report a problem" },
  { value: "other", label: "Something else" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, formAction] = useActionState<ContactFormState, FormData>(
    sendContactMessageAction,
    {},
  );

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-50 text-success-700">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-7"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h3 className="font-heading text-xl font-bold text-neutral-900">
          Message received
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thank you for reaching out. Our team will get back to you using the
          email or phone number you gave, usually within one working day.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="name"
          label="Full name"
          placeholder="Your name"
          autoComplete="name"
          required
          maxLength={80}
        />
        <Select name="topic" label="What is this about?" defaultValue="general">
          {topics.map((topic) => (
            <option key={topic.value} value={topic.value}>
              {topic.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="you@example.com"
          autoComplete="email"
          maxLength={120}
        />
        <Input
          name="phone"
          type="tel"
          label="Phone"
          placeholder="01XXXXXXXXX"
          autoComplete="tel"
          maxLength={20}
        />
      </div>
      <p className="-mt-2 text-xs text-subtle-foreground">
        Give at least one of email or phone so we can reply.
      </p>
      <Textarea
        name="message"
        label="Your message"
        placeholder="Tell us how we can help. If it's about an ad, include the ad link."
        rows={6}
        required
        minLength={10}
        maxLength={2000}
      />
      {state.error && <Alert>{state.error}</Alert>}
      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
