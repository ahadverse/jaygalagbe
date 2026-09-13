import { cn } from '@/lib/utils';

/**
 * Listing photos are remote URLs that regularly 404 in staging, so the tile
 * always paints a neutral placeholder underneath the image.
 */
export function AdThumb({
  photos,
  alt,
  className,
}: {
  photos: string[];
  alt: string;
  className?: string;
}) {
  const src = photos[0];

  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-md bg-ink-200',
        className ?? 'h-10 w-14',
      )}
    >
      {src && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.visibility = 'hidden';
          }}
        />
      )}
    </div>
  );
}
