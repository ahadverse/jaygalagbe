import { cn } from '@/lib/utils';
import { StarIcon } from '@/components/ui/icons';

/**
 * Filled stars plus the number. The count is there deliberately — counting
 * five small glyphs at a glance is slower than reading "2".
 */
export function RatingStars({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      aria-label={`${rating} out of 5`}
    >
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((step) => (
          <StarIcon
            key={step}
            className={cn(
              'h-3.5 w-3.5',
              step <= rating
                ? 'fill-warning-500 text-warning-500'
                : 'text-ink-300',
            )}
          />
        ))}
      </span>
      <span className="text-xs font-semibold tnum" aria-hidden="true">
        {rating}
      </span>
    </span>
  );
}
