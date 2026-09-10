import { Skeleton } from "@/components/ui";

export default function ConversationLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="min-h-64 flex-1 rounded-xl" />
      <Skeleton className="h-24 w-full rounded-md" />
    </main>
  );
}
