import { AlertTriangle } from "lucide-react";

export function PartialMatchAlert() {
  return (
    <div className="flex items-start gap-2 rounded-2xl border border-warning/40 bg-warning-bg p-3.5">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-warning" />
      <p className="text-xs text-muted-foreground">
        Endereço geolocalizado de forma aproximada. Confirme manualmente se
        necessário.
      </p>
    </div>
  );
}
