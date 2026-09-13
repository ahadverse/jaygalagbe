"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";
import { upsertReviewAction, type ReviewFormState } from "@/lib/reviews/actions";

const ratings = [1, 2, 3, 4, 5];

function SubmitButton({ hasExisting }: { hasExisting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" loading={pending}>
      {pending ? "Saving…" : hasExisting ? "Update review" : "Submit review"}
    </Button>
  );
}

export function ReviewForm({
  advertiserId,
  existingRating,
  existingComment,
}: {
  advertiserId: string;
  existingRating?: number;
  existingComment?: string;
}) {
  const [state, formAction] = useActionState<ReviewFormState, FormData>(
    upsertReviewAction,
    {},
  );
  const [rating, setRating] = useState(existingRating ?? 5);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="advertiserId" value={advertiserId} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-xs font-semibold tracking-wide text-neutral-700">
          Rating
        </legend>
        {/* Radios keep the control keyboard- and screen-reader-native; the
         * stars are the visible layer on top. */}
        <div className="flex items-center gap-1">
          {ratings.map((value) => (
            <label
              key={value}
              className="group cursor-pointer rounded-md p-0.5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={value === rating}
                onChange={() => setRating(value)}
                className="sr-only"
              />
              <span className="sr-only">
                {value} star{value === 1 ? "" : "s"}
              </span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className={cn(
                  "size-7 transition-colors duration-150",
                  value <= rating ? "text-warning-500" : "text-neutral-300",
                )}
                fill="currentColor"
              >
                <path d="m12 3.6 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7 1-5.6-4.1-4 5.6-.8L12 3.6Z" />
              </svg>
            </label>
          ))}
        </div>
      </fieldset>

      <Textarea
        name="comment"
        label="Comment"
        placeholder="How was dealing with this advertiser?"
        defaultValue={existingComment}
        hint="Optional — up to 1000 characters."
        maxLength={1000}
      />

      {state.error && <Alert>{state.error}</Alert>}
      {state.success && <Alert variant="success">Review saved.</Alert>}

      <div>
        <SubmitButton hasExisting={Boolean(existingRating)} />
      </div>
    </form>
  );
}
