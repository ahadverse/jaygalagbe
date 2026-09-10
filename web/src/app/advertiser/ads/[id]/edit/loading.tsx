import { Skeleton } from "@/components/ui";

export default function EditAdLoading() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </main>
  );
}
