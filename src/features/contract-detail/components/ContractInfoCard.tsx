import { AlertBadge } from "@/features/contract-detail/components/AlertBadge";
import type { ContractDetailView } from "@/features/contract-detail/types";
import { fmtBRL } from "@/lib/utils";

interface ContractInfoCardProps {
  detail: ContractDetailView;
  /**
   * AUREA-346: no resumo do contrato (Carteira sem parcela escolhida), não
   * existe uma parcela "em foco" de verdade — o backend só usa uma pra
   * montar o header/valores. Esconde o pill "Parcela X de Y" e o alerta de
   * atraso (que são sobre essa parcela auto-resolvida) pra não sugerir que
   * ela é o que está sendo visto.
   */
  hideInstallmentBadge?: boolean;
  /** Oculta valores associados a uma parcela auto-selecionada no resumo. */
  showInstallmentInfo?: boolean;
}

export function ContractInfoCard({
  detail,
  hideInstallmentBadge = false,
  showInstallmentInfo = true,
}: ContractInfoCardProps) {
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
      {!hideInstallmentBadge && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Parcela {installmentNumber} de {totalInstallments}
          </span>
          {alertType !== undefined && alertDays !== undefined && (
            <AlertBadge type={alertType} days={alertDays} />
          )}
        </div>
      )}
      <div className="my-3 h-px bg-border" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        {showInstallmentInfo ? (
          <>
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                Parcela
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {fmtBRL(installmentTotalAmount)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                Próx. vencimento
              </p>
              <p className="truncate text-sm font-semibold text-foreground">
                {nextDue}
              </p>
            </div>
          </>
        ) : (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Parcelas
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {totalInstallments}
            </p>
          </div>
        )}
        {contractStartDate && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Início
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {contractStartDate}
            </p>
          </div>
        )}
        {contractEndDate && (
          <div className="min-w-0">
            <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              Término
            </p>
            <p className="truncate text-sm font-semibold text-foreground">
              {contractEndDate}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
