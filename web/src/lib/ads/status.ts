import type { AdStatus } from "./types";

export const AD_STATUS_BADGE: Record<
  AdStatus,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral"; className: string }
> = {
  LIVE: {
    label: "Live",
    variant: "success",
    className: "bg-success-50 text-success-700",
  },
  PENDING: {
    label: "In review",
    variant: "warning",
    className: "bg-warning-50 text-warning-700",
  },
  REJECTED: {
    label: "Rejected",
    variant: "danger",
    className: "bg-danger-50 text-danger-700",
  },
  SOLD: { label: "Sold", variant: "info", className: "bg-info-50 text-info-700" },
  REMOVED: {
    label: "Removed",
    variant: "neutral",
    className: "bg-neutral-100 text-neutral-600",
  },
};
