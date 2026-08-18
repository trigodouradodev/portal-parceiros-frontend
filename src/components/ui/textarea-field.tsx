import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  error,
}: TextareaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium text-[#1A1D2E]">{label}</Label>
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className="rounded-2xl"
      />
      {error ? (
        <div className="flex items-center gap-1.5 text-xs text-[#D84040]">
          <AlertCircle size={12} />
          {error}
        </div>
      ) : null}
    </div>
  );
}
