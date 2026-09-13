import { type InputHTMLAttributes, type ReactNode, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import {
  Field,
  controlClassName,
  controlErrorClassName,
  describedBy,
} from "./field";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Rendered inside the field, before the text — e.g. a ৳ or a search glyph. */
  adornment?: ReactNode;
  fieldClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, hint, error, adornment, fieldClassName, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <Field
        id={inputId}
        label={label}
        hint={hint}
        error={error}
        className={fieldClassName}
      >
        <div className="relative">
          {adornment && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-subtle-foreground"
            >
              {adornment}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy(inputId, hint, error)}
            className={cn(
              controlClassName,
              "h-11 px-3.5",
              adornment && "pl-9",
              error && controlErrorClassName,
              className,
            )}
            {...props}
          />
        </div>
      </Field>
    );
  },
);
Input.displayName = "Input";
