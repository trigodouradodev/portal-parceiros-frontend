import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginacaoEmptyState } from "@/features/originacao/components/OriginacaoEmptyState";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import {
  OriginacaoSnapshotCard,
  OriginacaoToneBadge,
} from "@/features/originacao/components/OriginacaoSnapshotCard";
import type { SimulacaoSnapshot } from "@/features/originacao/types";
import { fmtBRL } from "@/lib/utils";

interface SimulacaoListProps {
  simulations: SimulacaoSnapshot[];
  onNewSimulation: () => void;
  onStartProposal: (snapshot: SimulacaoSnapshot) => void;
}

export function SimulacaoList({
  simulations,
  onNewSimulation,
  onStartProposal,
}: SimulacaoListProps) {
  return (
    <OriginacaoPageFrame
      title="Simulações"
      description="Simulações realizadas para clientes nesta sessão."
      actions={
        <Button
          variant="yellow"
          size="pillSm"
          className="shrink-0 gap-1.5"
          onClick={onNewSimulation}
        >
          <Plus size={15} />
          Nova simulação
        </Button>
      }
    >
      {simulations.length === 0 ? (
        <OriginacaoEmptyState
          icon={<Plus size={22} />}
          title="Nenhuma simulação ainda"
          description='Clique em "Nova simulação" para começar.'
        />
      ) : null}

      <div className="flex flex-col gap-3">
        {[...simulations].reverse().map((item) => (
          <OriginacaoSnapshotCard
            key={item.id}
            badge={
              <OriginacaoToneBadge tone="warning">
                {item.produto}
              </OriginacaoToneBadge>
            }
            timestamp={item.criadaEm}
            name={item.nome}
            amount={item.valor}
            subtitle={`${item.parcelas}x de ${fmtBRL(item.parcelaCalc)} · vencimento dia ${String(item.vencimento).padStart(2, "0")}`}
            cpf={item.cpf}
          >
            <Button
              variant="outline"
              size="pillSm"
              onClick={() => onStartProposal(item)}
            >
              Iniciar proposta
            </Button>
          </OriginacaoSnapshotCard>
        ))}
      </div>
    </OriginacaoPageFrame>
  );
}
