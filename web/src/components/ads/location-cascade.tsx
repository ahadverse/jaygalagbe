"use client";

import { useEffect, useState } from "react";
import { Input, Select } from "@/components/ui";
import { CountrySelect } from "./country-select";
import { BANGLADESH_ISO2, type Country } from "@/lib/locations/countries";
import { DIVISION_NAMES, districtsOf, thanasOf } from "@/lib/locations/bd-geo";
import { fetchCities, fetchStates, type CityIndex, type GeoState } from "@/lib/locations/geo";

export type LocationCascadeValue = {
  country?: string | null;
  countryCode?: string | null;
  division?: string | null;
  district?: string | null;
  area?: string | null;
};

/**
 * Country → division/state → district (Bangladesh only) → thana/city.
 *
 * Bangladesh renders the existing curated division/district/thana cascade
 * (richer than the worldwide dataset, which only goes two levels below the
 * country) with zero network requests. Every other country fetches its
 * state list and city index from `public/geo` on demand and falls back to a
 * free-text city field wherever that country has no city data to offer.
 *
 * Used both on the post-ad form (`required`) and the browse filters
 * (optional, every level defaults to "any").
 */
export function LocationCascade({
  required = false,
  value,
}: {
  required?: boolean;
  value?: LocationCascadeValue;
}) {
  const [countryCode, setCountryCode] = useState(
    value?.countryCode || (required ? BANGLADESH_ISO2 : ""),
  );
  const [division, setDivision] = useState(value?.division ?? "");
  const [district, setDistrict] = useState(value?.district ?? "");
  const [area, setArea] = useState(value?.area ?? "");

  const isBangladesh = countryCode === BANGLADESH_ISO2;

  const [states, setStates] = useState<GeoState[]>([]);
  const [cities, setCities] = useState<CityIndex>({});

  useEffect(() => {
    if (isBangladesh || !countryCode) {
      setStates([]);
      setCities({});
      return;
    }
    let cancelled = false;
    Promise.all([fetchStates(countryCode), fetchCities(countryCode)]).then(
      ([nextStates, nextCities]) => {
        if (cancelled) return;
        setStates(nextStates);
        setCities(nextCities);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [countryCode, isBangladesh]);

  function selectCountry(country: Country) {
    setCountryCode(country.iso2);
    setDivision("");
    setDistrict("");
    setArea("");
  }

  // Bangladesh cascade
  const bdDistricts = districtsOf(division);
  const bdThanas = thanasOf(division, district);

  // Worldwide cascade
  const hasStates = states.length > 0;
  const cityOptions = hasStates ? (cities[division] ?? []) : [];
  const cityIsFreeText =
    !!countryCode && !isBangladesh && (hasStates ? !!division : true) && cityOptions.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <CountrySelect
        name="locationCountry"
        label="Country"
        required={required}
        value={countryCode}
        onChange={selectCountry}
      />

      {isBangladesh ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Select
            name="locationDivision"
            label="Division"
            value={division}
            required={required}
            onChange={(event) => {
              setDivision(event.target.value);
              setDistrict("");
              setArea("");
            }}
          >
            <option value="" disabled={required}>
              {required ? "Select division" : "Any division"}
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
            required={required}
            disabled={bdDistricts.length === 0}
            onChange={(event) => {
              setDistrict(event.target.value);
              setArea("");
            }}
          >
            <option value="" disabled={required}>
              {!division
                ? "Pick a division first"
                : required
                  ? "Select district"
                  : "Any district"}
            </option>
            {bdDistricts.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
              </option>
            ))}
          </Select>

          <Select
            name="locationArea"
            label="Thana / Upazila"
            value={area}
            required={required}
            disabled={bdThanas.length === 0}
            onChange={(event) => setArea(event.target.value)}
          >
            <option value="" disabled={required}>
              {!district
                ? "Pick a district first"
                : required
                  ? "Select thana"
                  : "Any thana"}
            </option>
            {bdThanas.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Bangladesh-only field; blank everywhere else so a stray value
           * never gets submitted for a country that has no district tier. */}
          <input type="hidden" name="locationDistrict" value="" />

          {hasStates && (
            <Select
              name="locationDivision"
              label="State / Province"
              value={division}
              required={required}
              disabled={!countryCode}
              onChange={(event) => {
                setDivision(event.target.value);
                setArea("");
              }}
            >
              <option value="" disabled={required}>
                {required ? "Select state" : "Any state"}
              </option>
              {states.map((state) => (
                <option key={state.code} value={state.name}>
                  {state.name}
                </option>
              ))}
            </Select>
          )}

          {cityIsFreeText ? (
            <Input
              name="locationArea"
              label="City"
              value={area}
              required={required}
              placeholder="e.g. New York"
              onChange={(event) => setArea(event.target.value)}
            />
          ) : (
            <Select
              name="locationArea"
              label="City"
              value={area}
              required={required}
              disabled={!countryCode || (hasStates && !division)}
              onChange={(event) => setArea(event.target.value)}
            >
              <option value="" disabled={required}>
                {!countryCode
                  ? "Pick a country first"
                  : hasStates && !division
                    ? "Pick a state first"
                    : required
                      ? "Select city"
                      : "Any city"}
              </option>
              {cityOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          )}
        </div>
      )}
    </div>
  );
}
