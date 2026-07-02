import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { PrevClient } from "@/features/dashboard/mocks/tasks";
import { formatPreventiveDaysInfo } from "@/features/dashboard/utils/task-mappers";
import { getChannelShortLabel } from "@/features/dashboard/utils/charge-channel";
import type {
  SetActionDataPayload,
  ActionResult,
} from "@/contexts/action/action-context";
import type {
  ActivityTaskSummary,
  CollectionDetail,
  OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";
import { fmtBRL } from "@/lib/utils";

export const CHARGE_REGISTER_PATH = "/register/charge";
export const PREVENTIVE_REGISTER_PATH = "/register/preventive";

export function hasPendingChargeTask(item: OverdueCollectionItem): boolean {
  return item.task?.status === "pending";
}

export function getPendingChargeTask(
  detail: CollectionDetail,
): ActivityTaskSummary | undefined {
  return detail.activity.tasks.find((task) => task.status === "pending");
}

export function buildChargeActionPayload(
  item: OverdueCollectionItem,
  onComplete: (result: ActionResult) => void,
): SetActionDataPayload | null {
  const task = item.task;
  if (!task || task.status !== "pending") {
    return null;
  }

  const { installment, contract, client } = item;
  const overdueDays = installment.daysOverdue;

  return {
    mode: TaskTab.Charge,
    taskId: task.id,
    taskChannel: task.channel,
    taskStageCode: task.stageCode,
    client: {
      id: contract.id,
      installmentNumber: installment.number,
      name: client.name,
      contract: contract.number,
      parcela: installment.label,
      value: fmtBRL(installment.pendingAmount),
      currentStep: getChannelShortLabel(task.channel),
      daysInfo: `${overdueDays} dia${overdueDays !== 1 ? "s" : ""} em atraso`,
      phone: client.phone,
      address: client.address,
    },
    onComplete,
  };
}

export function buildChargeActionPayloadFromDetail(
  detail: CollectionDetail,
  onComplete: (result: ActionResult) => void,
): SetActionDataPayload | null {
  const task = getPendingChargeTask(detail);
  if (!task) {
    return null;
  }

  const { installment, contract, client } = detail;
  const dueDate = new Date(installment.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const overdueDays = Math.max(
    0,
    Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    mode: TaskTab.Charge,
    taskId: task.id,
    taskChannel: task.channel,
    taskStageCode: task.stageCode,
    client: {
      id: contract.id,
      installmentNumber: installment.number,
      name: client.name,
      contract: contract.number,
      parcela: installment.label,
      value: fmtBRL(installment.pendingAmount),
      currentStep: getChannelShortLabel(task.channel),
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
