import { Skeleton } from "@/components/ui";

export default function BoostAdLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </div>

      <Skeleton className="h-15 w-full rounded-xl" />

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-13 w-full rounded-full" />
    </div>
  );
}
