import { Skeleton } from "@/components/ui";

export default function SectorLoading() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-40 w-full rounded-xl sm:h-32" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        <Skeleton className="mb-4 h-5 w-32" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-lg border border-border">
              <Skeleton className="aspect-[4/3] w-full rounded-b-none" />
              <div className="flex flex-col gap-2 p-4 pt-0">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
