import { Skeleton } from "@/components/ui";
import { AdCardSkeleton } from "@/components/ads/ad-card-skeleton";

export default function SectorLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="grain relative overflow-hidden border-b border-border bg-gradient-to-b from-brand-50 to-background">
        <div className="shell flex flex-col gap-7 pb-8 pt-10 sm:pb-10 sm:pt-14">
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-9 w-64 sm:h-10" />
            <Skeleton className="h-5 w-full max-w-md" />
          </div>
          <Skeleton className="h-72 w-full rounded-2xl sm:h-60 lg:h-52" />
        </div>
      </section>

      <section className="shell flex-1 py-10 sm:py-14">
        <div className="mb-5 flex items-baseline justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <AdCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
