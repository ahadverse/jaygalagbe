"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button } from "@/components/ui";
import { purchaseBoostAction, type BoostFormState } from "@/lib/boost/actions";
import { boostTiers, paymentGateways } from "@/lib/boost/config";
import { formatAmount } from "@/lib/format";

const tierBlurb: Record<string, string> = {
  THREE_DAY: "A quick push over the weekend.",
  SEVEN_DAY: "Most popular — a full week at the top.",
  FIFTEEN_DAY: "Best value per day for slower-moving plots.",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" loading={pending}>
      {pending ? "Redirecting to payment…" : "Continue to payment"}
    </Button>
  );
}

export function BoostForm({ adId }: { adId: string }) {
  const [state, formAction] = useActionState<BoostFormState, FormData>(
    purchaseBoostAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="adId" value={adId} />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-xs font-semibold tracking-wide text-neutral-700">
          Boost duration
        </legend>
        {boostTiers.map((tier, index) => (
          <label
            key={tier.value}
            className="group relative flex cursor-pointer items-center gap-4 rounded-xl border border-border-strong bg-card p-4 transition-[border-color,box-shadow] duration-150 hover:border-brand-300 has-[:checked]:border-accent-400 has-[:checked]:shadow-accent has-[:checked]:ring-1 has-[:checked]:ring-accent-200"
          >
            <input
              type="radio"
              name="tier"
              value={tier.value}
              defaultChecked={index === 0}
              className="size-[1.125rem] shrink-0 accent-accent-600"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-heading text-sm font-bold text-foreground">
                {tier.label} at the top
              </span>
              <span className="text-xs text-muted-foreground">
                {tierBlurb[tier.value]}
              </span>
            </span>
            <span className="numeric shrink-0 font-heading text-lg font-bold tracking-tight text-accent-700">
              ৳ {formatAmount(tier.priceBdt)}
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-xs font-semibold tracking-wide text-neutral-700">
          Payment method
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {paymentGateways.map((gateway, index) => (
            <label
              key={gateway.value}
              className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-border-strong bg-card px-2 py-3 text-center transition-[border-color] duration-150 hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
            >
              <input
                type="radio"
                name="gateway"
                value={gateway.value}
                defaultChecked={index === 0}
                className="sr-only"
              />
              <span className="text-sm font-semibold text-foreground">
                {gateway.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && <Alert>{state.error}</Alert>}

      <div className="flex flex-col gap-3">
        <SubmitButton />
        <p className="text-center text-2xs leading-relaxed text-subtle-foreground">
          Boost activates automatically once payment succeeds. Failed payments
          are never charged.
        </p>
      </div>
    </form>
  );
}
