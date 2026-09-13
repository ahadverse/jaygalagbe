import { type SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import { Field, controlClassName, describedBy } from "./field";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  fieldClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, hint, fieldClassName, id, children, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <Field
        id={selectId}
        label={label}
        hint={hint}
        className={fieldClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-describedby={describedBy(selectId, hint)}
            className={cn(
              controlClassName,
              "h-11 cursor-pointer appearance-none py-0 pl-3.5 pr-10",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle-foreground"
          >
            <path
              d="m6 8.5 4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Field>
    );
  },
);
Select.displayName = "Select";
