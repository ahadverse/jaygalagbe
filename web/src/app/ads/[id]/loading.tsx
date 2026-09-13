import { Skeleton, SkeletonLines } from "@/components/ui";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";

export default function AdDetailLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="shell flex w-full flex-col gap-7 py-6 sm:gap-8 sm:py-10">
        <Skeleton className="h-3 w-60" />

        <div className="grid gap-2 sm:grid-cols-2">
          <Skeleton className="aspect-[16/10] rounded-2xl" />
          <Skeleton className="aspect-[16/10] rounded-2xl" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
          <div className="flex min-w-0 flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-9 w-full max-w-lg sm:h-10" />
              <Skeleton className="h-4 w-64" />
            </div>

            <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-neutral-900/5">
              <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex flex-col gap-2 bg-card px-4 py-3.5">
                    <Skeleton className="h-2.5 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-3 border-t border-border p-5 sm:p-6">
                <Skeleton className="h-6 w-44" />
                <SkeletonLines lines={3} className="max-w-2xl" />
              </div>
            </div>

            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          <div className="flex flex-col gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-52 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>

      <section className="border-t border-border bg-muted/50">
        <div className="shell py-12 sm:py-16">
          <Skeleton className="mb-6 h-7 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <AdCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
