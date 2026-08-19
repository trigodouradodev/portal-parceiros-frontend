import { Textarea } from "@/components/ui/textarea";
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";

interface TextareaFieldProps {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function TextareaField({
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: TextareaFieldProps) {
  return (
    <div
      className="flex flex-col gap-1.5"
      {...fieldAnchorProps(name, error)}
    >
      <FieldLabel required={required}>{label}</FieldLabel>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        className="rounded-2xl"
      />
      <FieldErrorMessage error={error} />
    </div>
  );
}
