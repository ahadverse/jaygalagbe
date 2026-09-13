import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-ink-200/80', className)}
      aria-hidden="true"
    />
  );
}
