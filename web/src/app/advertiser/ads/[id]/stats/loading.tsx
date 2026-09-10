import { Skeleton } from "@/components/ui";

export default function AdStatsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-6 rounded-lg border border-border p-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </main>
  );
}
