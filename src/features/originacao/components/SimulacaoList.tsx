import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginacaoEmptyState } from "@/features/originacao/components/OriginacaoEmptyState";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import {
  OriginacaoSnapshotCard,
  OriginacaoToneBadge,
} from "@/features/originacao/components/OriginacaoSnapshotCard";
import {
  dueDayFromIsoDate,
  formatCreatedAtPtBr,
} from "@/features/originacao/data/simulacao";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { fmtBRL } from "@/lib/utils";

interface SimulacaoListProps {
  simulations: SimulationSnapshot[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onNewSimulation: () => void;
  onEdit: (snapshot: SimulationSnapshot) => void;
  onStartProposal: (snapshot: SimulationSnapshot) => void;
}

export function SimulacaoList({
  simulations,
  isLoading = false,
  isError = false,
  onRetry,
  onNewSimulation,
  onEdit,
  onStartProposal,
}: SimulacaoListProps) {
  return (
    <OriginacaoPageFrame
      title="Simulações"
      description="Simulações salvas deste parceiro."
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
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          Carregando simulações…
        </div>
      ) : null}

      {!isLoading && isError ? (
        <OriginacaoEmptyState
          icon={<Plus size={22} />}
          title="Não foi possível carregar"
          description="Tente novamente em instantes."
          action={
            onRetry ? (
              <Button variant="outline" size="pillSm" onClick={onRetry}>
                Tentar novamente
              </Button>
            ) : null
          }
        />
      ) : null}

      {!isLoading && !isError && simulations.length === 0 ? (
        <OriginacaoEmptyState
          icon={<Plus size={22} />}
          title="Nenhuma simulação ainda"
          description='Clique em "Nova simulação" para começar.'
        />
      ) : null}

      {!isLoading && !isError ? (
        <div className="flex flex-col gap-3">
          {simulations.map((item) => (
            <OriginacaoSnapshotCard
              key={item.id}
              badge={
                <OriginacaoToneBadge tone="warning">
                  {item.productName}
                </OriginacaoToneBadge>
              }
              timestamp={formatCreatedAtPtBr(item.createdAt)}
              name={item.name}
              amount={item.amount}
              subtitle={`${item.installments}x de ${fmtBRL(item.installmentAmount)} · vencimento dia ${String(dueDayFromIsoDate(item.firstInstallmentDate)).padStart(2, "0")}`}
              cpf={item.document}
            >
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="pillSm"
                  onClick={() => onEdit(item)}
                >
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="pillSm"
                  onClick={() => onStartProposal(item)}
                >
                  Iniciar proposta
                </Button>
              </div>
            </OriginacaoSnapshotCard>
          ))}
        </div>
      ) : null}
    </OriginacaoPageFrame>
  );
}
