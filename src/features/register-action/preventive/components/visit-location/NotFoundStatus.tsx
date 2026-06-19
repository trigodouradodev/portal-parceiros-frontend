import {
  AlertTriangle,
  ExternalLink,
  MapPin,
  MapPinOff,
  Navigation,
} from "lucide-react";

interface NotFoundStatusProps {
  onConfirmManual: () => void;
}

export function NotFoundStatus({ onConfirmManual }: NotFoundStatusProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive-bg p-4">
        <MapPinOff size={18} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">
            Você não está no endereço do cliente
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Para registrar a visita, vá ao endereço ou confirme presença
            manualmente.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => window.alert("Abrirá o GPS com rota para o cliente.")}
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-brand-navy py-3.5 font-semibold text-white transition-colors hover:bg-brand-navy/90"
      >
        <Navigation size={18} />
        Ir até o cliente (GPS)
        <ExternalLink size={14} className="opacity-70" />
      </button>
      <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
        <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
        <p className="text-xs text-muted-foreground">
          Se o cliente está <strong>visitando você</strong>, confirme abaixo.
          Esta ação fica registrada para auditoria.
        </p>
      </div>
      <button
        type="button"
        onClick={onConfirmManual}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warning py-3.5 text-sm font-semibold text-warning transition-colors hover:bg-warning-bg"
      >
        <MapPin size={16} />
        Estou recebendo o cliente no meu endereço
      </button>
    </div>
  );
}
