import type {
  ActivityType,
  ChargeClient,
  ChargeStage,
  PrevClient,
} from "@/features/dashboard/mocks/tasks";
import type {
  ActivityChannel,
  OverdueCollectionItem,
  PreventiveCollectionItem,
} from "@/services/dashboard/dashboard.types";
import { getFollowUpStatusLabel } from "@/services/followup/followup-labels";
import {
  getReguaBadge,
  getReguaBadgeWhenNoTask,
} from "@/features/dashboard/utils/collection-stage";

function mapChannelToActivityType(channel?: ActivityChannel): ActivityType {
  if (channel === "client_visit") return "visit";
  return "phone";
}

/**
 * Maps backend latestFollowupStatus + followupCount to frontend ChargeStage.
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

export function mapOverdueItemToChargeClient(item: OverdueCollectionItem): ChargeClient {
  const { installment, contract, client, task } = item;
  const followup = item.followup;
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
    stage: mapFollowupStatusToStage(followup?.latestStatus, followup?.count ?? 0),
    lastAction: followup?.latestStatus
      ? `${followup.count} follow-up(s) · ${getFollowUpStatusLabel(followup.latestStatus)}`
      : null,
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
