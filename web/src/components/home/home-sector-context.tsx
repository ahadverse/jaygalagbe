"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export const homeSectors = [
  { value: "jayga-jomi", label: "Jayga Jomi" },
  { value: "basha-bhara", label: "Basha Bhara" },
] as const;

export type HomeSectorValue = (typeof homeSectors)[number]["value"];

type HomeSectorState = {
  sector: HomeSectorValue;
  setSector: (sector: HomeSectorValue) => void;
};

const HomeSectorContext = createContext<HomeSectorState | null>(null);

/* The hero toggle and the listings grid sit in different branches of the page
 * tree, so the choice lives here rather than in either of them. */
export function HomeSectorProvider({ children }: { children: ReactNode }) {
  const [sector, setSector] = useState<HomeSectorValue>(homeSectors[0].value);
  const value = useMemo(() => ({ sector, setSector }), [sector]);

  return (
    <HomeSectorContext.Provider value={value}>
      {children}
    </HomeSectorContext.Provider>
  );
}

export function useHomeSector(): HomeSectorState {
  const context = useContext(HomeSectorContext);
  if (!context) {
    throw new Error("useHomeSector must be used inside a HomeSectorProvider");
  }
  return context;
}
