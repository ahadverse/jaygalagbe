import { Skeleton } from "@/components/ui";

export default function MessagesLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      {Array.from({ length: 2 }).map((_, group) => (
        <div
          key={group}
          className="flex flex-col gap-2 rounded-2xl bg-card p-3 shadow-sm ring-1 ring-neutral-900/5"
        >
          <Skeleton className="mx-1 h-5 w-40" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3.5 p-2">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
