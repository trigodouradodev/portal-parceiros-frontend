import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { PrevClient } from "@/features/dashboard/mocks/tasks";
import {
  formatPreventiveDaysInfo,
  mapFollowupStatusToStage,
} from "@/features/dashboard/utils/task-mappers";
import type {
  SetActionDataPayload,
  ActionResult,
} from "@/contexts/action/action-context";
import type { OverdueContract } from "@/services/dashboard/dashboard.types";
import { fmtBRL } from "@/lib/utils";

export const CHARGE_REGISTER_PATH = "/register/charge";
export const PREVENTIVE_REGISTER_PATH = "/register/preventive";

export function buildChargeActionPayload(
  contract: OverdueContract,
  onComplete: (result: ActionResult) => void,
): SetActionDataPayload {
  const installment = contract.firstOverdueInstallment;
  const stage = mapFollowupStatusToStage(
    installment.latestFollowupStatus,
    installment.followupCount,
  );
  const overdueDays = installment.daysOverdue;

  return {
    mode: TaskTab.Charge,
    cobrStage: stage,
    client: {
      id: contract.contractId,
      installmentNumber: installment.installmentNumber,
      name: contract.clientName,
      contract: contract.contractNumber,
      parcela: `Parc ${installment.installmentNumber}/${contract.totalInstallments}`,
      value: fmtBRL(installment.pendingAmount),
      currentStep: stage,
      daysInfo: `${overdueDays} dia${overdueDays !== 1 ? "s" : ""} em atraso`,
      phone: contract.clientPhone,
      address: contract.address,
    },
    onComplete,
  };
}

export function buildPreventiveActionPayload(
  client: PrevClient,
  onComplete: (result: ActionResult) => void,
): SetActionDataPayload {
  return {
    mode: TaskTab.Preventive,
    client: {
      id: client.id,
      installmentNumber: client.installmentNumber,
      name: client.name,
      contract: client.contract,
      parcela: client.parcela,
      value: fmtBRL(client.value),
      currentStep: "Contato preventivo",
      daysInfo: formatPreventiveDaysInfo(client.daysUntilDue),
      phone: client.phone,
      address: client.address,
    },
    onComplete,
  };
}

export function getChargeRegisterPath(): string {
  return CHARGE_REGISTER_PATH;
}

export function getPreventiveRegisterPath(): string {
  return PREVENTIVE_REGISTER_PATH;
}
