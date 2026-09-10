import { Skeleton } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
      </div>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </section>

      <section className="flex flex-col gap-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </section>
    </main>
  );
}
