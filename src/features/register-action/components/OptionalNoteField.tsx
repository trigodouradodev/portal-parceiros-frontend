import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface OptionalNoteFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  wrapperClassName?: string;
  required?: boolean;
  hint?: string;
  invalid?: boolean;
}

export function OptionalNoteField({
  value,
  onChange,
  placeholder = "Descreva detalhes do contato...",
  className = "mt-1 min-h-[76px]",
  wrapperClassName = "mt-2",
  required = false,
  hint,
  invalid = false,
}: OptionalNoteFieldProps) {
  return (
    <div className={wrapperClassName}>
      <Label className="text-foreground">
        Observações{" "}
        <span
          className={cn(
            "font-normal",
            required
              ? "text-destructive"
              : "text-muted-foreground/60",
          )}
        >
          {required ? "(obrigatório)" : "(opcional)"}
        </span>
      </Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        className={cn(
          className,
          invalid && "border-2 border-destructive focus:border-destructive",
        )}
      />
      {hint && (
        <p className="mt-1 text-sm text-destructive">{hint}</p>
      )}
    </div>
  );
}
