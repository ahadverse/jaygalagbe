"use client";

import { type ReactNode, useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Alert, Button, Input, Select, Textarea } from "@/components/ui";
import { createAdAction, updateAdAction, type AdFormState } from "@/lib/ads/actions";
import { LocationPicker } from "@/components/dashboard/location-picker";
import { sectorConfigs } from "@/lib/ads/sectors";
import type { Ad, HouseRentAttributes, LandAttributes, Sector } from "@/lib/ads/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">
      {pending ? "Saving…" : label}
    </Button>
  );
}

/* Long forms need landmarks. Each group states what it's for on the left and
 * keeps its fields in one column on the right. */
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-5 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5 sm:p-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-1.5">
        <h2 className="font-heading text-base font-bold tracking-tight text-neutral-900">
          {title}
        </h2>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
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
  const sectorName =
    sectorConfigs[sector === "LAND" ? "jayga-jomi" : "basha-bhara"].name;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={ad!.id} />}
      <input type="hidden" name="sector" value={sector} />

      <FormSection
        title="Category"
        description="Pick the sector your property belongs to. This decides which details buyers can filter on."
      >
        {isEdit ? (
          <div className="flex items-center gap-3 rounded-lg bg-muted px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-card text-brand-700 shadow-xs">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1.125rem]">
                <path
                  d="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Sector</span>
              <span className="font-heading text-sm font-bold text-foreground">
                {sectorName}
              </span>
            </div>
          </div>
        ) : (
          <Select
            label="Sector"
            value={sector}
            onChange={(event) => setSector(event.target.value as Sector)}
          >
            <option value="LAND">Jayga Jomi (Land for sale)</option>
            <option value="HOUSE_RENT">Basha Bhara (House rent)</option>
          </Select>
        )}
      </FormSection>

      <FormSection
        title="Listing details"
        description="A specific title and an honest description get far more replies than a generic one."
      >
        <Input
          name="title"
          label="Title"
          defaultValue={ad?.title}
          minLength={5}
          maxLength={150}
          placeholder={
            sector === "LAND"
              ? "e.g. 5 katha corner plot, Bashundhara Block C"
              : "e.g. 3 bed flat with lift, Dhanmondi 27"
          }
          hint="5–150 characters."
          required
        />
        <Textarea
          name="description"
          label="Description"
          defaultValue={ad?.description}
          minLength={20}
          rows={6}
          placeholder="Describe the property, the surrounding area, road access, and what paperwork is ready."
          hint="At least 20 characters."
          required
        />
        <Input
          name="price"
          type="number"
          inputMode="numeric"
          min={0}
          label={sector === "LAND" ? "Asking price" : "Monthly rent"}
          adornment="৳"
          defaultValue={ad ? String(ad.price) : undefined}
          className="numeric"
          required
        />
      </FormSection>

      <FormSection
        title="Location"
        description="Pick the division, then the district, then the thana — buyers browse in that order."
      >
        <LocationPicker
          division={ad?.locationDivision}
          district={ad?.locationDistrict}
          thana={ad?.locationArea}
        />
        <Input
          name="address"
          label="Address"
          placeholder="Road, block, or landmark"
          hint="Optional — shown on the listing page."
          defaultValue={ad?.address ?? undefined}
        />
      </FormSection>

      <FormSection
        title="Property details"
        description="These feed the filters on the listing page, so fill them in accurately."
      >
        {sector === "LAND" ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="sizeKatha"
              type="number"
              step="0.5"
              inputMode="decimal"
              min={0}
              label="Size (katha)"
              defaultValue={landAttrs?.sizeKatha}
              className="numeric"
              required
            />
            <Select
              name="propertyType"
              label="Property type"
              defaultValue={landAttrs?.propertyType ?? ""}
            >
              <option value="">Select type</option>
              {sectorConfigs["jayga-jomi"].propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="bedrooms"
                type="number"
                inputMode="numeric"
                min={0}
                label="Bedrooms"
                defaultValue={houseAttrs?.bedrooms}
                className="numeric"
                required
              />
              <Input
                name="bathrooms"
                type="number"
                inputMode="numeric"
                min={0}
                label="Bathrooms"
                hint="Optional."
                defaultValue={houseAttrs?.bathrooms}
                className="numeric"
              />
              <Select
                name="propertyType"
                label="Property type"
                defaultValue={houseAttrs?.propertyType ?? ""}
              >
                <option value="">Select type</option>
                {sectorConfigs["basha-bhara"].propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border-strong bg-card p-3.5 transition-colors hover:border-brand-300 hover:bg-brand-50/50">
              <input
                type="checkbox"
                name="furnished"
                defaultChecked={houseAttrs?.furnished}
                className="mt-0.5 size-[1.125rem] shrink-0 rounded border-neutral-400 accent-brand-700"
              />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  Furnished
                </span>
                <span className="text-xs text-muted-foreground">
                  Tick if beds, wardrobes, and basic appliances are included.
                </span>
              </span>
            </label>
          </>
        )}
      </FormSection>

      {state.error && <Alert>{state.error}</Alert>}

      {/* Actions stay reachable without scrolling back down a long form. */}
      <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-3 rounded-t-2xl border-t border-border bg-background/90 px-1 py-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {isEdit
            ? "Edited ads are re-checked before they return to the listings."
            : "Your ad goes to review first — usually approved within a day."}
        </p>
        <SubmitButton label={isEdit ? "Save changes" : "Submit for review"} />
      </div>
    </form>
  );
}
