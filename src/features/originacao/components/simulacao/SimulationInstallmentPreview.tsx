import { Loader2 } from "lucide-react";
import { fmtBRL } from "@/lib/utils";

interface SimulationInstallmentPreviewProps {
  visible: boolean;
  canSimulate: boolean;
  hasPayload: boolean;
  isError: boolean;
  amount: number | undefined;
}

function InstallmentPreviewValue({
  canSimulate,
  hasPayload,
  isError,
  amount,
}: Omit<SimulationInstallmentPreviewProps, "visible">) {
  if (!canSimulate || !hasPayload) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  if (isError) {
    return (
      <span className="text-sm text-destructive">Não foi possível calcular</span>
    );
  }
  if (amount != null) {
    return (
      <span className="font-display text-xl font-bold text-foreground">
        {fmtBRL(amount)}/mês
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Loader2 size={14} className="animate-spin" />
      Calculando…
    </span>
  );
}

export function SimulationInstallmentPreview({
  visible,
  canSimulate,
  hasPayload,
  isError,
  amount,
}: SimulationInstallmentPreviewProps) {
  if (!visible) return null;

  return (
    <div className="rounded-2xl bg-muted px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-muted-foreground">Parcela</span>
        <InstallmentPreviewValue
          canSimulate={canSimulate}
          hasPayload={hasPayload}
          isError={isError}
          amount={amount}
        />
      </div>
    </div>
  );
}
