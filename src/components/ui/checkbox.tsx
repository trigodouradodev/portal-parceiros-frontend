import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

/**
 * Checkbox estilizado (o app não tinha nenhum — as telas usavam
 * `<input type="checkbox">` nativo, pequeno demais pra tocar no mobile e sem
 * nenhuma cor da marca). Input nativo por baixo (acessível, focável,
 * funciona com formulários) só com a aparência trocada via `appearance-none`
 * + pseudo-classe `checked:`; o `<label>` inteiro é clicável, dando uma área
 * de toque melhor no mobile do que só a caixinha.
 */
export function Checkbox({
  checked,
  onCheckedChange,
  label,
  className,
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 py-1 text-sm font-medium text-foreground",
        className,
      )}
    >
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border-2 border-input bg-white transition-colors checked:border-brand-navy checked:bg-brand-navy"
        />
        <Check
          size={14}
          strokeWidth={3}
          className="pointer-events-none absolute text-white opacity-0 peer-checked:opacity-100"
        />
      </span>
      {label}
    </label>
  );
}
