import { Skeleton } from "@/components/ui";

export default function AdvertiserAdsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-11 w-40 rounded-full" />
      </div>

      <div className="flex flex-col gap-5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5 sm:flex-row sm:p-5"
          >
            <Skeleton className="h-36 w-full shrink-0 rounded-lg sm:h-24 sm:w-32" />
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
    </main>
  );
}
