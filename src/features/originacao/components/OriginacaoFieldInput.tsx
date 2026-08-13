import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface OriginacaoFieldInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  max?: string;
  disabled?: boolean;
  error?: string;
}

export function OriginacaoFieldInput({
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
  error,
}: OriginacaoFieldInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
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
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          className="flex-1 bg-transparent text-sm text-[#1A1D2E] outline-none placeholder:text-[#C8CBD8] disabled:text-[#6B7080]"
        />
      </div>
      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
          <AlertCircle size={12} />
          {error}
        </div>
      ) : null}
    </div>
  );
}
