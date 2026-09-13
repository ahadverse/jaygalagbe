import { Skeleton } from "@/components/ui";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";

export default function HomeLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-neutral-950">
        <div className="shell relative flex min-h-[41rem] items-center justify-center pb-28 pt-16 sm:pb-32 sm:pt-20 lg:min-h-[45rem]">
          <div className="flex w-full flex-col items-center gap-7 sm:gap-8">
            <Skeleton className="h-9 w-64 rounded-full bg-white/10" />
            <div className="flex w-full max-w-[44rem] flex-col items-center gap-3">
              <Skeleton className="h-11 w-full bg-white/10 sm:h-14" />
              <Skeleton className="h-11 w-3/4 bg-white/10 sm:h-14" />
              <Skeleton className="mt-2 h-5 w-full max-w-md bg-white/10" />
            </div>
            <Skeleton className="h-36 w-full max-w-[40rem] rounded-2xl bg-white/15 sm:h-32" />
            <Skeleton className="h-7 w-72 rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      <section className="shell relative z-10">
        <div className="-mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-lg ring-1 ring-neutral-900/5 sm:-mt-16 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-2 bg-card px-5 py-6 sm:px-6 sm:py-7"
            >
              <Skeleton className="h-8 w-14" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-14 sm:py-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <div className="flex w-full shrink-0 flex-col gap-2.5 lg:w-72">
            <Skeleton className="mb-1 h-3 w-36" />
            <Skeleton className="h-[4.75rem] w-full rounded-xl" />
            <Skeleton className="h-[4.75rem] w-full rounded-xl" />
            <Skeleton className="mt-2 h-40 w-full rounded-xl" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-5 flex flex-col gap-1">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <AdCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
