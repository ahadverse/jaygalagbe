// Worldwide state/city data served as static JSON from `public/geo`, sourced
// from the same dr5hn dataset as `countries.ts` (see that file's header).
// Fetched on demand per country — unlike `countries.json`, this is ~3MB
// across ~500 files, too much to bundle into every page.

export interface GeoState {
  /** Equal to `name` — state_code is absent or ambiguous for a lot of
   * countries, and the name is what gets stored on the ad anyway. */
  code: string;
  name: string;
}

/** cities/{iso2}.json: `{ [stateName]: cityNames }` for a country with
 * states, or `{}` for one of the 21 with neither states nor cities. */
export type CityIndex = Record<string, string[]>;

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(path);
    if (!response.ok) return fallback;
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export function fetchStates(iso2: string): Promise<GeoState[]> {
  return fetchJson<GeoState[]>(`/geo/states/${iso2}.json`, []);
}

export function fetchCities(iso2: string): Promise<CityIndex> {
  return fetchJson<CityIndex>(`/geo/cities/${iso2}.json`, {});
}
