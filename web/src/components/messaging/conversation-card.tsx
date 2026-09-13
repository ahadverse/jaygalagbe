import Link from "next/link";

export function ConversationCard({
  href,
  name,
  adTitle,
  preview,
}: {
  href: string;
  name: string;
  adTitle: string;
  preview?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5 transition-[transform,box-shadow] duration-200 ease-soft hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
    >
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-sm font-bold text-brand-800"
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-heading text-sm font-bold text-foreground">
            {name}
          </span>
          <span className="truncate text-xs text-subtle-foreground">
            {adTitle}
          </span>
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {preview ?? "No messages yet"}
        </span>
      </span>

      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-4 shrink-0 text-neutral-300 transition-[color,transform] duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}
