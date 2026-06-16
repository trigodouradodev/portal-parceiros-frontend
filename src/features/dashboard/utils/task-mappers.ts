import type {
  ActivityType,
  CobrClient,
  CobrStage,
} from "@/features/dashboard/mocks/tasks";
import type { OverdueContract } from "@/services/dashboard/dashboard.types";

/**
 * Maps backend's latestFollowupStatus to frontend's CobrStage
 * This is a simplified mapping since the backend only returns the latest status as a string
 */
export function mapFollowupStatusToStage(
  status: string | undefined,
): CobrStage {
  if (!status) return "initial";

  const statusLower = status.toLowerCase();

  // Simple mapping - can be refined based on actual backend statuses
  if (statusLower.includes("promise") || statusLower.includes("promessa")) {
    return "promise";
  }
  if (statusLower.includes("paid") || statusLower.includes("pago")) {
    return "paid";
  }
  if (statusLower.includes("fup") || statusLower.includes("followup")) {
    return "fup";
  }
  if (
    statusLower.includes("no_return") ||
    statusLower.includes("sem retorno")
  ) {
    return "no_return_1";
  }

  return "initial";
}

/**
 * Maps backend OverdueContract to frontend CobrClient
 */
export function mapOverdueContractToCobrClient(
  contract: OverdueContract,
): CobrClient {
  const installment = contract.firstOverdueInstallment;
  const activityType: ActivityType =
    installment.daysOverdue > 30 ? "visit" : "phone"; // Business rule as per plan

  return {
    id: contract.contractId,
    name: contract.clientName,
    contract: contract.contractNumber,
    parcela: `Parc ${installment.installmentNumber}/${contract.totalInstallments}`,
    value: installment.pendingAmount,
    overdueDays: installment.daysOverdue,
    phone: "", // Not provided by backend - will need to be fetched separately or left empty
    activityType,
    stage: mapFollowupStatusToStage(installment.latestFollowupStatus),
    lastAction: installment.latestFollowupStatus
      ? `${installment.followupCount} follow-up(s) · ${installment.latestFollowupStatus}`
      : null,
  };
}
