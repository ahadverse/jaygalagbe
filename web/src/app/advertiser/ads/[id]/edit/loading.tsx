import { Skeleton } from "@/components/ui";

function SectionSkeleton({ fields }: { fields: number }) {
  return (
    <div className="grid gap-5 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-neutral-900/5 sm:p-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-10">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-full max-w-40" />
      </div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditAdLoading() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="flex flex-col gap-4">
        <SectionSkeleton fields={1} />
        <SectionSkeleton fields={3} />
        <SectionSkeleton fields={2} />
        <SectionSkeleton fields={2} />
        <div className="flex justify-end py-2">
          <Skeleton className="h-13 w-44 rounded-full" />
        </div>
      </div>
    </main>
  );
}
