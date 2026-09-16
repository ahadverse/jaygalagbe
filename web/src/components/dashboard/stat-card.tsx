import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const iconToneVariants = cva("flex size-9 items-center justify-center rounded-lg", {
  variants: {
    tone: {
      neutral: "bg-brand-50 text-brand-600",
      accent: "bg-accent-50 text-accent-600",
      success: "bg-success-50 text-success-700",
      info: "bg-info-50 text-info-700",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface StatCardProps extends VariantProps<typeof iconToneVariants> {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}

export function StatCard({ label, value, hint, icon, tone, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3 px-5 py-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow text-subtle-foreground">{label}</span>
        {icon && <span className={iconToneVariants({ tone })}>{icon}</span>}
      </div>
      <span className="numeric font-heading text-2xl font-bold tracking-tight text-neutral-900">
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Card>
  );
}
