import { CheckCircle2 } from "lucide-react";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { formatMonthlyRate } from "@/features/originacao/utils/format-monthly-rate";
import { fmtBRL } from "@/lib/utils";

export function SimulationResultCard({
  simulation,
}: {
  simulation: SimulationSnapshot;
}) {
  const ratePercent = Math.round(simulation.interestRate * 10_000) / 100;

  return (
    <div className="rounded-2xl border border-success/30 bg-success-bg p-4">
      <div className="mb-3 flex items-center gap-2 text-success">
        <CheckCircle2 size={20} />
        <p className="font-display text-lg font-bold">Simulação concluída</p>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Valor solicitado</dt>
          <dd className="font-semibold text-foreground">
            {fmtBRL(simulation.amount)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Parcelas</dt>
          <dd className="font-semibold text-foreground">
            {simulation.installments}x de {fmtBRL(simulation.installmentAmount)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Taxa mensal</dt>
          <dd className="font-semibold text-foreground">
            {formatMonthlyRate(ratePercent)}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Total devido</dt>
          <dd className="font-semibold text-foreground">
            {simulation.totalAmountOwed == null
              ? "—"
              : fmtBRL(simulation.totalAmountOwed)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
