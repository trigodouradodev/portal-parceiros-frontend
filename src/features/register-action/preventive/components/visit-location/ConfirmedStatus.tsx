import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmedStatusProps {
  distanceMeters?: number;
  radiusMeters?: number;
  partialMatch?: boolean;
}

export function ConfirmedStatus({
  distanceMeters,
  radiusMeters,
  partialMatch,
}: ConfirmedStatusProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-success-bg py-4 font-semibold text-success">
        <CheckCircle2 size={18} />
        Localização confirmada — você está no endereço!
      </div>
      {distanceMeters !== undefined && radiusMeters !== undefined && (
        <p className="text-center text-xs text-muted-foreground">
          Distância: {distanceMeters.toLocaleString("pt-BR")}m (raio de{" "}
          {radiusMeters}m)
        </p>
      )}
      {partialMatch && (
        <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-xs text-muted-foreground">
            Endereço geolocalizado de forma aproximada. Confirme manualmente se
            necessário.
          </p>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Avance para registrar o resultado da visita.
      </p>
    </div>
  );
}
