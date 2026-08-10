import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fmtBRL } from "@/lib/utils";
import type { ContractListItem } from "@/services/contracts/contracts.types";
import {
  daysOverdueFromDueDate,
  formatDaysOverdue,
  formatRenegotiated,
  parseDateOnly,
} from "@/features/carteira/utils/contract-detail";

function fmtDate(value?: string): string {
  if (!value) return "—";
  const d = parseDateOnly(value);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
}

function daysOverdueLabel(contract: ContractListItem): string {
  if (typeof contract.daysOverdue === "number") {
    return formatDaysOverdue(Math.max(0, contract.daysOverdue));
  }
  return formatDaysOverdue(daysOverdueFromDueDate(contract.nextDueDate));
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-[#9DA3B4]">{label}</span>
      <span className="text-sm font-medium text-[#1A1D2E]">{value}</span>
    </div>
  );
}

interface ContractDetailDialogProps {
  contract: ContractListItem | null;
  onOpenChange: (open: boolean) => void;
}

export function ContractDetailDialog({
  contract,
  onOpenChange,
}: ContractDetailDialogProps) {
  return (
    <Dialog open={contract != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {contract ? (
          <>
            <DialogHeader>
              <DialogTitle>Contrato {contract.contractNumber}</DialogTitle>
              <DialogDescription>
                {contract.clientName} · {contract.productName}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <DetailField
                label="Valor desembolsado"
                value={fmtBRL(contract.disbursedAmount)}
              />
              <DetailField
                label="Valor projetado"
                value={fmtBRL(contract.projectedAmount)}
              />
              <DetailField
                label="Saldo pendente"
                value={fmtBRL(contract.outstandingBalance)}
              />
              <DetailField
                label="Parcelas totais"
                value={String(contract.totalInstallments)}
              />
              <DetailField
                label="Data de desembolso"
                value={fmtDate(contract.disbursementDate)}
              />
              <DetailField
                label="Próximo vencimento"
                value={fmtDate(contract.nextDueDate)}
              />
              <DetailField
                label="Dias em atraso"
                value={daysOverdueLabel(contract)}
              />
              <DetailField
                label="Renegociado"
                value={formatRenegotiated(contract.renegotiated)}
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
