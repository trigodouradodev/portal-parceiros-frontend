import { AlertBadge } from "@/features/contract-detail/components/AlertBadge";
import type { ContractDetailView } from "@/features/contract-detail/types";
import { fmtBRL } from "@/lib/utils";

interface ContractInfoCardProps {
  detail: ContractDetailView;
}

export function ContractInfoCard({ detail }: ContractInfoCardProps) {
  const {
    contractTotalAmount,
    installmentTotalAmount,
    installmentNumber,
    totalInstallments,
    contractStartDate,
    contractEndDate,
    nextDue,
    alertType,
    alertDays,
  } = detail;

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="mb-1 text-xs text-muted-foreground/80">
        Valor total do contrato
      </p>
      <span className="font-fraunces text-2xl font-bold text-foreground">
        {fmtBRL(contractTotalAmount)}
      </span>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          Parcela {installmentNumber} de {totalInstallments}
        </span>
        {alertType !== undefined && alertDays !== undefined && (
          <AlertBadge type={alertType} days={alertDays} />
        )}
      </div>
      <div className="my-3 h-px bg-border" />
      <div className="grid grid-cols-2 gap-y-3">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Parcela
          </p>
          <p className="text-sm font-semibold text-foreground">
            {fmtBRL(installmentTotalAmount)}
          </p>
        </div>
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Próx. vencimento
          </p>
          <p className="text-sm font-semibold text-foreground">{nextDue}</p>
        </div>
        {contractStartDate && (
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Início
            </p>
            <p className="text-sm font-semibold text-foreground">
              {contractStartDate}
            </p>
          </div>
        )}
        {contractEndDate && (
          <div>
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Término
            </p>
            <p className="text-sm font-semibold text-foreground">
              {contractEndDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
