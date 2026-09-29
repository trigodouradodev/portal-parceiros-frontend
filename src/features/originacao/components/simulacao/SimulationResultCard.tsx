import { CheckCircle2 } from "lucide-react";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { fmtBRL } from "@/lib/utils";

export function SimulationResultCard({
  simulation,
}: {
  simulation: SimulationSnapshot;
}) {
  // Seguro prestamista é opt-out (vem incluído por padrão até o cliente
  // desmarcar na assinatura) — praticamente toda simulação elegível tem
  // seguro, então não é uma exceção que precise de rótulo: a parcela
  // exibida já é a financiada COM seguro (com juros, mesmo mecanismo da
  // TAC) quando disponível, sem nenhuma indicação visual disso.
  const highlightedInstallment =
    simulation.installmentAmountWithInsurance ?? simulation.installmentAmount;

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
            {simulation.installments}x de {fmtBRL(highlightedInstallment)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
