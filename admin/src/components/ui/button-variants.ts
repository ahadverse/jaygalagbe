import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,box-shadow,opacity] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-xs hover:bg-brand-700',
        secondary:
          'border border-border-strong bg-card text-foreground shadow-xs hover:bg-ink-100',
        ghost: 'text-muted-foreground hover:bg-ink-200/70 hover:text-foreground',
        success: 'bg-success-600 text-white shadow-xs hover:bg-success-700',
        danger: 'bg-danger-600 text-white shadow-xs hover:bg-danger-700',
        subtleDanger:
          'border border-danger-200 bg-danger-50 text-danger-700 hover:bg-danger-100',
      },
      size: {
        xs: 'h-7 px-2 text-xs',
        sm: 'h-8 px-3 text-[0.8125rem]',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-5 text-sm',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);
