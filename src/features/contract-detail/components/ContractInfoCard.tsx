import { fmtBRL } from "@/lib/utils";

interface ContractInfoCardProps {
  installmentValue: number;
  installmentNumber: number;
  totalInstallments: number;
  nextDue: string;
}

export function ContractInfoCard({
  installmentValue,
  installmentNumber,
  totalInstallments,
  nextDue,
}: ContractInfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="mb-1 text-xs text-muted-foreground/80">
        Valor da parcela
      </p>
      <div className="flex items-center justify-between gap-3">
        <span className="font-fraunces text-2xl font-bold text-foreground">
          {fmtBRL(installmentValue)}
        </span>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          Parcela {installmentNumber} de {totalInstallments}
        </span>
      </div>
      <div className="my-3 h-px bg-border" />
      <div className="grid grid-cols-2 gap-y-3">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Parcela
          </p>
          <p className="text-sm font-semibold text-foreground">
            {fmtBRL(installmentValue)}
          </p>
        </div>
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Próx. vencimento
          </p>
          <p className="text-sm font-semibold text-foreground">{nextDue}</p>
        </div>
      </div>
    </div>
  );
}
