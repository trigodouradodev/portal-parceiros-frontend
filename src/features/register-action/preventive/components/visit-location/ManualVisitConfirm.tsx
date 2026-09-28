import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import {
  manualLocationReasonOptions,
  manualLocationReasonRequiresNote,
  type ManualLocationContext,
  type ManualLocationReason,
} from "@/features/register-action/preventive/constants/manual-location-reason";

type ManualConfirmEmphasis = "primary" | "secondary";

const MANUAL_NOTE_MAX_LENGTH = 200;

const CONFIRM_BUTTON_CLASS: Record<ManualConfirmEmphasis, string> = {
  primary:
    "flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-navy py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-navy/90 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning py-3.5 text-sm font-semibold text-warning transition-colors hover:bg-warning-bg disabled:cursor-not-allowed disabled:opacity-50",
};

const REASON_OPTION_CLASS: Record<ManualConfirmEmphasis, string> = {
  primary:
    "flex cursor-pointer items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm has-[:checked]:border-brand-navy has-[:checked]:bg-muted",
  secondary:
    "flex cursor-pointer items-start gap-2.5 rounded-xl border border-border px-3 py-2.5 text-sm has-[:checked]:border-warning has-[:checked]:bg-warning-bg",
};

interface ManualVisitConfirmProps {
  onConfirmManual: (reason: ManualLocationReason, note?: string) => void;
  /** Define quais motivos fazem sentido oferecer. */
  context: ManualLocationContext;
  /** primary quando a confirmação manual é o caminho esperado. */
  emphasis?: ManualConfirmEmphasis;
  /** Esconde o aviso amarelo quando o card de status já explica o caso. */
  showHint?: boolean;
  legend?: string;
}

export function ManualVisitConfirm({
  onConfirmManual,
  context,
  emphasis = "secondary",
  showHint = true,
  legend = "Motivo da confirmação manual",
}: ManualVisitConfirmProps) {
  const [reason, setReason] = useState<ManualLocationReason | null>(null);
  const [note, setNote] = useState("");

  const needsNote = reason !== null && manualLocationReasonRequiresNote(reason);
  const canConfirm = reason !== null && (!needsNote || note.trim().length > 0);

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
          {manualLocationReasonOptions(context).map((option) => (
            <label key={option.value} className={REASON_OPTION_CLASS[emphasis]}>
              <input
                type="radio"
                name="manual-location-reason"
                value={option.value}
                checked={reason === option.value}
                onChange={() => setReason(option.value)}
                className="mt-0.5 accent-warning"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium text-foreground">
                  {option.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {needsNote && (
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-muted-foreground">
            Descreva o motivo
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={MANUAL_NOTE_MAX_LENGTH}
            rows={3}
            placeholder="Ex.: o cliente pediu para encontrar na praça do bairro."
            className="w-full resize-none rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus-visible:border-brand-navy"
          />
        </label>
      )}

      <button
        type="button"
        disabled={!canConfirm}
        onClick={() => {
          if (!reason || !canConfirm) return;
          onConfirmManual(reason, needsNote ? note.trim() : undefined);
        }}
        className={CONFIRM_BUTTON_CLASS[emphasis]}
      >
        <Check size={16} />
        Confirmar presença
      </button>
    </>
  );
}
