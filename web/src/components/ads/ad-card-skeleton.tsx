import { Skeleton } from "@/components/ui";

/* Mirrors ad-card.tsx so the swap to real content is a crossfade,
 * not a reflow. */
export function AdCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-neutral-900/5">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="mt-1 h-3 w-2/5" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-border pt-3">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
