import { Skeleton, SkeletonLines } from "@/components/ui";

export default function AdDetailLoading() {
  return (
    <main className="shell flex w-full flex-col gap-8 py-6 sm:py-10">
      <Skeleton className="h-3 w-52" />

      <div className="grid gap-2 sm:grid-cols-3 sm:grid-rows-2">
        <Skeleton className="aspect-[4/3] rounded-2xl sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-80" />
        <Skeleton className="hidden rounded-2xl sm:block" />
        <Skeleton className="hidden rounded-2xl sm:block" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-full max-w-lg sm:h-10" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-neutral-900/5 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2 bg-card px-4 py-3.5">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-44" />
            <SkeletonLines lines={4} className="max-w-2xl" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-52 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    </main>
  );
}
