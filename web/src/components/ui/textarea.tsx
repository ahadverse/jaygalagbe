import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";
import {
  Field,
  controlClassName,
  controlErrorClassName,
  describedBy,
} from "./field";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  fieldClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, hint, error, fieldClassName, id, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <Field
        id={textareaId}
        label={label}
        hint={hint}
        error={error}
        className={fieldClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy(textareaId, hint, error)}
          className={cn(
            controlClassName,
            "min-h-28 resize-y px-3.5 py-2.5 leading-relaxed",
            error && controlErrorClassName,
            className,
          )}
          {...props}
        />
      </Field>
    );
  },
);
Textarea.displayName = "Textarea";
