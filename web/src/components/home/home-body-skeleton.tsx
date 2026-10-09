import { Skeleton } from "@/components/ui";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";

/* Stands in for everything under the hero while the ads load, so the hero
 * itself can paint straight away. */
export function HomeBodySkeleton() {
  return (
    <>
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
          </div>
          <div className="min-w-0 flex-1">
            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <AdCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
