import { differenceInCalendarDays, startOfDay } from "date-fns";
import { buildFollowUpTimeline } from "@/features/contract-detail/mappers/build-follow-up-timeline";
import type {
  AlertType,
  ContractDetailView,
  StatusColor,
  TimelineStep,
} from "@/features/contract-detail/types";
import { formatClientAddress, hasValidAddress } from "@/lib/contact-actions";
import { formatDate } from "@/lib/format/date";
import { formatTaxId } from "@/lib/format/tax-id";
import type { CollectionDetail } from "@/services/dashboard/dashboard.types";

function getDaysFromDueDate(dueDate: string): number {
  return differenceInCalendarDays(
    startOfDay(new Date()),
    startOfDay(new Date(dueDate)),
  );
}

function getInstallmentStatus(daysUntilDue: number): {
  label: string;
  color: StatusColor;
} {
  if (daysUntilDue > 0) {
    return daysUntilDue === 1
      ? { label: "Vence amanhã", color: "amber" }
      : { label: `Vence em ${daysUntilDue}d`, color: "blue" };
  }
  if (daysUntilDue === 0) return { label: "Vence hoje", color: "red" };
  return { label: `${Math.abs(daysUntilDue)}d em atraso`, color: "red" };
}

function mapPortfolioDetail(
  detail: CollectionDetail,
  timeline: TimelineStep[],
): ContractDetailView {
  const daysFromDue = getDaysFromDueDate(detail.installment.dueDate);
  const status = getInstallmentStatus(-daysFromDue);
  const address = detail.client.address;

  return {
    contractId: detail.contract.id,
    businessName: detail.client.name ?? detail.contract.number,
    clientName: detail.client.name,
    clientTaxId: detail.client.taxId
      ? formatTaxId(detail.client.taxId)
      : undefined,
    clientAddress:
      address && hasValidAddress(address)
        ? formatClientAddress(address)
        : undefined,
    address,
    responsibleName: detail.responsible?.name,
    responsibleType: detail.responsible?.type,
    contractCode: detail.contract.number,
    statusLabel: status.label,
    statusColor: status.color,
    installmentValue: detail.installment.pendingAmount,
    installmentTotalAmount: detail.installment.totalAmount,
    installmentNumber: detail.installment.number,
    totalInstallments: detail.contract.totalInstallments,
    contractTotalAmount: detail.contract.totalAmount,
    contractStartDate: detail.contract.startDate
      ? formatDate(detail.contract.startDate)
      : undefined,
    contractEndDate: detail.contract.endDate
      ? formatDate(detail.contract.endDate)
      : undefined,
    nextDue: formatDate(detail.installment.dueDate),
    alertDays: Math.max(0, -daysFromDue),
    alertType: "renewal" satisfies AlertType,
    timeline,
    clientEmail: detail.client.email,
    contractStatus: detail.contract.status,
    productName: detail.contract.productName,
    companyName: detail.contract.companyName,
    originationConsultantName: detail.contract.originationConsultantName,
    guarantor: detail.guarantor,
    statusHistory: detail.statusHistory,
  };
}

/** Dados gerais: não processa os follow-ups retornados para a parcela auto-resolvida. */
export function mapPortfolioContractDetailToView(
  detail: CollectionDetail,
): ContractDetailView {
  return mapPortfolioDetail(detail, []);
}

/** Detalhe da parcela: timeline composta apenas pelos follow-ups dessa parcela. */
export function mapPortfolioInstallmentDetailToView(
  detail: CollectionDetail,
): ContractDetailView {
  return mapPortfolioDetail(detail, buildFollowUpTimeline(detail.followups));
}
