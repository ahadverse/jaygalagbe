import { Skeleton } from "@/components/ui";

export default function AdStatsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-neutral-900/5">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 bg-card px-5 py-4">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
        <Skeleton className="h-5 w-44" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <Skeleton className="h-3 w-48" />
          </div>
        ))}
      </div>
    </main>
  );
}
