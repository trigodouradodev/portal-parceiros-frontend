import { TaskTab } from "@/features/dashboard/constants/task-tab";
import type { PrevClient } from "@/features/dashboard/mocks/tasks";
import {
  formatPreventiveDaysInfo,
  mapTaskToChargeStage,
} from "@/features/dashboard/utils/task-mappers";
import type {
  ActionParty,
  SetActionDataPayload,
  ActionResult,
} from "@/contexts/action/action-context";
import type { PreventiveContactType } from "@/contexts/action/action-context";
import type {
  DetailClient,
  DetailGuarantor,
  InstallmentDetail,
  TaskHistoryItem,
} from "@/services/activities/installment-detail.types";
import { activitiesService } from "@/services/activities/activities.service";
import {
  mapTaskTypeToChannel,
  mapToneToStageCode,
} from "@/services/activities/activity-task-mapping";
import { ActivityTaskStatus } from "@/services/activities/activity.enums";
import type {
  ActivityTaskSummary,
  OverdueCollectionItem,
} from "@/services/dashboard/dashboard.types";
import { fmtBRL } from "@/lib/utils";

export const CHARGE_REGISTER_PATH = "/register/charge";
export const PREVENTIVE_REGISTER_PATH = "/register/preventive";

function mapTaskHistoryToSummary(task: TaskHistoryItem): ActivityTaskSummary {
  const stageCode = mapToneToStageCode(task.tone);

  return {
    id: task.id,
    stageCode,
    stageBadgeLabel: task.segmentBadgeLabel ?? task.segmentCode,
    channel: mapTaskTypeToChannel(task.taskType),
    status: task.status,
    createdAt: task.createdAt,
    completedAt: task.completedAt,
  };
}

function mapDetailParty(
  party: DetailClient | DetailGuarantor | null | undefined,
): ActionParty | null {
  if (!party?.name) return null;
  return {
    name: party.name,
    taxId: party.taxId,
    phone: party.phone,
    email: party.email,
    address: party.address,
  };
}

export function hasPendingChargeTask(item: OverdueCollectionItem): boolean {
  return item.task?.status === ActivityTaskStatus.PENDING;
}

export function getPendingTaskFromInstallmentDetail(
  detail: InstallmentDetail,
  preferredTaskId?: string,
): TaskHistoryItem | undefined {
  const pending = detail.tasks.filter(
    (task) => task.status === ActivityTaskStatus.PENDING,
  );
  if (preferredTaskId) {
    const preferred = pending.find((task) => task.id === preferredTaskId);
    if (preferred) return preferred;
  }
  return pending[0];
}

/**
 * @deprecated Prefer `buildChargeActionPayloadFromInstallmentDetail` —
 * a listagem não traz endereço/avalista. Mantido só como fallback raro.
 */
export function buildChargeActionPayload(
  item: OverdueCollectionItem,
  onComplete: (result: ActionResult) => void,
  options?: {
    contactType?: PreventiveContactType;
  },
): SetActionDataPayload | null {
  const task = item.task;
  if (!task || task.status !== ActivityTaskStatus.PENDING) {
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
    installmentId: installment.id,
    contactType: options?.contactType,
    queueTone: item.queueTone,
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
    guarantor: null,
    onComplete,
  };
}

export function buildChargeActionPayloadFromInstallmentDetail(
  detail: InstallmentDetail,
  onComplete: (result: ActionResult) => void,
  options?: {
    contactType?: PreventiveContactType;
    preferredTaskId?: string;
  },
): SetActionDataPayload | null {
  const pendingTask = getPendingTaskFromInstallmentDetail(
    detail,
    options?.preferredTaskId,
  );
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
    installmentId: installment.id,
    contactType: options?.contactType,
    queueTone: pendingTask.tone,
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
    guarantor: mapDetailParty(detail.guarantor),
    onComplete,
  };
}

/**
 * Sempre carrega o detalhe da parcela: listagem é enxuta (sem address/guarantor).
 * Preferência de tarefa: `item.task.id` quando a fila já resolveu a ativa.
 */
export async function resolveChargeActionPayload(
  item: OverdueCollectionItem,
  onComplete: (result: ActionResult) => void,
  options?: {
    contactType?: PreventiveContactType;
  },
): Promise<SetActionDataPayload | null> {
  const detail = await activitiesService.getInstallmentDetail(
    item.installment.id,
  );

  return buildChargeActionPayloadFromInstallmentDetail(detail, onComplete, {
    contactType: options?.contactType,
    preferredTaskId: item.task?.id,
  });
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
    guarantor: null,
    onComplete,
  };
}

export function getChargeRegisterPath(): string {
  return CHARGE_REGISTER_PATH;
}

export function getPreventiveRegisterPath(): string {
  return PREVENTIVE_REGISTER_PATH;
}
