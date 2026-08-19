import { buildTaskHistoryTimeline } from "@/features/contract-detail/mappers/build-task-history-timeline";
import type {
  AlertType,
  ContractDetailView,
  StatusColor,
} from "@/features/contract-detail/types";
import { getReguaBadge } from "@/features/dashboard/utils/collection-stage";
import { getPendingActionLabel } from "@/features/dashboard/utils/pending-action-label";
import { formatClientAddress, hasValidAddress } from "@/lib/contact-actions";
import { formatDate } from "@/lib/format/date";
import { formatTaxId } from "@/lib/format/tax-id";
import { getActivityInteractionChannelLabel } from "@/services/activities/activity-interaction-labels";
import {
  mapTaskTypeToChannel,
  mapToneToStageCode,
} from "@/services/activities/activity-task-mapping";
import {
  ActivityTaskStatus,
  ActivityTaskType,
} from "@/services/activities/activity.enums";
import type {
  InstallmentDetail,
  TaskHistoryItem,
} from "@/services/activities/installment-detail.types";
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";

export interface InstallmentDetailListContext {
  item?: OverdueCollectionItem;
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

function getPendingOrLatestTask(detail: InstallmentDetail) {
  return (
    detail.tasks.find((task) => task.status === ActivityTaskStatus.PENDING) ??
    detail.tasks[0]
  );
}

function getTaskStageStatusLabel(task: TaskHistoryItem): string {
  if (task.status === ActivityTaskStatus.PENDING) {
    if (task.interaction?.channel) {
      return `${getActivityInteractionChannelLabel(task.interaction.channel)} pendente`;
    }
    return getPendingActionLabel(mapTaskTypeToChannel(task.taskType));
  }

  const typeLabel =
    task.taskType === ActivityTaskType.VISIT ? "Visita" : "Contato";

  if (task.status === ActivityTaskStatus.COMPLETED) {
    return `${typeLabel} concluída`;
  }
  if (task.status === ActivityTaskStatus.CANCELLED) {
    return `${typeLabel} cancelada`;
  }
  if (task.status === ActivityTaskStatus.SYSTEM_CLOSED) {
    return `${typeLabel} encerrada`;
  }

  return typeLabel;
}

function getChargeStatusColor(task: TaskHistoryItem): StatusColor {
  const stageCode = mapToneToStageCode(task.tone);
  const regua = getReguaBadge(stageCode);
  if (regua) return mapStageColor(regua.color);

  return mapStageColor(
    stageCode === "warning"
      ? "red"
      : stageCode === "assertive"
        ? "amber"
        : "blue",
  );
}

function getChargeStatus(detail: InstallmentDetail): {
  label: string;
  color: StatusColor;
} {
  const currentTask = getPendingOrLatestTask(detail);
  if (currentTask) {
    return {
      label: getTaskStageStatusLabel(currentTask),
      color: getChargeStatusColor(currentTask),
    };
  }

  const daysOverdue = detail.installment.daysOverdue;
  if (daysOverdue > 0) {
    return { label: `${daysOverdue}d em atraso`, color: "red" };
  }

  return { label: "Em dia", color: "blue" };
}

export function mapInstallmentDetailToView(
  detail: InstallmentDetail,
  context?: InstallmentDetailListContext,
): ContractDetailView {
  const listItem = context?.item;
  const daysOverdue = detail.installment.daysOverdue;
  const status = getChargeStatus(detail);

  const businessName =
    listItem?.contract.companyName ??
    detail.contract.companyName ??
    detail.client.name ??
    detail.contract.number;

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
    businessName,
    clientName: detail.client.name,
    clientTaxId: detail.client.taxId
      ? formatTaxId(detail.client.taxId)
      : undefined,
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
    nextDue: formatDate(detail.installment.dueDate),
    alertDays: Math.max(0, daysOverdue),
    alertType: "overdue" satisfies AlertType,
    timeline: buildTaskHistoryTimeline(
      detail.tasks,
      detail.installment.dueDate,
    ),
  };
}
