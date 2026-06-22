import { AlertTriangle, Calendar } from "lucide-react";
import type { AlertType } from "@/features/contract-detail/types";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  type: AlertType;
  days: number;
  onAction: () => void;
}

export function AlertCard({ type, days, onAction }: AlertCardProps) {
  const isOverdue = type === "overdue";
  const borderColor = isOverdue ? "border-l-[#D84040]" : "border-l-[#BA7517]";
  const bgColor = isOverdue ? "bg-[#FEECEC]" : "bg-[#FDF3E0]";
  const iconColor = isOverdue ? "text-[#D84040]" : "text-[#BA7517]";

  const title = isOverdue
    ? `${days} dia${days !== 1 ? "s" : ""} em atraso`
    : days === 0
      ? "Vence hoje"
      : days === 1
        ? "Vence amanhã"
        : `Vencimento em ${days} dia${days !== 1 ? "s" : ""}`;

  const subtitle = isOverdue
    ? "Registre o retorno da cobrança para avançar na jornada."
    : "Inicie o contato preventivo com o cliente.";

  const btnLabel = isOverdue
    ? "Registrar retorno de cobrança"
    : "Registrar contato preventivo";

  return (
    <div
      className={cn(
        "rounded-2xl border border-border border-l-4 p-4",
        borderColor,
        bgColor,
      )}
    >
      <div className="mb-3 flex items-start gap-2">
        <AlertTriangle size={18} className={cn("mt-0.5 shrink-0", iconColor)} />
        <div>
          <p className={cn("text-sm font-semibold", iconColor)}>{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <Calendar size={15} className={iconColor} />
        {btnLabel}
      </button>
    </div>
  );
}
