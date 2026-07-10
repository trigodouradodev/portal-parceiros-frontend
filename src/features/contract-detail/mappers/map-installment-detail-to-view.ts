import { TaskTab } from "@/features/dashboard/constants/task-tab";
import { getQueueToneLabel } from "@/features/dashboard/constants/charge-queue-tone";
import { buildTaskHistoryTimeline } from "@/features/contract-detail/mappers/build-task-history-timeline";
import type {
  AlertType,
  ContractDetailView,
  StatusColor,
} from "@/features/contract-detail/types";
import { getReguaBadge } from "@/features/dashboard/utils/collection-stage";
import { formatClientAddress, hasValidAddress } from "@/lib/contact-actions";
import { formatDate } from "@/lib/format/date";
import { formatTaxId } from "@/lib/format/tax-id";
import { mapToneToStageCode } from "@/services/activities/activity-task-mapping";
import type { InstallmentDetail } from "@/services/activities/installment-detail.types";
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
    detail.tasks.find((task) => task.status === "pending") ?? detail.tasks[0]
  );
}

function getChargeStatus(detail: InstallmentDetail): {
  label: string;
  color: StatusColor;
} {
  const currentTask = getPendingOrLatestTask(detail);
  if (currentTask) {
    const stageCode = mapToneToStageCode(currentTask.tone);
    const regua = getReguaBadge(stageCode, currentTask.segmentBadgeLabel);
    if (regua) {
      return {
        label: regua.label,
        color: mapStageColor(regua.color),
      };
    }

    return {
      label: getQueueToneLabel(currentTask.tone, stageCode),
      color: mapStageColor(
        stageCode === "warning"
          ? "red"
          : stageCode === "assertive"
            ? "amber"
            : "blue",
      ),
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
    mode: TaskTab.Charge,
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
    timeline: buildTaskHistoryTimeline(detail.tasks),
    source: listItem,
  };
}
