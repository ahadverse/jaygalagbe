import { cva, type VariantProps } from 'class-variance-authority';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'border-ink-200 bg-ink-100 text-ink-700',
        brand: 'border-brand-200 bg-brand-50 text-brand-700',
        success: 'border-success-200 bg-success-50 text-success-700',
        warning: 'border-warning-200 bg-warning-50 text-warning-700',
        danger: 'border-danger-200 bg-danger-50 text-danger-700',
        info: 'border-info-200 bg-info-50 text-info-700',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>['tone']>;

export const BADGE_DOT_COLOR: Record<BadgeTone, string> = {
  neutral: 'bg-ink-400',
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};
