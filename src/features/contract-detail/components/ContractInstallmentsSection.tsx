import { ChevronRight, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertBadge } from "@/features/contract-detail/components/AlertBadge";
import { installmentSubtitle } from "@/features/contract-detail/utils/installment-subtitle";
import { useContractInstallments } from "@/hooks/useContractInstallments";
import { cn, fmtBRL } from "@/lib/utils";
import type {
  ContractInstallmentDisplayStatus,
  ContractInstallmentItem,
} from "@/services/contracts/contracts.types";

const STATUS_META: Record<
  ContractInstallmentDisplayStatus,
  { label: string; className: string }
> = {
  paid: { label: "Paga", className: "bg-[#E6F7F1] text-[#0F6E56]" },
  overdue: { label: "Atrasada", className: "bg-[#FEECEC] text-[#A32D2D]" },
  due_today: { label: "Vence hoje", className: "bg-[#FDF3E0] text-[#854F0B]" },
  upcoming: {
    label: "A vencer",
    className: "bg-muted text-muted-foreground",
  },
};

/** AUREA-346: contagem de follow-ups já registrados pra uma parcela atrasada. */
function FollowUpCountBadge({ count }: { count: number }) {
  const label =
    count === 0
      ? "Sem follow-up"
      : count === 1
        ? "1 follow-up"
        : `${count} follow-ups`;

  return (
    <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
      <MessageSquare size={9} />
      {label}
    </span>
  );
}

interface ContractInstallmentRowProps {
  item: ContractInstallmentItem;
  onOpen: () => void;
}

function ContractInstallmentRow({ item, onOpen }: ContractInstallmentRowProps) {
  const meta = STATUS_META[item.displayStatus];
  const highlighted = item.displayStatus === "due_today";
  // AUREA-346: atraso/follow-ups só existem pra parcela atrasada (o backend
  // já garante isso — checar displayStatus aqui é só defensivo).
  const isOverdue = item.displayStatus === "overdue";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors",
        highlighted
          ? "border-[#FAC775] bg-[#FDF3E0]/40"
          : "border-border hover:bg-muted/40",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Parcela {item.number}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {installmentSubtitle(item)} &middot; {fmtBRL(item.totalAmount)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              meta.className,
            )}
          >
            {meta.label}
          </span>
          <ChevronRight size={16} className="text-muted-foreground/60" />
        </div>
      </div>
      {isOverdue && item.daysOverdue !== undefined && (
        <div className="flex flex-wrap items-center gap-1.5">
          <AlertBadge type="overdue" days={item.daysOverdue} />
          <FollowUpCountBadge count={item.followUpsCount ?? 0} />
        </div>
      )}
    </button>
  );
}

interface ContractInstallmentsSectionProps {
  contractId: string;
}

/**
 * AUREA-346: lista todas as parcelas do contrato com status real (paga /
 * atrasada / vence hoje / a vencer), em vez de mostrar uma parcela escolhida
 * arbitrariamente. Ao escolher uma parcela, abre o detalhe rico dessa
 * parcela específica (com ação de registrar follow-up habilitada).
 */
export function ContractInstallmentsSection({
  contractId,
}: ContractInstallmentsSectionProps) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useContractInstallments(contractId);

  function openInstallment(number: number) {
    navigate(`/carteira/contratos/${contractId}/parcelas/${number}`);
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
        Parcelas
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <p className="py-4 text-center text-sm text-[#A32D2D]">
          Não foi possível carregar as parcelas.
        </p>
      ) : !data || data.items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhuma parcela encontrada para este contrato.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.items.map((item) => (
            <ContractInstallmentRow
              key={item.number}
              item={item}
              onOpen={() => openInstallment(item.number)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
