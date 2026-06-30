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
import type { OverdueCollectionItem } from "@/services/dashboard/dashboard.types";
import { fmtBRL } from "@/lib/utils";

export const CHARGE_REGISTER_PATH = "/register/charge";
export const PREVENTIVE_REGISTER_PATH = "/register/preventive";

export function buildChargeActionPayload(
  item: OverdueCollectionItem,
  onComplete: (result: ActionResult) => void,
): SetActionDataPayload {
  const { installment, contract, client, followup } = item;
  const stage = mapFollowupStatusToStage(
    followup?.latestStatus,
    followup?.count ?? 0,
  );
  const overdueDays = installment.daysOverdue;

  return {
    mode: TaskTab.Charge,
    chargeStage: stage,
    client: {
      id: contract.id,
      installmentNumber: installment.number,
      name: client.name,
      contract: contract.number,
      parcela: installment.label,
      value: fmtBRL(installment.pendingAmount),
      currentStep: stage,
      daysInfo: `${overdueDays} dia${overdueDays !== 1 ? "s" : ""} em atraso`,
      phone: client.phone,
      address: client.address,
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
