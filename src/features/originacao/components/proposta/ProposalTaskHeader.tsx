import { OriginacaoTaskHeader } from "@/features/originacao/components/OriginacaoTaskHeader";
import type { SimulacaoSnapshot } from "@/features/originacao/types";
import { fmtBRL } from "@/lib/utils";

interface ProposalTaskHeaderProps {
  title: string;
  simulation: SimulacaoSnapshot;
  progress?: number;
  backLabel: string;
  onBack: () => void;
  onLogout?: () => void;
}

export function ProposalTaskHeader({
  title,
  simulation,
  progress,
  backLabel,
  onBack,
  onLogout,
}: ProposalTaskHeaderProps) {
  return (
    <OriginacaoTaskHeader
      title={title}
      subtitle={`${fmtBRL(simulation.valor)} · ${simulation.parcelas}x · ${simulation.produto}`}
      progress={progress}
      backLabel={backLabel}
      onBack={onBack}
      onLogout={onLogout}
    />
  );
}
