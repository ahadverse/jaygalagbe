"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Select, Textarea } from "@/components/ui";
import { upsertReviewAction, type ReviewFormState } from "@/lib/reviews/actions";

function SubmitButton({ hasExisting }: { hasExisting: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
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

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="advertiserId" value={advertiserId} />
      <div className="flex items-end gap-3">
        <Select
          name="rating"
          label="Rating"
          defaultValue={existingRating ?? 5}
          className="w-28"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value === 1 ? "" : "s"}
            </option>
          ))}
        </Select>
        <SubmitButton hasExisting={Boolean(existingRating)} />
      </div>
      <Textarea
        name="comment"
        placeholder="Optional comment"
        defaultValue={existingComment}
        maxLength={1000}
      />
      {state.error && <p className="text-sm text-danger-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-success-700">Review saved.</p>
      )}
    </form>
  );
}
