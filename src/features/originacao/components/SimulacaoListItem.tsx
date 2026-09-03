import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  OriginacaoSnapshotCard,
  OriginacaoToneBadge,
} from "@/features/originacao/components/OriginacaoSnapshotCard";
import {
  dueDayFromIsoDate,
  formatCreatedAtPtBr,
  isSimulationConverted,
} from "@/features/originacao/data/simulacao";
import type { SimulationSnapshot } from "@/features/originacao/types";
import { fmtBRL } from "@/lib/utils";

interface SimulacaoListItemProps {
  item: SimulationSnapshot;
  canCreateQuote: boolean;
  startingId: string | null;
  onEdit: (snapshot: SimulationSnapshot) => void;
  onStartProposal: (snapshot: SimulationSnapshot) => void;
}

export function SimulacaoListItem({
  item,
  canCreateQuote,
  startingId,
  onEdit,
  onStartProposal,
}: SimulacaoListItemProps) {
  const converted = isSimulationConverted(item);
  const starting = startingId === item.id;

  return (
    <OriginacaoSnapshotCard
      badge={
        <OriginacaoToneBadge tone={converted ? "success" : "warning"}>
          {converted ? "Proposta iniciada" : item.productName}
        </OriginacaoToneBadge>
      }
      timestamp={formatCreatedAtPtBr(item.createdAt)}
      name={item.name}
      amount={item.amount}
      subtitle={`${item.installments}x de ${fmtBRL(item.installmentAmount)} · vencimento dia ${String(dueDayFromIsoDate(item.firstInstallmentDate)).padStart(2, "0")}`}
      cpf={item.document}
    >
      {converted ? null : (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="pillSm"
            disabled={startingId != null}
            onClick={() => onEdit(item)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="pillSm"
            disabled={!canCreateQuote || startingId != null}
            onClick={() => onStartProposal(item)}
          >
            {starting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Iniciando…
              </>
            ) : (
              "Iniciar proposta"
            )}
          </Button>
        </div>
      )}
    </OriginacaoSnapshotCard>
  );
}
