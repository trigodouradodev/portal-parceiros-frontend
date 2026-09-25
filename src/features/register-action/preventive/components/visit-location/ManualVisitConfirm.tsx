import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import {
  MANUAL_LOCATION_REASON_OPTIONS,
  type ManualLocationReason,
} from "@/features/register-action/preventive/constants/manual-location-reason";

interface ManualVisitConfirmProps {
  onConfirmManual: (reason: ManualLocationReason) => void;
  /** primary quando a confirmação manual é o caminho esperado. */
  emphasis?: "primary" | "secondary";
  /** Esconde o aviso amarelo quando o card de status já explica o caso. */
  showHint?: boolean;
  legend?: string;
}

export function ManualVisitConfirm({
  onConfirmManual,
  emphasis = "secondary",
  showHint = true,
  legend = "Motivo da confirmação manual",
}: ManualVisitConfirmProps) {
  const [reason, setReason] = useState<ManualLocationReason | null>(null);
  const confirmClassName =
    emphasis === "primary"
      ? "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50"
      : "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning py-3.5 text-sm font-semibold text-warning transition-colors hover:bg-warning-bg disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <>
      {showHint && (
        <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-xs text-muted-foreground">
            Se a pessoa está <strong>visitando você</strong> ou a localização
            falhou, confirme abaixo. Esta ação fica registrada para auditoria.
          </p>
        </div>
      )}

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold text-muted-foreground">
          {legend}
        </legend>
        <div className="flex flex-col gap-1.5">
          {MANUAL_LOCATION_REASON_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm ${
                emphasis === "primary"
                  ? "has-[:checked]:border-brand-navy has-[:checked]:bg-muted"
                  : "has-[:checked]:border-warning has-[:checked]:bg-warning-bg"
              }`}
            >
              <input
                type="radio"
                name="manual-location-reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
                className="accent-warning"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="button"
        disabled={!reason}
        onClick={() => {
          if (!reason) return;
          onConfirmManual(reason);
        }}
        className={confirmClassName}
      >
        <Check size={16} />
        Confirmar presença
      </button>
    </>
  );
}
