import { SelectDialogField } from "@/components/ui/select-dialog-field";
import {
  isNoForecastReason,
  NO_FORECAST_REASON_OPTIONS,
  type NoForecastReason,
} from "@/lib/no-forecast-reasons";

interface NoForecastReasonFieldProps {
  value?: NoForecastReason;
  onChange: (value: NoForecastReason) => void;
}

export function NoForecastReasonField({
  value,
  onChange,
}: NoForecastReasonFieldProps) {
  return (
    <SelectDialogField
      name="noForecastReason"
      label="Motivo da falta de previsão"
      placeholder="Selecione o motivo"
      value={value ?? ""}
      onChange={(next) => {
        if (isNoForecastReason(next)) onChange(next);
      }}
      options={NO_FORECAST_REASON_OPTIONS}
      required
      error={!value ? "Selecione o motivo para continuar." : undefined}
      className="mt-4"
    />
  );
}
