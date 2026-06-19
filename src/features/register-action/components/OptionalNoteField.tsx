import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface OptionalNoteFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function OptionalNoteField({
  value,
  onChange,
  placeholder = "Descreva detalhes do contato…",
  className = "mt-1 min-h-[76px]",
}: OptionalNoteFieldProps) {
  return (
    <div className="mt-2">
      <Label>
        Observações{" "}
        <span className="font-normal text-muted-foreground/60">(opcional)</span>
      </Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      />
    </div>
  );
}
