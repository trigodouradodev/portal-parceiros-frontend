import { CheckCircle2 } from "lucide-react";

export function ConfirmedStatus() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-success-bg py-4 font-semibold text-success">
        <CheckCircle2 size={18} />
        Localização confirmada — você está no endereço!
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Avance para registrar o resultado da visita.
      </p>
    </div>
  );
}
