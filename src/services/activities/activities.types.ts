import type {
  ActivityInteractionChannel,
  ActivityInteractionResult,
  ActivityRecipientType,
  ActivityTaskStatus,
  ActivityTaskType,
  QueueSegmentCode,
  QueueTone,
} from "@/services/activities/activity.enums";

export * from "@/services/activities/activity.enums";

export interface InteractionGeolocation {
  latitude: number;
  longitude: number;
}

export interface RegisterInteractionPayload {
  channel: ActivityInteractionChannel;
  recipientType: ActivityRecipientType;
  result: ActivityInteractionResult;
  observation?: string;
  promiseDate?: string;
  recipientContactId?: string;
  latitude?: number;
  longitude?: number;
}

export interface ActivityInteractionResponse {
  id: string;
  taskId: string;
  installmentId: string;
  contractId: string;
  taskType: ActivityTaskType;
  channel: ActivityInteractionChannel;
  recipientType: ActivityRecipientType;
  recipientContactId?: string;
  result: ActivityInteractionResult;
  promiseDate?: string;
  observation?: string;
  userId: string;
  createdAt: string;
  geolocation?: InteractionGeolocation;
}

export interface RegisterInteractionResponse {
  interaction: ActivityInteractionResponse;
}

export interface RegisterInteractionVariables {
  taskId: string;
  payload: RegisterInteractionPayload;
  contractId: string;
  installmentNumber: number;
  installmentId?: string;
}

/** Espelha portal-parceiros-backend/src/activities/interfaces/task-queue.interface.ts */

export interface QueueClient {
  name: string;
  taxId: string;
  phone?: string;
}

export interface QueueContract {
  id: string;
  number: string;
  totalInstallments: number;
  companyName?: string;
}

export interface QueueInstallment {
  id: string;
  number: number;
  label: string;
  dueDate: string;
  daysOverdue: number;
  pendingAmount: number;
  amountOverdue: number;
  totalAmount: number;
}

export interface QueueLastInteraction {
  result: ActivityInteractionResult;
  channel: ActivityInteractionChannel;
  createdAt: string;
  promiseDate?: string;
}

export interface QueueAssignee {
  id: string;
  name: string;
}

/** Usuário da hierarquia do parceiro autenticado. */
export interface ActivitySubordinate {
  id: string;
  name: string;
}

export interface QueueTaskCard {
  position: number;
  taskId: string;
  segmentCode: QueueSegmentCode;
  priority: number;
  tone: QueueTone;
  taskType: ActivityTaskType;
  status: ActivityTaskStatus;
  /** Executável agora: pertence ao segmento ativo do responsável (AUREA-319). */
  isActive: boolean;
  /** É a tarefa sugerida (maior prioridade do segmento ativo). Só uma por responsável. */
  isRecommended: boolean;
  assignedTo: QueueAssignee | null;
  expireDate: string;
  wasPostponed: boolean;
  wasRescheduled: boolean;
  /** Quantidade de reagendamentos da visita (máximo 2). */
  rescheduleCount: number;
  client: QueueClient;
  contract: QueueContract;
  installment: QueueInstallment;
  lastInteraction?: QueueLastInteraction | null;
}

export interface SegmentSummary {
  code: QueueSegmentCode;
  priority: number;
  count: number;
}

export interface LockedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface LockedPage {
  items: QueueTaskCard[];
  pagination: LockedPagination;
}

export interface TodayQueue {
  active: QueueTaskCard | null;
  counter: number;
  segments: SegmentSummary[];
  locked: LockedPage;
  scheduled: QueueTaskCard[];
  completedToday: QueueTaskCard[];
}

/** Estado da tarefa após postergar ou reagendar. */
export interface TaskActionResult {
  id: string;
  installmentId: string;
  contractId: string;
  segmentCode: QueueSegmentCode;
  taskType: ActivityTaskType;
  status: ActivityTaskStatus;
  expireDate: string;
  wasPostponed: boolean;
  wasRescheduled: boolean;
  rescheduleCount: number;
}

export interface RescheduleTaskPayload {
  date: string;
}
