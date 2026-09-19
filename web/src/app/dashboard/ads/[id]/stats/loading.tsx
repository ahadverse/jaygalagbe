import { Skeleton } from "@/components/ui";

export default function AdStatsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <Skeleton className="h-20 w-full rounded-xl" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-2 rounded-xl bg-card px-5 py-4 shadow-sm ring-1 ring-neutral-900/5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-52 w-full rounded-lg" />
      </div>
    </div>
  );
}
