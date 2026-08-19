import { formatDate } from "@/lib/format/date";
import type { ContractInstallmentItem } from "@/services/contracts/contracts.types";

/**
 * AUREA-346: legenda de uma linha da lista de parcelas — varia conforme o
 * status de exibição (paga mostra quando foi paga; atrasada/a vencer mostram
 * a data de vencimento; vence hoje é só o aviso, sem repetir a data).
 */
export function installmentSubtitle(item: ContractInstallmentItem): string {
  if (item.displayStatus === "paid") {
    return item.paymentDate
      ? `Paga em ${formatDate(item.paymentDate)}`
      : "Paga";
  }
  if (item.displayStatus === "due_today") return "Vence hoje";

  const date = formatDate(item.dueDate);
  return item.displayStatus === "overdue" ? `Venceu ${date}` : `Vence ${date}`;
}
