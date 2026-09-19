"use client";

import { useState } from "react";
import { Select } from "@/components/ui";
import {
  DIVISION_NAMES,
  districtsOf,
  thanasOf,
} from "@/lib/locations/bd-geo";

/**
 * Division → district → thana. Picking a level clears everything below it, so
 * the form can never submit a district that does not sit in its division.
 */
export function LocationPicker({
  division: initialDivision,
  district: initialDistrict,
  thana: initialThana,
}: {
  division?: string | null;
  district?: string | null;
  thana?: string | null;
}) {
  const [division, setDivision] = useState(initialDivision ?? "");
  const [district, setDistrict] = useState(initialDistrict ?? "");
  const [thana, setThana] = useState(initialThana ?? "");

  const districts = districtsOf(division);
  const thanas = thanasOf(division, district);

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Select
        name="locationDivision"
        label="Division"
        value={division}
        required
        onChange={(event) => {
          setDivision(event.target.value);
          setDistrict("");
          setThana("");
        }}
      >
        <option value="" disabled>
          Select division
        </option>
        {DIVISION_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>

      <Select
        name="locationDistrict"
        label="District"
        value={district}
        required
        disabled={districts.length === 0}
        onChange={(event) => {
          setDistrict(event.target.value);
          setThana("");
        }}
      >
        <option value="" disabled>
          {division ? "Select district" : "Pick a division first"}
        </option>
        {districts.map((entry) => (
          <option key={entry.name} value={entry.name}>
            {entry.name}
          </option>
        ))}
      </Select>

      <Select
        name="locationArea"
        label="Thana / Upazila"
        value={thana}
        required
        disabled={thanas.length === 0}
        onChange={(event) => setThana(event.target.value)}
      >
        <option value="" disabled>
          {district ? "Select thana" : "Pick a district first"}
        </option>
        {thanas.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </Select>
    </div>
  );
}
