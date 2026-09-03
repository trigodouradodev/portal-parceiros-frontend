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
import {
  getReguaBadge,
  getReguaBadgeWhenNoTask,
} from "@/features/dashboard/utils/collection-stage";
import {
  getActivityInteractionChannelLabel,
  getActivityInteractionResultLabel,
} from "@/services/activities/activity-interaction-labels";

const CHANNEL_LABELS: Record<ActivityChannel, string> = {
  [ActivityChannel.WHATSAPP_MESSAGE]: "WhatsApp",
  [ActivityChannel.CLIENT_CALL]: "Ligação",
  [ActivityChannel.CLIENT_VISIT]: "Visita",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  completed: "Concluída",
  cancelled: "Cancelada",
  system_closed: "Encerrada pelo sistema",
};

function mapChannelToActivityType(channel?: ActivityChannel): ActivityType {
  if (channel === ActivityChannel.CLIENT_VISIT) return "visit";
  return "phone";
}

export function mapTaskToChargeStage(task: ActivityTaskSummary): ChargeStage {
  task;
  return "initial";
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

function formatLastInteraction(
  interaction: OverdueCollectionItem["lastInteraction"],
): string | null {
  if (!interaction) return null;

  const channelLabel = getActivityInteractionChannelLabel(interaction.channel);
  const resultLabel = getActivityInteractionResultLabel(interaction.result);

  return `${channelLabel} · ${resultLabel}`;
}

function formatTaskLastAction(task: ActivityTaskSummary): string {
  const channelLabel = CHANNEL_LABELS[task.channel] ?? task.channel;
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

  const reguaBadge = task
    ? getReguaBadge(task.stageCode, task.stageBadgeLabel)
    : getReguaBadgeWhenNoTask(installment.daysOverdue);

  return {
    id: contract.id,
    name: client.name,
    contract: contract.number,
    parcela: installment.label,
    value: installment.pendingAmount,
    overdueDays: installment.daysOverdue,
    phone: client.phone ?? "",
    address: client.address,
    activityType,
    stage: task ? mapTaskToChargeStage(task) : "initial",
    lastAction:
      formatLastInteraction(item.lastInteraction) ??
      (task ? formatTaskLastAction(task) : null),
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
    contract: contract.number,
    parcela: installment.label,
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
