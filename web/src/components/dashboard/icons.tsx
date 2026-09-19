const PATHS = {
  home: "M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z",
  clock: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  chat: "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z",
  eye: "M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Zm9.5 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  cursor: "M5 3.5 19 10l-6 2-2 6-6-14.5Z",
  spark: "M13.2 2 5.4 13.8h5.3L10.3 22l7.9-11.8h-5.3L13.2 2Z",
  trend: "M4 16.5 9.5 11l3.5 3.5L20 7.5M20 7.5h-4.5M20 7.5V12",
  star: "m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 4Z",
} as const;

export type DashboardIconName = keyof typeof PATHS;

export function DashboardIcon({
  name,
  className = "size-4",
}: {
  name: DashboardIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
