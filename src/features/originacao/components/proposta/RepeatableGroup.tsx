import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/ui/field-hint";

interface RepeatableGroupProps {
  title: string;
  addLabel: string;
  emptyLabel: string;
  isEmpty: boolean;
  onAdd: () => void;
  children: ReactNode;
}

export function RepeatableGroup({
  title,
  addLabel,
  emptyLabel,
  isEmpty,
  onAdd,
  children,
}: RepeatableGroupProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
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
      {isEmpty ? (
        <p className="mb-1 text-xs text-muted-foreground">{emptyLabel}</p>
      ) : null}
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

interface RemovableCardProps {
  header: ReactNode;
  removeLabel: string;
  onRemove: () => void;
  children: ReactNode;
}

export function RemovableCard({
  header,
  removeLabel,
  onRemove,
  children,
}: RemovableCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted p-3">
      <div className="flex items-center gap-2">
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
