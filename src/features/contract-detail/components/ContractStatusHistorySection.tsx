import { ArrowRight } from "lucide-react";
import type { ContractStatusHistoryItem } from "@/services/dashboard/dashboard.types";
import { contractStatusLabel } from "@/features/contract-detail/utils/contract-status-label";
import { formatDateTime } from "@/lib/format/date";

interface ContractStatusHistorySectionProps {
  items: ContractStatusHistoryItem[];
}

/**
 * AUREA-346: histórico de mudanças de status do contrato
 * (contract_status_history) — mais recente primeiro. Não aparece se o
 * contrato não tiver nenhuma transição registrada.
 */
export function ContractStatusHistorySection({
  items,
}: ContractStatusHistorySectionProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
        Histórico de status
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <span>{contractStatusLabel(item.oldStatus)}</span>
              <ArrowRight
                size={12}
                className="shrink-0 text-muted-foreground"
              />
              <span>{contractStatusLabel(item.newStatus)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(item.createdAt)} · {item.changedByName}
              {item.reason ? ` · ${item.reason}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
