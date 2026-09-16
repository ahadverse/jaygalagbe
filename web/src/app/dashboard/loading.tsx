import { Skeleton } from "@/components/ui";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-2xl" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-28" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <AdCardSkeleton key={index} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-28" />
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5"
          >
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </section>
    </main>
  );
}
