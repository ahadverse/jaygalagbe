import type { ReactNode } from "react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function Icon({ path }: { path: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-[1.125rem] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: <Icon path="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />,
  },
  {
    href: "/dashboard/saved",
    label: "Saved & viewed",
    icon: <Icon path="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />,
  },
  {
    href: "/dashboard/ads",
    label: "My listings",
    icon: <Icon path="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4V11Z" />,
  },
  {
    href: "/dashboard/messages",
    label: "Messages",
    icon: (
      <Icon path="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5v-8Z" />
    ),
  },
  {
    href: "/dashboard/reviews",
    label: "Reviews",
    icon: (
      <Icon path="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8L12 4Z" />
    ),
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: (
      <Icon path="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8-3a8 8 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a8 8 0 0 0-2-1.2L15 3H9l-.5 2.6a8 8 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a8.2 8.2 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 2 1.2L9 21h6l.5-2.6a8 8 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.07-.4.1-.8.1-1.2Z" />
    ),
  },
];
