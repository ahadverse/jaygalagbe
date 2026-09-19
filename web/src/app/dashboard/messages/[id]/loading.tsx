import { Skeleton } from "@/components/ui";

export default function ConversationLoading() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-3.5">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <div className="flex min-h-72 flex-1 flex-col gap-2.5 rounded-2xl bg-muted/60 p-4 ring-1 ring-neutral-900/5">
          <Skeleton className="h-14 w-3/5 self-start rounded-2xl rounded-bl-md bg-neutral-200" />
          <Skeleton className="h-10 w-2/5 self-end rounded-2xl rounded-br-md bg-neutral-200" />
          <Skeleton className="h-16 w-2/3 self-start rounded-2xl rounded-bl-md bg-neutral-200" />
        </div>
        <Skeleton className="h-15 w-full rounded-2xl" />
      </div>
    </div>
  );
}
