import {
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

const controlClass =
  'w-full rounded-md border border-border-strong bg-card text-sm text-foreground shadow-xs transition-colors placeholder:text-ink-400 hover:border-ink-400 focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-ink-100 disabled:opacity-60';

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-muted-foreground"
    >
      {children}
    </label>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Input({
  className,
  label,
  hint,
  error,
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          controlClass,
          'h-9 px-2.5',
          error && 'border-danger-500 focus-visible:ring-danger-500/30',
          className,
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({
  className,
  label,
  id,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <Label htmlFor={selectId}>{label}</Label>}
      <select
        id={selectId}
        className={cn(controlClass, 'h-9 cursor-pointer px-2 pr-7', className)}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export function Textarea({
  className,
  label,
  hint,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      {label && <Label htmlFor={textareaId}>{label}</Label>}
      <textarea
        id={textareaId}
        className={cn(controlClass, 'min-h-20 resize-y p-2.5', className)}
        {...props}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
