import type { ReactNode } from "react";

export type LegalBlock =
  | { type: "p"; text: ReactNode }
  | { type: "h3"; text: string }
  | { type: "list"; items: ReactNode[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export const p = (text: ReactNode): LegalBlock => ({ type: "p", text });
export const h = (text: string): LegalBlock => ({ type: "h3", text });
export const list = (...items: ReactNode[]): LegalBlock => ({
  type: "list",
  items,
});

function slug(index: number) {
  return `section-${index + 1}`;
}

/**
 * Shared layout for the long-form legal pages (Terms, Privacy): a hero, a
 * sticky table of contents on wide screens, and numbered sections.
 */
export function LegalPage({
  title,
  effectiveDate,
  intro,
  sections,
}: {
  title: string;
  effectiveDate: string;
  intro: ReactNode;
  sections: LegalSection[];
}) {
  return (
    <main className="flex-1">
      <section className="grain relative overflow-hidden bg-gradient-to-b from-brand-50 to-background">
        <div className="shell py-14 text-center sm:py-20">
          <span className="eyebrow text-brand-700">Legal</span>
          <h1 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold tracking-tight text-neutral-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective Date:{" "}
            <span className="font-semibold text-foreground">
              {effectiveDate}
            </span>
          </p>
        </div>
      </section>

      <div className="shell grid gap-10 pb-20 pt-10 sm:pt-14 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <nav
            aria-label="On this page"
            className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5 lg:sticky lg:top-24"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle-foreground">
              On this page
            </p>
            <ol className="flex flex-col gap-0.5">
              {sections.map((section, index) => (
                <li key={section.title}>
                  <a
                    href={`#${slug(index)}`}
                    className="flex gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <span className="w-5 shrink-0 text-subtle-foreground">
                      {index + 1}.
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="flex flex-col gap-8 lg:col-span-3">
          <div className="rounded-2xl bg-card p-6 text-base leading-relaxed text-foreground shadow-sm ring-1 ring-neutral-900/5 sm:p-8">
            {intro}
          </div>

          {sections.map((section, index) => (
            <section
              key={section.title}
              id={slug(index)}
              className="scroll-mt-24 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-neutral-900/5 sm:p-8"
            >
              <h2 className="flex items-center gap-3 font-heading text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-1 ring-brand-100">
                  {index + 1}
                </span>
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {section.blocks.map((block, blockIndex) =>
                  block.type === "h3" ? (
                    <h3
                      key={blockIndex}
                      className="-mb-1 mt-2 font-heading text-base font-bold text-neutral-900 sm:text-lg"
                    >
                      {block.text}
                    </h3>
                  ) : block.type === "p" ? (
                    <p key={blockIndex}>{block.text}</p>
                  ) : (
                    <ul key={blockIndex} className="flex flex-col gap-2.5">
                      {block.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-brand-500"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
