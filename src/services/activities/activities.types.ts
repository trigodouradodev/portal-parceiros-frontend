/** Espelha portal-parceiros-backend/src/activities/enums/activity.enums.ts */

export const ActivityInteractionResult = {
  NO_RESPONSE: "no_response",
  NOT_LOCATED: "not_located",
  PAYMENT_PROMISE: "payment_promise",
  DISPUTE: "dispute",
  RENEGOTIATION: "renegotiation",
  DECEASED: "deceased",
  NO_FORECAST: "no_forecast",
  OTHER: "other",
} as const;

export type ActivityInteractionResult =
  (typeof ActivityInteractionResult)[keyof typeof ActivityInteractionResult];

export interface InteractionGeolocation {
  latitude: number;
  longitude: number;
}

export interface RegisterInteractionPayload {
  result: ActivityInteractionResult;
  observation?: string;
  promiseDate?: string;
  latitude?: number;
  longitude?: number;
}

export interface ActivityInteractionResponse {
  id: string;
  taskId: string;
  installmentId: string;
  contractId: string;
  channel: string;
  result: string;
  promiseDate?: string;
  observation?: string;
  userId: string;
  createdAt: string;
  geolocation?: InteractionGeolocation;
}

export interface CreatedTaskResponse {
  id: string;
  installmentId: string;
  contractId: string;
  stageCode: string;
  channel: string;
  status: string;
  createdAt: string;
}

export interface RegisterInteractionResponse {
  interaction: ActivityInteractionResponse;
  nextTask: CreatedTaskResponse | null;
}

export interface RegisterInteractionVariables {
  taskId: string;
  payload: RegisterInteractionPayload;
  contractId: string;
  installmentNumber: number;
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
  result: string;
  channel: string;
  createdAt: string;
}

export interface QueueAssignee {
  id: string;
  name: string;
}

export type QueueTaskType = "contact" | "visit";
export type QueueTone = "friendly" | "firm" | "severe";

export interface QueueTaskCard {
  position: number;
  taskId: string;
  segmentCode: string;
  priority: number;
  tone: QueueTone | string;
  taskType: QueueTaskType | string;
  status: string;
  isActive: boolean;
  assignedTo: QueueAssignee | null;
  expireDate: string;
  wasPostponed: boolean;
  wasRescheduled: boolean;
  client: QueueClient;
  contract: QueueContract;
  installment: QueueInstallment;
  lastInteraction?: QueueLastInteraction | null;
}

export interface SegmentSummary {
  code: string;
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
