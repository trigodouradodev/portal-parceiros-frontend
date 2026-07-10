import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { PrevClient } from "@/features/dashboard/mocks/tasks";
import {
  formatPreventiveDaysInfo,
  mapTaskToChargeStage,
} from "@/features/dashboard/utils/task-mappers";
import type {
  SetActionDataPayload,
  ActionResult,
} from "@/contexts/action/action-context";
import type { InstallmentDetail } from "@/services/activities/installment-detail.types";
import type { TaskHistoryItem } from "@/services/activities/installment-detail.types";
import type {
  ActivityTaskSummary,
  CollectionStageCode,
  OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";
import { fmtBRL } from "@/lib/utils";

export const CHARGE_REGISTER_PATH = "/register/charge";
export const PREVENTIVE_REGISTER_PATH = "/register/preventive";

const TONE_TO_STAGE: Record<string, CollectionStageCode> = {
  friendly: "friendly",
  firm: "assertive",
  severe: "warning",
};

function mapToneToStageCode(tone: string): CollectionStageCode {
  return TONE_TO_STAGE[tone] ?? "friendly";
}

function mapTaskTypeToChannel(taskType: string): ActivityChannel {
  if (taskType === "visit") return ActivityChannel.CLIENT_VISIT;
  return ActivityChannel.CLIENT_CALL;
}

function mapTaskHistoryToSummary(task: TaskHistoryItem): ActivityTaskSummary {
  const stageCode = mapToneToStageCode(task.tone);

  return {
    id: task.id,
    stageCode,
    stageBadgeLabel: task.segmentBadgeLabel ?? task.segmentCode,
    channel: mapTaskTypeToChannel(task.taskType),
    status: task.status as ActivityTaskSummary["status"],
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  };
}

export function hasPendingChargeTask(item: OverdueCollectionItem): boolean {
  return item.task?.status === "pending";
}

export function getPendingTaskFromInstallmentDetail(
  detail: InstallmentDetail,
): TaskHistoryItem | undefined {
  return detail.tasks.find((task) => task.status === "pending");
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
  const stage = mapTaskToChargeStage(task);
  const overdueDays = installment.daysOverdue;

  return {
    mode: TaskTab.Charge,
    chargeStage: stage,
    taskId: task.id,
    taskChannel: task.channel,
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

export function buildChargeActionPayloadFromInstallmentDetail(
  detail: InstallmentDetail,
  onComplete: (result: ActionResult) => void,
): SetActionDataPayload | null {
  const pendingTask = getPendingTaskFromInstallmentDetail(detail);
  if (!pendingTask) {
    return null;
  }

  const task = mapTaskHistoryToSummary(pendingTask);
  const { installment, contract, client } = detail;
  const stage = mapTaskToChargeStage(task);
  const overdueDays = installment.daysOverdue;

  return {
    mode: TaskTab.Charge,
    chargeStage: stage,
    taskId: task.id,
    taskChannel: task.channel,
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
