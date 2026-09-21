"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button, Textarea, buttonVariants } from "@/components/ui";
import { reportAdAction, type ReportAdState } from "@/lib/reports/actions";
import {
  REPORT_NOTE_MAX,
  REPORT_REASONS,
  type ReportReasonCode,
} from "@/lib/reports/reasons";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/auth/types";

function FlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21V4M5 4.5h10.5l-1.5 3.5 1.5 3.5H5" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" loading={pending} className="w-full">
      {pending ? "Sending…" : "Send report"}
    </Button>
  );
}

function ReportForm({
  adId,
  onDone,
}: {
  adId: string;
  onDone: () => void;
}) {
  const [state, formAction] = useActionState<ReportAdState, FormData>(
    reportAdAction,
    {},
  );
  const [reasonCode, setReasonCode] = useState<ReportReasonCode>(
    REPORT_REASONS[0].code,
  );
  const [note, setNote] = useState("");

  const reason = REPORT_REASONS.find((entry) => entry.code === reasonCode);
  const noteRequired = reasonCode === "OTHER";

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-success-100 text-success-700">
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
        <p className="font-heading text-base font-bold text-neutral-900">
          Report sent
        </p>
        <p className="measure text-sm leading-relaxed text-muted-foreground">
          Our moderators will review this listing. You will not be told who
          reported it, and the advertiser is not shown your name.
        </p>
        <Button variant="outline" onClick={onDone} className="mt-2">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 px-5 pb-5">
      <input type="hidden" name="adId" value={adId} />
      <input type="hidden" name="reasonCode" value={reasonCode} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-foreground">
          What is wrong with this listing?
        </legend>
        {REPORT_REASONS.map((entry) => (
          <label
            key={entry.code}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
              entry.code === reasonCode
                ? "border-brand-300 bg-brand-50"
                : "border-border hover:border-border-strong hover:bg-muted",
            )}
          >
            <input
              type="radio"
              name="reasonChoice"
              value={entry.code}
              checked={entry.code === reasonCode}
              onChange={() => setReasonCode(entry.code)}
              className="mt-0.5 size-4 shrink-0 accent-brand-700"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                {entry.label}
              </span>
              <span className="block text-xs leading-relaxed text-muted-foreground">
                {entry.hint}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <Textarea
        name="note"
        label={noteRequired ? "What happened?" : "Anything to add? (optional)"}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={3}
        maxLength={REPORT_NOTE_MAX}
        required={noteRequired}
        placeholder={reason?.hint}
        hint={`${note.length}/${REPORT_NOTE_MAX}`}
        error={state.error}
      />

      <SubmitButton />
      <p className="text-2xs leading-relaxed text-subtle-foreground">
        Reports go to our moderation team only. Misusing this to harass an
        advertiser can get your own account suspended.
      </p>
    </form>
  );
}

/** Modal shell — portalled so the sidebar's rounded cards cannot clip it. */
function ReportDialog({
  adId,
  adTitle,
  onClose,
}: {
  adId: string;
  adTitle: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      opener?.focus?.();
    };
  }, []);

  // Only ever mounted from a click, so `document` is always there to portal into.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex animate-fade-in items-end justify-center bg-neutral-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-dialog-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card shadow-xl outline-none ring-1 ring-neutral-900/10 sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="report-dialog-title"
              className="font-heading text-lg font-bold tracking-tight text-neutral-900"
            >
              Report this listing
            </h2>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {adTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <ReportForm adId={adId} onDone={onClose} />
      </div>
    </div>,
    document.body,
  );
}

const triggerClassName =
  "inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-danger-50 hover:text-danger-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500";

export function ReportAdButton({
  adId,
  adTitle,
  ownerId,
  status,
  currentUser,
}: {
  adId: string;
  adTitle: string;
  ownerId: string;
  status: string;
  currentUser: AuthUser | null;
}) {
  const [open, setOpen] = useState(false);

  // Nothing to report on a listing that is already off the marketplace, and
  // the backend refuses a report on your own ad — so neither offers it.
  if (status !== "LIVE" || currentUser?.id === ownerId) {
    return null;
  }

  if (!currentUser) {
    return (
      <Link
        href={`/login?from=${encodeURIComponent(`/ads/${adId}`)}`}
        className={cn(buttonVariants({ variant: "ghost" }), triggerClassName)}
      >
        <FlagIcon className="size-4" />
        Log in to report this listing
      </Link>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <FlagIcon className="size-4" />
        Report this listing
      </button>
      {open && (
        <ReportDialog
          adId={adId}
          adTitle={adTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
