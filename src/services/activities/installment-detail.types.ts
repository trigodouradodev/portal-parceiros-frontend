import type {
  ActivityInteractionChannel,
  ActivityInteractionResult,
  ActivityRecipientType,
  ActivityTaskStatus,
  ActivityTaskType,
  QueueSegmentCode,
  QueueTone,
} from "@/services/activities/activity.enums";
import type { ClientAddress } from "@/services/dashboard/dashboard.types";
import type { ContractResponsible } from "@/services/dashboard/dashboard.types";

export interface DetailAuthor {
  id: string;
  name: string;
}

export interface DetailGeolocation {
  latitude: number;
  longitude: number;
}

export interface TaskInteraction {
  id: string;
  channel: ActivityInteractionChannel;
  recipientType: ActivityRecipientType;
  result: ActivityInteractionResult;
  promiseDate?: string;
  observation?: string;
  createdAt: string;
  author: DetailAuthor;
  geolocation?: DetailGeolocation;
}

export interface TaskHistoryItem {
  id: string;
  segmentCode: QueueSegmentCode;
  segmentBadgeLabel?: string;
  priority: number;
  tone: QueueTone;
  taskType: ActivityTaskType;
  status: ActivityTaskStatus;
  createdBy: string;
  expireDate: string;
  wasPostponed: boolean;
  wasRescheduled: boolean;
  rescheduleCount: number;
  createdAt: string;
  completedAt?: string;
  systemClosedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  interaction: TaskInteraction | null;
}

export interface DetailContract {
  id: string;
  number: string;
  totalInstallments: number;
  totalAmount: number;
  startDate?: string;
  endDate?: string;
  companyName?: string;
}

export interface DetailInstallment {
  id: string;
  number: number;
  label: string;
  dueDate: string;
  daysOverdue: number;
  pendingAmount: number;
  totalAmount: number;
  status: string;
}

export interface DetailClient {
  name: string;
  taxId: string;
  phone?: string;
  email?: string;
  address?: ClientAddress;
}

/** Avalista — mesmas infos do client (GET /activities/installments/:id). */
export type DetailGuarantor = DetailClient;

/** Detalhe da parcela (cobrança v2) — GET /activities/installments/:id */
export interface InstallmentDetail {
  installment: DetailInstallment;
  contract: DetailContract;
  client: DetailClient;
  guarantor?: DetailGuarantor | null;
  responsible: ContractResponsible | null;
  tasks: TaskHistoryItem[];
}
