import type { HTMLAttributes, ReactNode } from "react";
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  placeholder?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  max?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
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
  maxLength,
  max,
  disabled,
  required,
  error,
}: InputFieldProps) {
  return (
    <div
      className="flex flex-col gap-1.5"
      {...fieldAnchorProps(name, error)}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors",
          disabled
            ? "border-transparent bg-[#EFEFF3]"
            : error
              ? "border-[#D84040] bg-[#F5F6FA]"
              : "border-transparent bg-[#F5F6FA] focus-within:border-brand-navy",
        )}
      >
        <span className="shrink-0 text-[#9DA3B4]">{icon}</span>
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          max={max}
          value={value}
          disabled={disabled}
          required={required}
          aria-required={required || undefined}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className="flex-1 bg-transparent text-sm text-[#1A1D2E] outline-none placeholder:text-[#C8CBD8] disabled:text-[#6B7080]"
        />
      </div>
      <FieldErrorMessage error={error} />
    </div>
  );
}
