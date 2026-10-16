// Data by Countries States Cities Database
// https://github.com/dr5hn/countries-states-cities-database | ODbL v1.0
//
// Jayga Lagbe only serves Bangladesh today — this list exists so the listing
// form's Country field can show the real world rather than a single fixed
// value, while every option but Bangladesh stays disabled. See
// `CountrySelect` in `@/components/dashboard/country-select`.
import countriesData from "./countries.json";

export interface Country {
  iso2: string;
  name: string;
  emoji: string;
}

export const BANGLADESH_ISO2 = "BD";

export const COUNTRIES: Country[] = countriesData;
