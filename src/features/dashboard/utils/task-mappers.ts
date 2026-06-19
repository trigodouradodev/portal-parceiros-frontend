import type {
  ActivityType,
  CobrClient,
  CobrStage,
  PrevClient,
} from "@/features/dashboard/mocks/tasks";
import type {
  OverdueContract,
  PreventiveContract,
} from "@/services/dashboard/dashboard.types";
import { getFollowUpStatusLabel } from "@/services/followup/followup-labels";

/**
 * Maps backend latestFollowupStatus + followupCount to frontend CobrStage.
 */
export function mapFollowupStatusToStage(
  status: string | undefined,
  followupCount = 0,
): CobrStage {
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

export function mapOverdueContractToCobrClient(
  contract: OverdueContract,
): CobrClient {
  const installment = contract.firstOverdueInstallment;
  const activityType: ActivityType =
    installment.daysOverdue > 30 ? "visit" : "phone";

  return {
    id: contract.contractId,
    name: contract.clientName,
    contract: contract.contractNumber,
    parcela: `Parc ${installment.installmentNumber}/${contract.totalInstallments}`,
    value: installment.pendingAmount,
    overdueDays: installment.daysOverdue,
    phone: contract.clientPhone ?? "",
    activityType,
    stage: mapFollowupStatusToStage(
      installment.latestFollowupStatus,
      installment.followupCount,
    ),
    lastAction: installment.latestFollowupStatus
      ? `${installment.followupCount} follow-up(s) · ${getFollowUpStatusLabel(installment.latestFollowupStatus)}`
      : null,
  };
}

export function mapPreventiveContractToPrevClient(
  contract: PreventiveContract,
): PrevClient {
  const installment = contract.nextInstallment;
  const activityType: ActivityType =
    installment.daysUntilDue > 7 ? "visit" : "phone";

  return {
    id: contract.contractId,
    name: contract.clientName,
    contract: contract.contractNumber,
    parcela: `Parc ${installment.installmentNumber}/${contract.totalInstallments}`,
    value: installment.pendingAmount,
    daysUntilDue: installment.daysUntilDue,
    installmentNumber: installment.installmentNumber,
    followupCount: installment.followupCount,
    phone: contract.clientPhone ?? "",
    address: contract.address,
    activityType,
  };
}

/** Normaliza daysInfo para templates WhatsApp do fluxo preventivo. */
export function formatPreventiveDaysInfo(daysUntilDue: number): string {
  if (daysUntilDue === 0) return "Vence hoje";
  if (daysUntilDue === 1) return "Vence amanhã";
  if (daysUntilDue === 2) return "Vence em 2 dias";
  if (daysUntilDue <= 5) return "Vence em 5 dias";
  return `Vence em ${daysUntilDue} dias`;
}
