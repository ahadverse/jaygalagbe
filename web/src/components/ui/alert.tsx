import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-sm ring-1",
  {
    variants: {
      variant: {
        danger: "bg-danger-50 text-danger-800 ring-danger-100",
        success: "bg-success-50 text-success-800 ring-success-100",
        info: "bg-info-50 text-info-800 ring-info-100",
        warning: "bg-warning-50 text-warning-800 ring-warning-100",
      },
    },
    defaultVariants: { variant: "danger" },
  },
);

const iconPaths = {
  danger: "M12 8v4.75M12 15.9v.2",
  success: "m8 12.2 2.8 2.8L16 9.6",
  info: "M12 11v5M12 8.1v.2",
  warning: "M12 8v4.75M12 15.9v.2",
} as const;

export interface AlertProps extends VariantProps<typeof alertVariants> {
  children: ReactNode;
  className?: string;
}

/* Form-level feedback. Field-level errors stay on the field itself. */
export function Alert({ variant, children, className }: AlertProps) {
  const tone = variant ?? "danger";
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="mt-px size-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d={iconPaths[tone]} />
      </svg>
      <span className="min-w-0 flex-1">{children}</span>
    </div>
  );
}
