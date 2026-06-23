import { differenceInCalendarDays, startOfDay } from "date-fns";
import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import { STAGE_INFO } from "@/features/dashboard/mocks/tasks";
import { mapFollowupStatusToStage } from "@/features/dashboard/utils/task-mappers";
import { buildFollowUpTimeline } from "@/features/contract-detail/utils/build-follow-up-timeline";
import { buildPreventiveTimeline } from "@/features/contract-detail/utils/build-preventive-timeline";
import { formatDueDate } from "@/features/contract-detail/utils/format-date";
import { formatTaxId } from "@/features/contract-detail/utils/format-tax-id";
import type {
  AlertType,
  ContractDetailView,
  DetailMode,
  StatusColor,
} from "@/features/contract-detail/types";
import {
  formatClientAddress,
  hasValidAddress,
} from "@/lib/contact-actions";
import type {
  CollectionDetail,
  OverdueContract,
  PreventiveContract,
} from "@/services/dashboard/dashboard.types";

export interface CollectionListContext {
  contract?: OverdueContract | PreventiveContract;
}

function mapStageColor(color: string): StatusColor {
  const map: Record<string, StatusColor> = {
    blue: "blue",
    amber: "amber",
    red: "red",
    green: "green",
    teal: "green",
    gray: "blue",
  };
  return map[color] ?? "amber";
}

function getDaysFromDueDate(dueDate: string): number {
  const due = startOfDay(new Date(dueDate));
  const today = startOfDay(new Date());
  return differenceInCalendarDays(today, due);
}

function getChargeStatus(
  detail: CollectionDetail,
  daysOverdue: number,
): { label: string; color: StatusColor } {
  const latestStatus = detail.followUps[0]?.status;
  if (latestStatus) {
    const stage = mapFollowupStatusToStage(
      latestStatus,
      detail.followUps.length,
    ) as CobrStage;
    const stageInfo = STAGE_INFO[stage];
    return {
      label: stageInfo.label,
      color: mapStageColor(stageInfo.color),
    };
  }

  if (daysOverdue > 0) {
    return { label: `${daysOverdue}d em atraso`, color: "red" };
  }

  return { label: "Em dia", color: "blue" };
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
      detail.followUps,
    );
  }

  return buildFollowUpTimeline(detail.followUps);
}

export function mapCollectionDetailToView(
  detail: CollectionDetail,
  mode: DetailMode,
  context?: CollectionListContext,
): ContractDetailView {
  const listContract = context?.contract;
  const daysFromDue = getDaysFromDueDate(detail.installment.dueDate);
  const nextDue = formatDueDate(detail.installment.dueDate);

  const status =
    mode === TaskTab.Charge
      ? getChargeStatus(detail, daysFromDue)
      : getPreventiveStatus(-daysFromDue);

  const { alertDays, alertType } = getAlertInfo(mode, daysFromDue);

  const businessName =
    listContract?.companyName ?? detail.clientName ?? detail.contractNumber;

  const clientName =
    detail.clientName ?? listContract?.clientName ?? detail.contractNumber;

  const clientTaxId = detail.clientTaxId
    ? formatTaxId(detail.clientTaxId)
    : listContract?.clientTaxId
      ? formatTaxId(listContract.clientTaxId)
      : undefined;

  const address =
    detail.address ??
    (hasValidAddress(listContract?.address) ? listContract?.address : undefined);

  const clientAddress =
    address && hasValidAddress(address)
      ? formatClientAddress(address)
      : undefined;

  return {
    contractId: detail.contractId,
    mode,
    businessName,
    clientName,
    clientTaxId,
    clientAddress,
    address,
    responsibleName: detail.responsible?.name,
    responsibleType: detail.responsible?.type,
    contractCode: detail.contractNumber,
    statusLabel: status.label,
    statusColor: status.color,
    installmentValue: detail.installment.pendingAmount,
    installmentTotalAmount: detail.installment.totalAmount,
    installmentNumber: detail.installment.installmentNumber,
    totalInstallments: detail.totalInstallments,
    contractTotalAmount: detail.contractTotalAmount,
    contractStartDate: detail.contractStartDate
      ? formatDueDate(detail.contractStartDate)
      : undefined,
    contractEndDate: detail.contractEndDate
      ? formatDueDate(detail.contractEndDate)
      : undefined,
    nextDue,
    alertDays,
    alertType,
    timeline: buildTimeline(detail, mode),
    source: listContract,
  };
}
