import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const toastVariants = cva(
  "pointer-events-auto w-full max-w-sm rounded-lg border border-l-4 border-border bg-background p-3 text-sm text-foreground shadow-lg",
  {
    variants: {
      variant: {
        default: "border-l-border",
        success: "border-l-success-500",
        danger: "border-l-danger-500",
        info: "border-l-info-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type ToastVariant = VariantProps<typeof toastVariants>["variant"];

export interface ToastProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {}

export function Toast({ className, variant, ...props }: ToastProps) {
  return <div className={cn(toastVariants({ variant }), className)} {...props} />;
}
