"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { createAdAction, updateAdAction, type AdFormState } from "@/lib/ads/actions";
import { sectorConfigs } from "@/lib/ads/sectors";
import type { Ad, HouseRentAttributes, LandAttributes, Sector } from "@/lib/ads/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function AdForm({ ad }: { ad?: Ad }) {
  const isEdit = Boolean(ad);
  const [state, formAction] = useActionState<AdFormState, FormData>(
    isEdit ? updateAdAction : createAdAction,
    {},
  );
  const [sector, setSector] = useState<Sector>(ad?.sector ?? "LAND");
  const landAttrs = ad?.attributes as LandAttributes | undefined;
  const houseAttrs = ad?.attributes as HouseRentAttributes | undefined;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={ad!.id} />}
      <input type="hidden" name="sector" value={sector} />

      {isEdit ? (
        <p className="text-sm text-muted-foreground">
          Sector: <span className="font-medium text-foreground">{sectorConfigs[sector === "LAND" ? "jayga-bikroy" : "basa-bhara"].name}</span>
        </p>
      ) : (
        <Select
          label="Sector"
          value={sector}
          onChange={(event) => setSector(event.target.value as Sector)}
        >
          <option value="LAND">Jayga Bikroy (Land for sale)</option>
          <option value="HOUSE_RENT">Basa Bhara (House rent)</option>
        </Select>
      )}

      <Input
        name="title"
        label="Title"
        defaultValue={ad?.title}
        minLength={5}
        maxLength={150}
        required
      />
      <Textarea
        name="description"
        label="Description"
        defaultValue={ad?.description}
        minLength={20}
        required
      />
      <Input
        name="price"
        type="number"
        min={0}
        label="Price (৳)"
        defaultValue={ad ? String(ad.price) : undefined}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="locationArea" label="Area" defaultValue={ad?.locationArea} required />
        <Input
          name="locationDistrict"
          label="District"
          defaultValue={ad?.locationDistrict}
          required
        />
      </div>
      <Input
        name="address"
        label="Address (optional)"
        defaultValue={ad?.address ?? undefined}
      />

      {sector === "LAND" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="sizeKatha"
            type="number"
            step="0.5"
            min={0}
            label="Size (katha)"
            defaultValue={landAttrs?.sizeKatha}
            required
          />
          <Select
            name="propertyType"
            label="Property type"
            defaultValue={landAttrs?.propertyType ?? ""}
          >
            <option value="">Select type</option>
            {sectorConfigs["jayga-bikroy"].propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="bedrooms"
            type="number"
            min={0}
            label="Bedrooms"
            defaultValue={houseAttrs?.bedrooms}
            required
          />
          <Input
            name="bathrooms"
            type="number"
            min={0}
            label="Bathrooms (optional)"
            defaultValue={houseAttrs?.bathrooms}
          />
          <Select
            name="propertyType"
            label="Property type"
            defaultValue={houseAttrs?.propertyType ?? ""}
          >
            <option value="">Select type</option>
            {sectorConfigs["basa-bhara"].propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 pt-6 text-sm text-foreground">
            <input
              type="checkbox"
              name="furnished"
              defaultChecked={houseAttrs?.furnished}
              className="h-4 w-4 rounded border-border"
            />
            Furnished
          </label>
        </div>
      )}

      {state.error && <p className="text-sm text-danger-600">{state.error}</p>}
      <SubmitButton label={isEdit ? "Save changes" : "Submit for review"} />
    </form>
  );
}
