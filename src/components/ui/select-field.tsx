import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectOption } from "@/components/ui/select-option";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Selecione",
  disabled,
  error,
  className,
}: SelectFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
      ) : null}
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger>
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
      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
          <AlertCircle size={12} />
          {error}
        </div>
      ) : null}
    </div>
  );
}
