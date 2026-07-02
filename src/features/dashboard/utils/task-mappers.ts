import type {
  ActivityType,
  ChargeClient,
  ChargeStage,
  PrevClient,
} from "@/features/dashboard/mocks/tasks";
import {
  ActivityChannel,
  type ActivityTaskSummary,
  type OverdueCollectionItem,
  type PreventiveCollectionItem,
} from "@/services/dashboard/dashboard.types";
import { getChannelShortLabel } from "@/features/dashboard/utils/charge-channel";
import {
  formatContractCardLabel,
  formatParcelaCardLabel,
} from "@/lib/format/installment";
import {
  getReguaBadge,
  getReguaBadgeWhenNoTask,
  getStageCodeWhenNoTask,
} from "@/features/dashboard/utils/collection-stage";

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluída",
  cancelled: "Cancelada",
};

function mapChannelToActivityType(channel?: ActivityChannel): ActivityType {
  if (channel === ActivityChannel.CLIENT_VISIT) return "visit";
  return "phone";
}

/**
 * Maps backend latestFollowupStatus + followupCount to frontend ChargeStage.
 * Used on contract detail when deriving status from preventive follow-up history.
 */
export function mapFollowupStatusToStage(
  status: string | undefined,
  followupCount = 0,
): ChargeStage {
  if (!status) {
    return "initial";
  }

  const statusLower = status.toLowerCase();

  if (
    statusLower === "promise_to_pay" ||
    statusLower.includes("promise") ||
    statusLower.includes("promessa")
  ) {
    return followupCount > 1 ? "fup" : "promise";
  }

  if (statusLower === "no_forecast" || statusLower.includes("sem previsão")) {
    return "sem_previsao";
  }

  if (statusLower === "no_answer" || statusLower.includes("sem retorno")) {
    if (followupCount >= 2) return "third_attempt";
    if (followupCount >= 1) return "second_attempt";
    return "initial";
  }

  if (
    statusLower === "contacted" ||
    statusLower.includes("paid") ||
    statusLower.includes("pago")
  ) {
    return "paid";
  }

  if (statusLower.includes("fup") || statusLower.includes("followup")) {
    return "fup";
  }

  return "initial";
}

function formatTaskLastAction(task: ActivityTaskSummary): string {
  const channelLabel = getChannelShortLabel(task.channel);
  const statusLabel = TASK_STATUS_LABELS[task.status] ?? task.status;
  return `${channelLabel} · ${statusLabel}`;
}

export function mapOverdueItemToChargeClient(
  item: OverdueCollectionItem,
): ChargeClient {
  const { installment, contract, client, task } = item;
  const activityType: ActivityType = task
    ? mapChannelToActivityType(task.channel)
    : installment.daysOverdue > 30
      ? "visit"
      : "phone";

  const stageCode = task
    ? task.stageCode
    : getStageCodeWhenNoTask(installment.daysOverdue);
  const reguaBadge = task
    ? getReguaBadge(task.stageCode, task.stageBadgeLabel)
    : getReguaBadgeWhenNoTask(installment.daysOverdue);

  return {
    id: contract.id,
    name: client.name,
    contract: formatContractCardLabel(contract.number),
    parcela: formatParcelaCardLabel(
      installment.number,
      contract.totalInstallments,
    ),
    value: installment.pendingAmount,
    overdueDays: installment.daysOverdue,
    phone: client.phone ?? "",
    address: client.address,
    activityType,
    stage: "initial",
    lastAction: task ? formatTaskLastAction(task) : null,
    stageCode,
    reguaBadge,
  };
}

export function mapPreventiveItemToPrevClient(
  item: PreventiveCollectionItem,
): PrevClient {
  const { installment, contract, client, followup } = item;
  const activityType: ActivityType =
    installment.daysUntilDue > 7 ? "visit" : "phone";

  return {
    id: contract.id,
    installmentId: installment.id,
    name: client.name,
    contract: formatContractCardLabel(contract.number),
    parcela: formatParcelaCardLabel(
      installment.number,
      contract.totalInstallments,
    ),
    value: installment.pendingAmount,
    daysUntilDue: installment.daysUntilDue,
    installmentNumber: installment.number,
    followupCount: followup.count,
    phone: client.phone ?? "",
    address: client.address,
    activityType,
  };
}

/** @deprecated Use mapPreventiveItemToPrevClient */
export const mapPreventiveContractToPrevClient = mapPreventiveItemToPrevClient;

/** Normaliza daysInfo para templates WhatsApp do fluxo preventivo. */
export function formatPreventiveDaysInfo(daysUntilDue: number): string {
  if (daysUntilDue === 0) return "Vence hoje";
  if (daysUntilDue === 1) return "Vence amanhã";
  if (daysUntilDue === 2) return "Vence em 2 dias";
  if (daysUntilDue <= 5) return "Vence em 5 dias";
  return `Vence em ${daysUntilDue} dias`;
}
