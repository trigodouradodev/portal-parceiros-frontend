import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { CobrStage } from "@/features/dashboard/mocks/tasks";
import { STAGE_INFO } from "@/features/dashboard/mocks/tasks";
import {
  mapFollowupStatusToStage,
  mapPreventiveContractToPrevClient,
} from "@/features/dashboard/utils/task-mappers";
import { buildChargeTimeline } from "@/features/contract-detail/utils/build-charge-timeline";
import { buildPreventiveTimeline } from "@/features/contract-detail/utils/build-preventive-timeline";
import { formatDueDate } from "@/features/contract-detail/utils/format-date";
import type {
  ContractDetailView,
  StatusColor,
} from "@/features/contract-detail/types";
import type {
  OverdueContract,
  PreventiveContract,
} from "@/services/dashboard/dashboard.types";

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

function getChargeStage(contract: OverdueContract): CobrStage {
  const installment = contract.firstOverdueInstallment;
  return mapFollowupStatusToStage(
    installment.latestFollowupStatus,
    installment.followupCount,
  );
}

export function mapOverdueContractToDetail(
  contract: OverdueContract,
): ContractDetailView {
  const installment = contract.firstOverdueInstallment;
  const stage = getChargeStage(contract);
  const stageInfo = STAGE_INFO[stage];
  const nextDue = formatDueDate(installment.dueDate);

  return {
    contractId: contract.contractId,
    mode: TaskTab.Charge,
    businessName: contract.companyName ?? contract.clientName,
    clientName: contract.clientName,
    contractCode: contract.contractNumber,
    partnerName: contract.consultantName ?? contract.collectionAgent?.name,
    statusLabel: stageInfo.label,
    statusColor: mapStageColor(stageInfo.color),
    installmentValue: installment.pendingAmount,
    installmentNumber: installment.installmentNumber,
    totalInstallments: contract.totalInstallments,
    nextDue,
    alertDays: installment.daysOverdue,
    alertType: "overdue",
    timeline: buildChargeTimeline(stage),
    source: contract,
  };
}

export function mapPreventiveContractToDetail(
  contract: PreventiveContract,
): ContractDetailView {
  const installment = contract.nextInstallment;
  const prevClient = mapPreventiveContractToPrevClient(contract);
  const nextDue = formatDueDate(installment.dueDate);

  const statusColor: StatusColor =
    installment.daysUntilDue === 0
      ? "red"
      : installment.daysUntilDue <= 2
        ? "amber"
        : "blue";

  const statusLabel =
    installment.daysUntilDue === 0
      ? "Vence hoje"
      : installment.daysUntilDue === 1
        ? "Vence amanhã"
        : `Vence em ${installment.daysUntilDue}d`;

  return {
    contractId: contract.contractId,
    mode: TaskTab.Preventive,
    businessName: contract.companyName ?? contract.clientName,
    clientName: contract.clientName,
    contractCode: contract.contractNumber,
    partnerName: contract.consultantName ?? contract.collectionAgent?.name,
    statusLabel,
    statusColor,
    installmentValue: installment.pendingAmount,
    installmentNumber: installment.installmentNumber,
    totalInstallments: contract.totalInstallments,
    nextDue,
    alertDays: installment.daysUntilDue,
    alertType: "renewal",
    timeline: buildPreventiveTimeline(
      prevClient.daysUntilDue,
      prevClient.followupCount,
      nextDue,
    ),
    source: contract,
  };
}
