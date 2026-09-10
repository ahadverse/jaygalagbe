import { Skeleton } from "@/components/ui";

export default function AdvertiserAdsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4 rounded-xl border border-border p-4">
            <Skeleton className="h-20 w-28 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
