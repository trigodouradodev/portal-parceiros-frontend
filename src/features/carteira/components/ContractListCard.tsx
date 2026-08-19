import { formatDate } from "@/lib/format/date";
import { fmtBRL } from "@/lib/utils";
import type { ContractListItem } from "@/services/contracts/contracts.types";

function fmtDate(value?: string): string {
  if (!value) return "—";
  return formatDate(value);
}

interface ContractListCardProps {
  contract: ContractListItem;
  onOpen: () => void;
}

/** Card do contrato pra viewport mobile — a tabela vira `hidden` abaixo de `md`. */
export function ContractListCard({ contract, onOpen }: ContractListCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex flex-col gap-2.5 rounded-xl border border-border bg-white p-3.5 text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-brand-navy underline decoration-brand-navy/30">
            {contract.contractNumber}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {contract.clientName}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
          {contract.productName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-2.5">
        <div>
          <p className="text-[10px] text-muted-foreground">Saldo pendente</p>
          <p className="text-sm font-semibold text-foreground">
            {fmtBRL(contract.outstandingBalance)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Desembolsado</p>
          <p className="text-sm font-semibold text-foreground">
            {fmtBRL(contract.disbursedAmount)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{contract.totalInstallments} parcelas</span>
        <span>Próx. vencimento: {fmtDate(contract.nextDueDate)}</span>
      </div>
    </button>
  );
}
