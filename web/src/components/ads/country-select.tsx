"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { controlClassName } from "@/components/ui/field";
import { COUNTRIES, type Country } from "@/lib/locations/countries";

const MAX_VISIBLE = 200;

/**
 * A searchable, worldwide country picker — the same list used by the
 * biyekoralagbe reference picker. Submits the country's full name (and code)
 * as hidden inputs under `name`/`${name}Code`, so it drops into a native
 * form the same way the rest of the location cascade does.
 */
export function CountrySelect({
  value,
  onChange,
  label = "Country",
  name,
  required,
}: {
  /** ISO2 of the selected country, e.g. "BD". Empty string = none chosen. */
  value: string;
  onChange: (country: Country) => void;
  label?: string;
  name?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => COUNTRIES.find((country) => country.iso2 === value),
    [value],
  );

  useEffect(() => {
    if (!open) return;
    function onClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? COUNTRIES.filter((country) => country.name.toLowerCase().includes(q))
      : COUNTRIES;
    return matches.slice(0, MAX_VISIBLE);
  }, [query]);

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1.5">
      <label
        htmlFor={name ? `${name}-trigger` : "country"}
        className="text-xs font-semibold tracking-wide text-neutral-700"
      >
        {label}
        {required && <span className="text-danger-600"> *</span>}
      </label>
      {name && (
        <>
          <input type="hidden" name={name} value={selected?.name ?? ""} />
          <input type="hidden" name={`${name}Code`} value={selected?.iso2 ?? ""} />
        </>
      )}
      <button
        type="button"
        id={name ? `${name}-trigger` : "country"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          controlClassName,
          "flex h-11 items-center justify-between gap-2 pl-3.5 pr-3.5 text-left",
        )}
      >
        <span className={cn("flex items-center gap-2 truncate", !selected && "text-subtle-foreground")}>
          {selected ? (
            <>
              <span aria-hidden="true">{selected.emoji}</span>
              {selected.name}
            </>
          ) : (
            "Select country"
          )}
        </span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={cn(
            "size-4 shrink-0 text-subtle-foreground transition-transform",
            open && "rotate-180",
          )}
        >
          <path
            d="m6 8.5 4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-border-strong bg-card shadow-lg">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="size-3.5 shrink-0 text-subtle-foreground"
            >
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="m14 14 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search countries"
              className="h-10 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-subtle-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {visible.length === 0 ? (
              <p className="px-4 py-3 text-sm text-subtle-foreground">No matches</p>
            ) : (
              visible.map((country) => {
                const isSelected = country.iso2 === value;
                return (
                  <button
                    key={country.iso2}
                    type="button"
                    onClick={() => {
                      onChange(country);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-brand-50 font-semibold text-brand-700"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span aria-hidden="true">{country.emoji}</span>
                      {country.name}
                    </span>
                    {isSelected && (
                      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 shrink-0">
                        <path
                          d="m3 8.5 3 3 7-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
