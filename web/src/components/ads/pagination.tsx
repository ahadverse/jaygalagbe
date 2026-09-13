import Link from "next/link";
import { cn } from "@/lib/utils";

const arrowClassName =
  "inline-flex size-10 items-center justify-center rounded-full border border-border-strong bg-card text-foreground shadow-xs transition-colors duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800";

/* Windowed page list so 40 pages don't turn into 40 tap targets on a phone. */
function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  if (page - 1 > 1) pages.add(page - 1);
  if (page + 1 < totalPages) pages.add(page + 1);
  if (page <= 3) pages.add(2).add(3).add(4);
  if (page >= totalPages - 2) {
    pages.add(totalPages - 1).add(totalPages - 2).add(totalPages - 3);
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) result.push("gap");
    result.push(value);
  });
  return result;
}

export function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-label="Previous page"
        aria-disabled={page === 1}
        tabIndex={page === 1 ? -1 : undefined}
        className={cn(arrowClassName, page === 1 && "pointer-events-none opacity-40")}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m14 6-6 6 6 6" />
        </svg>
      </Link>

      <div className="flex flex-wrap items-center gap-1">
        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <span
              key={`gap-${index}`}
              aria-hidden="true"
              className="px-1 text-sm text-subtle-foreground"
            >
              …
            </span>
          ) : (
            <Link
              key={entry}
              href={buildHref(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? "page" : undefined}
              className={cn(
                "numeric flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors duration-150",
                entry === page
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {entry}
            </Link>
          ),
        )}
      </div>

      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        aria-disabled={page === totalPages}
        tabIndex={page === totalPages ? -1 : undefined}
        className={cn(
          arrowClassName,
          page === totalPages && "pointer-events-none opacity-40",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m10 6 6 6-6 6" />
        </svg>
      </Link>
    </nav>
  );
}
