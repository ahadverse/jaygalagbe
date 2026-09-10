import { Skeleton } from "@/components/ui";

export default function BoostAdLoading() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </main>
  );
}
