import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-lg bg-neutral-150",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

/** Stacked lines with a short last line, so text blocks don't look like bars. */
export function SkeletonLines({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-3.5 rounded-md", index === lines - 1 && "w-2/3")}
        />
      ))}
    </div>
  );
}
