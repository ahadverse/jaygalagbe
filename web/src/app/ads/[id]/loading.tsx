import { Skeleton } from "@/components/ui";

export default function AdDetailLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <Skeleton className="aspect-[16/9] w-full rounded-xl" />

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
