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
  channel: string;
  recipientType: string;
  result: string;
  promiseDate?: string;
  observation?: string;
  createdAt: string;
  author: DetailAuthor;
  geolocation?: DetailGeolocation;
}

export interface TaskHistoryItem {
  id: string;
  segmentCode: string;
  segmentBadgeLabel?: string;
  priority: number;
  tone: string;
  taskType: string;
  status: string;
  createdBy: string;
  expireDate: string;
  wasPostponed: boolean;
  wasRescheduled: boolean;
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
  address?: ClientAddress;
}

/** Detalhe da parcela (cobrança v2) — GET /activities/installments/:id */
export interface InstallmentDetail {
  installment: DetailInstallment;
  contract: DetailContract;
  client: DetailClient;
  responsible: ContractResponsible | null;
  tasks: TaskHistoryItem[];
}
