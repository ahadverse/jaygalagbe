import { Skeleton } from "@/components/ui";

export default function AdvertiserMessagesLoading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-12">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3.5 rounded-xl bg-card p-4 shadow-sm ring-1 ring-neutral-900/5"
          >
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
