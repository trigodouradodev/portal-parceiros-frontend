import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OriginacaoEmptyState } from "@/features/originacao/components/OriginacaoEmptyState";
import { OriginacaoPageFrame } from "@/features/originacao/components/OriginacaoPageFrame";
import { OriginacaoProgress } from "@/features/originacao/components/OriginacaoProgress";
import {
  OriginacaoSnapshotCard,
  OriginacaoToneBadge,
} from "@/features/originacao/components/OriginacaoSnapshotCard";
import {
  PROPOSAL_STEPS,
  type ProposalSnapshot,
} from "@/features/originacao/data/proposal";
import { fmtBRL } from "@/lib/utils";

export function ProposalList({
  proposals,
  onOpen,
}: {
  proposals: ProposalSnapshot[];
  onOpen: (id: string) => void;
}) {
  return (
    <OriginacaoPageFrame
      title="Propostas"
      description="Propostas criadas nesta sessão — rascunhos podem ser retomados a qualquer momento."
    >
      {proposals.length === 0 ? (
        <OriginacaoEmptyState
          icon={<FileText size={22} />}
          title="Nenhuma proposta ainda"
          description="Inicie uma proposta a partir de uma simulação concluída."
        />
      ) : null}

      <div className="flex flex-col gap-3">
        {[...proposals].reverse().map((proposal) => (
          <OriginacaoSnapshotCard
            key={proposal.id}
            badge={
              <OriginacaoToneBadge
                tone={proposal.status === "draft" ? "warning" : "success"}
              >
                {proposal.status === "draft" ? "Rascunho" : "Concluída"}
              </OriginacaoToneBadge>
            }
            timestamp={proposal.updatedAt}
            name={proposal.simulation.name}
            amount={proposal.simulation.amount}
            subtitle={`${proposal.simulation.installments}x de ${fmtBRL(proposal.simulation.installmentAmount)}`}
            cpf={proposal.simulation.document}
          >
            {proposal.status === "draft" ? (
              <>
                <OriginacaoProgress
                  value={((proposal.step + 1) / PROPOSAL_STEPS.length) * 100}
                />
                <p className="text-xs text-muted-foreground">
                  Passo {proposal.step + 1} de {PROPOSAL_STEPS.length} ·{" "}
                  {PROPOSAL_STEPS[proposal.step]}
                </p>
                <Button
                  variant="outline"
                  size="pillSm"
                  onClick={() => onOpen(proposal.id)}
                >
                  Continuar preenchimento
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="pillSm"
                onClick={() => onOpen(proposal.id)}
              >
                Ver proposta
              </Button>
            )}
          </OriginacaoSnapshotCard>
        ))}
      </div>
    </OriginacaoPageFrame>
  );
}
