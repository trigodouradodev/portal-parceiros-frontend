import { SelectDialogField } from "@/components/ui/select-dialog-field";
import {
  isOverdueReason,
  OVERDUE_REASON_OPTIONS,
  type OverdueReason,
} from "@/lib/overdue-reasons";

interface OverdueReasonFieldProps {
  value?: OverdueReason;
  onChange: (value: OverdueReason) => void;
}

export function OverdueReasonField({
  value,
  onChange,
}: OverdueReasonFieldProps) {
  return (
    <SelectDialogField
      name="overdueReason"
      label="Motivo do atraso"
      placeholder="Selecione o motivo"
      value={value ?? ""}
      onChange={(next) => {
        if (isOverdueReason(next)) onChange(next);
      }}
      options={OVERDUE_REASON_OPTIONS}
      required
      error={!value ? "Selecione o motivo para continuar." : undefined}
      className="mt-4"
    />
  );
}
