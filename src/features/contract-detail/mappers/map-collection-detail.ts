import { differenceInCalendarDays, startOfDay } from "date-fns";
import { TaskTab } from "@/features/dashboard/constants/task-tab";
import { buildFollowUpTimeline } from "@/features/contract-detail/mappers/build-follow-up-timeline";
import { buildPreventiveTimeline } from "@/features/contract-detail/mappers/build-preventive-timeline";
import type {
  AlertType,
  ContractDetailView,
  DetailMode,
  StatusColor,
} from "@/features/contract-detail/types";
import { formatClientAddress, hasValidAddress } from "@/lib/contact-actions";
import { formatDate } from "@/lib/format/date";
import { formatTaxId } from "@/lib/format/tax-id";
import type {
  CollectionDetail,
  OverdueCollectionItem,
  PreventiveCollectionItem,
} from "@/services/dashboard/dashboard.types";

export interface CollectionListContext {
  item?: OverdueCollectionItem | PreventiveCollectionItem;
}

function getDaysFromDueDate(dueDate: string): number {
  const due = startOfDay(new Date(dueDate));
  const today = startOfDay(new Date());
  return differenceInCalendarDays(today, due);
}

function getPreventiveStatus(daysUntilDue: number): {
  label: string;
  color: StatusColor;
} {
  if (daysUntilDue > 0) {
    if (daysUntilDue === 1) {
      return { label: "Vence amanhã", color: "amber" };
    }
    return { label: `Vence em ${daysUntilDue}d`, color: "blue" };
  }

  if (daysUntilDue === 0) {
    return { label: "Vence hoje", color: "red" };
  }

  return {
    label: `${Math.abs(daysUntilDue)}d em atraso`,
    color: "red",
  };
}

function getAlertInfo(
  mode: DetailMode,
  daysFromDue: number,
): { alertDays: number; alertType: AlertType } {
  if (mode === TaskTab.Charge) {
    return {
      alertDays: Math.max(0, daysFromDue),
      alertType: "overdue",
    };
  }

  return {
    alertDays: Math.max(0, -daysFromDue),
    alertType: "renewal",
  };
}

function buildTimeline(
  detail: CollectionDetail,
  mode: DetailMode,
): ContractDetailView["timeline"] {
  if (mode === TaskTab.Preventive) {
    return buildPreventiveTimeline(
      detail.installment.dueDate,
      detail.followups,
    );
  }

  return buildFollowUpTimeline(detail.followups);
}

/** Detalhe Preventivo via GET /collections/:contractId/installments/:n */
export function mapCollectionDetailToView(
  detail: CollectionDetail,
  mode: DetailMode,
  context?: CollectionListContext,
): ContractDetailView {
  const listItem = context?.item;
  const daysFromDue = getDaysFromDueDate(detail.installment.dueDate);
  const nextDue = formatDate(detail.installment.dueDate);

  const status = getPreventiveStatus(-daysFromDue);

  const { alertDays, alertType } = getAlertInfo(mode, daysFromDue);

  const businessName =
    listItem?.contract.companyName ??
    detail.client.name ??
    detail.contract.number;

  const clientName = detail.client.name;

  const clientTaxId = detail.client.taxId
    ? formatTaxId(detail.client.taxId)
    : undefined;

  const address =
    detail.client.address ??
    (hasValidAddress(listItem?.client.address)
      ? listItem?.client.address
      : undefined);

  const clientAddress =
    address && hasValidAddress(address)
      ? formatClientAddress(address)
      : undefined;

  return {
    contractId: detail.contract.id,
    mode,
    businessName,
    clientName,
    clientTaxId,
    clientAddress,
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
    nextDue,
    alertDays,
    alertType,
    timeline: buildTimeline(detail, mode),
    source: listItem,
  };
}
