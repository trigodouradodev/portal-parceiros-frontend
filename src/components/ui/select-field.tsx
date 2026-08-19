import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/components/ui/select-option";
import {
  FieldErrorMessage,
  FieldLabel,
  fieldAnchorProps,
} from "@/components/ui/field-hint";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  name?: string;
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}

export function SelectField({
  name,
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione",
  disabled,
  required,
  error,
  className,
}: SelectFieldProps) {
  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      {...fieldAnchorProps(name, error)}
    >
      {label ? <FieldLabel required={required}>{label}</FieldLabel> : null}
      {!label && required ? (
        <Label className="sr-only">Obrigatório</Label>
      ) : null}
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger aria-invalid={error ? true : undefined}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldErrorMessage error={error} />
    </div>
  );
}
