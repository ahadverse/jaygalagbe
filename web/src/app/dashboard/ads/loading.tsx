import { Skeleton } from "@/components/ui";

export default function MyListingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>

      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-20 rounded-full" />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5 sm:flex-row sm:p-5"
          >
            <Skeleton className="h-40 w-full shrink-0 rounded-xl sm:h-24 sm:w-32" />
            <div className="flex flex-1 flex-col gap-2.5">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="mt-1 flex gap-2">
                <Skeleton className="h-9 w-16 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-16 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
