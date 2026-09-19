export function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5 text-warning-500"
      aria-label={`${value} out of ${max}`}
    >
      {Array.from({ length: max }).map((_, index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="size-3.5"
          fill={index < value ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinejoin="round"
        >
          <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
        </svg>
      ))}
    </span>
  );
}
