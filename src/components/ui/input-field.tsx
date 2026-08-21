import type { HTMLAttributes, ReactNode } from "react";
import {
  FieldErrorMessage,
  FieldHint,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import {
  fieldControlClassName,
  fieldIconClassName,
  fieldValueClassName,
} from "@/components/ui/field-control";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  placeholder?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}

export function InputField({
  name,
  label,
  value,
  onChange,
  icon,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  max,
  disabled,
  required,
  error,
  hint,
  className,
}: InputFieldProps) {
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1.5", className)}
      {...fieldAnchorProps(name, error)}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <div
        className={fieldControlClassName({ error: Boolean(error), disabled })}
      >
        {icon ? <span className={fieldIconClassName}>{icon}</span> : null}
        <input
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          max={max}
          value={value}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className={fieldValueClassName}
        />
      </div>
      <FieldErrorMessage error={error} />
      {hint && !error ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}
