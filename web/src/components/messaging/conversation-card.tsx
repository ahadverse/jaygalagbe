import Link from "next/link";
import { cn } from "@/lib/utils";

export function ConversationCard({
  href,
  name,
  adTitle,
  preview,
  unread,
}: {
  href: string;
  name: string;
  adTitle: string;
  preview?: string;
  unread?: boolean;
}) {
  return (
    /* The link stays put and the sheet inside lifts — moving the element that
     * tracks `:hover` makes it flicker along its bottom edge. */
    <Link href={href} className="group block">
      <div
        className={cn(
          "flex items-center gap-3.5 rounded-xl bg-card p-3.5 shadow-sm ring-1 ring-neutral-900/5 transition-[transform,box-shadow] duration-200 ease-soft group-hover:-translate-y-0.5 group-hover:shadow-md group-active:translate-y-0 sm:p-4",
          unread && "ring-brand-200 bg-brand-50/40",
        )}
      >
        <span
        aria-hidden="true"
        className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-heading text-sm font-bold text-brand-800"
      >
        {name.trim().charAt(0).toUpperCase()}
        {unread && (
          <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-accent-500 ring-2 ring-card" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="truncate font-heading text-sm font-bold text-foreground">
            {name}
          </span>
          <span className="truncate text-xs text-subtle-foreground">
            {adTitle}
          </span>
        </span>
        <span
          className={cn(
            "truncate text-sm text-muted-foreground",
            unread && "font-medium text-foreground",
          )}
        >
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
      </div>
    </Link>
  );
}
