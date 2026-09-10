"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Select } from "@/components/ui";
import { purchaseBoostAction, type BoostFormState } from "@/lib/boost/actions";
import { boostTiers, paymentGateways } from "@/lib/boost/config";
import { formatPrice } from "@/lib/format";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
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
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="adId" value={adId} />
      <Select name="tier" label="Boost duration">
        {boostTiers.map((tier) => (
          <option key={tier.value} value={tier.value}>
            {tier.label} — {formatPrice(tier.priceBdt)}
          </option>
        ))}
      </Select>
      <Select name="gateway" label="Payment method">
        {paymentGateways.map((gateway) => (
          <option key={gateway.value} value={gateway.value}>
            {gateway.label}
          </option>
        ))}
      </Select>
      {state.error && <p className="text-sm text-danger-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
