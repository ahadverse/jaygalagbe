import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const toastVariants = cva(
  "pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl bg-neutral-900 p-3.5 pr-4 text-sm text-white shadow-xl ring-1 ring-white/10",
  {
    variants: {
      variant: {
        default: "",
        success: "",
        danger: "",
        info: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const accentByVariant = {
  default: "bg-brand-400",
  success: "bg-success-500",
  danger: "bg-danger-500",
  info: "bg-info-500",
} as const;

export type ToastVariant = VariantProps<typeof toastVariants>["variant"];

export interface ToastProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {}

export function Toast({ className, variant, children, ...props }: ToastProps) {
  return (
    <div className={cn(toastVariants({ variant }), className)} {...props}>
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 w-1 shrink-0 self-stretch rounded-full",
          accentByVariant[variant ?? "default"],
        )}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
