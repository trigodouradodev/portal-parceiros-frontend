import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FieldHint, FieldLabel } from "@/components/ui/field-hint";

interface RepeatableGroupProps {
  title: string;
  hint?: string;
  addLabel: string;
  emptyLabel: string;
  isEmpty: boolean;
  onAdd: () => void;
  children: ReactNode;
}

export function RepeatableGroup({
  title,
  hint,
  addLabel,
  emptyLabel,
  isEmpty,
  onAdd,
  children,
}: RepeatableGroupProps) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <FieldLabel>{title}</FieldLabel>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 text-sm font-semibold text-brand-navy"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      </div>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      {isEmpty ? (
        <p className="mt-2 mb-1 text-xs text-muted-foreground">{emptyLabel}</p>
      ) : null}
      <div className="mt-2 flex flex-col gap-3">{children}</div>
    </div>
  );
}

interface RemovableCardProps {
  header: ReactNode;
  removeLabel: string;
  onRemove: () => void;
  children: ReactNode;
  /**
   * Alinhamento vertical do cabeçalho com o botão de remover. `"center"`
   * (padrão) serve para cabeçalhos de uma linha só, como um texto simples;
   * `"end"` alinha pela base e deve ser usado quando o cabeçalho é um campo
   * de formulário (label + input/select), pra encostar o ícone no controle
   * em vez de no label.
   */
  align?: "center" | "end";
}

export function RemovableCard({
  header,
  removeLabel,
  onRemove,
  children,
  align = "center",
}: RemovableCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted p-3">
      <div
        className={`flex gap-2 ${align === "end" ? "items-end" : "items-center"}`}
      >
        <div className="min-w-0 flex-1">{header}</div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-2 text-destructive"
          aria-label={removeLabel}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}
