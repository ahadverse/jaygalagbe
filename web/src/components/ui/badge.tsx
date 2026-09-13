import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
  {
    variants: {
      variant: {
        brand: "bg-brand-100 text-brand-800",
        accent: "bg-accent-100 text-accent-800",
        success: "bg-success-100 text-success-800",
        warning: "bg-warning-100 text-warning-800",
        danger: "bg-danger-100 text-danger-800",
        info: "bg-info-100 text-info-800",
        neutral: "bg-neutral-150 text-neutral-700",
        outline: "border border-border bg-card/80 text-muted-foreground",
        /* Paid placement. The only place the crimson accent goes solid. */
        boost: "bg-accent text-accent-foreground shadow-accent",
      },
      size: {
        sm: "px-2 py-0.5 text-2xs",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}
