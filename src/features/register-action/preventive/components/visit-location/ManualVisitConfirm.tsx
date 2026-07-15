import { AlertTriangle, MapPin } from "lucide-react";

interface ManualVisitConfirmProps {
  onConfirmManual: () => void;
}

export function ManualVisitConfirm({
  onConfirmManual,
}: ManualVisitConfirmProps) {
  return (
    <>
      <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-xs text-muted-foreground">
          Se a pessoa está <strong>visitando você</strong>, confirme abaixo.
          Esta ação fica registrada para auditoria.
        </p>
      </div>
      <button
        type="button"
        onClick={onConfirmManual}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning py-3.5 text-sm font-semibold text-warning transition-colors hover:bg-warning-bg"
      >
        <MapPin size={16} />
        Estou recebendo no meu endereço
      </button>
    </>
  );
}
