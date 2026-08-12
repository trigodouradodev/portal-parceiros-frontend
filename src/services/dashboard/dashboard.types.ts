/**
 * Types matching the backend API contracts for Dashboard and Collections
 * Source: portal-parceiros-backend/src/dashboard/interfaces/
 * Source: portal-parceiros-backend/src/collections/interfaces/
 */

import type {
  ActivityInteractionChannel,
  ActivityInteractionResult,
  ActivityTaskType,
  QueueSegmentCode,
  QueueTone,
} from "@/services/activities/activity.enums";

export interface RenewalMonthBucket {
  month: string; // 'YYYY-MM'
  count: number;
}

export interface UpcomingRenewals {
  total: number;
  byMonth: RenewalMonthBucket[];
}

export interface PortfolioDashboard {
  activeContracts: number;
  dueTodayContracts: number;
  overdueContracts: number;
  upcomingRenewals: UpcomingRenewals;
}

export type InstallmentStatus = "not_paid" | "partially_paid";

export type CollectionStageCode =
  | "friendly"
  | "assertive"
  | "warning"
  | "defaulted";

export const ActivityChannel = {
  WHATSAPP_MESSAGE: "whatsapp_message",
  CLIENT_CALL: "client_call",
  CLIENT_VISIT: "client_visit",
} as const;

export type ActivityChannel =
  (typeof ActivityChannel)[keyof typeof ActivityChannel];

export type ActivityTaskStatus =
  | "pending"
  | "completed"
  | "cancelled"
  | "system_closed";

export type FollowupLatestStatus =
  | "contacted"
  | "no_answer"
  | "promise_to_pay"
  | "dispute"
  | "other"
  | "client_call"
  | "guarantor_call"
  | "client_visit"
  | "guarantor_visit"
  | "client_collection_letter"
  | "guarantor_collection_letter"
  | "negativation"
  | "renegotiation"
  | "deceased"
  | "no_forecast"
  | "whatsapp_message";

export interface ClientAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state?: string;
  zipCode: string;
}

export interface InstallmentInfo {
  id: string;
  number: number;
  label: string;
  dueDate: string;
  daysOverdue: number;
  pendingAmount: number;
  totalAmount: number;
  status: InstallmentStatus;
}

export interface ContractInfo {
  id: string;
  number: string;
  totalInstallments: number;
  companyName?: string;
}

export interface ClientInfo {
  name: string;
  taxId: string;
  phone?: string;
  address?: ClientAddress;
}

export type ResponsibleType = "COLLECTION_AGENT" | "CONSULTANT";

export interface ContractResponsible {
  id: string;
  name: string;
  type: ResponsibleType;
}

export interface ActivityTaskSummary {
  id: string;
  stageCode: CollectionStageCode;
  stageBadgeLabel: string;
  channel: ActivityChannel;
  status: ActivityTaskStatus;
  createdAt?: string;
  completedAt?: string;
}

export interface FollowupSummary {
  count: number;
  latestStatus?: FollowupLatestStatus | string;
}

export interface OverdueCollectionItem {
  installment: InstallmentInfo;
  contract: ContractInfo;
  client: ClientInfo;
  responsible?: ContractResponsible;
  task: ActivityTaskSummary | null;
  followup?: FollowupSummary;
  /** Segmento da fila: código API ou alias UI (`late`←`post_letter`, `critical`←`pre_default`). */
  queueSegmentCode?: QueueSegmentCode | "late" | "critical";
  /** Código bruto da API quando `queueSegmentCode` foi normalizado para o alias UI. */
  apiSegmentCode?: QueueSegmentCode;
  queueTone?: QueueTone;
  queuePosition?: number;
  correctedAmount?: number;
  lastInteraction?: {
    result: ActivityInteractionResult;
    channel: ActivityInteractionChannel;
    createdAt: string;
    promiseDate?: string;
  };
  wasPostponed?: boolean;
  wasRescheduled?: boolean;
  expireDate?: string;
  taskType?: ActivityTaskType;
  assignedTo?: { id: string; name: string } | null;
  isActive?: boolean;
  isRecommended?: boolean;
}

export interface OverduePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface OverdueCollectionPage {
  items: OverdueCollectionItem[];
  pagination: OverduePagination;
}

export interface CollectionAgentRef {
  id: string;
  name: string;
}

export interface UpcomingInstallmentInfo {
  id: string;
  number: number;
  label: string;
  dueDate: string;
  daysUntilDue: number;
  pendingAmount: number;
  totalAmount: number;
  status: InstallmentStatus;
}

export interface PreventiveCollectionItem {
  installment: UpcomingInstallmentInfo;
  contract: ContractInfo;
  client: ClientInfo;
  responsible?: ContractResponsible;
  followup: FollowupSummary;
}

export interface PreventivePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface PreventiveCollectionPage {
  items: PreventiveCollectionItem[];
  pagination: PreventivePagination;
}

export interface HistoryAuthor {
  id: string;
  name: string;
}

export interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface FollowUpHistoryItem {
  id: string;
  status: string;
  note?: string;
  expectedResult?: string;
  paymentForecast?: string;
  createdAt: string;
  author: HistoryAuthor;
  geolocation?: Geolocation;
}

export interface ActivityInteractionHistoryItem {
  id: string;
  channel: string;
  result: string;
  observation?: string;
  promiseDate?: string;
  createdAt: string;
  author: HistoryAuthor;
  geolocation?: Geolocation;
}

export interface ActivityHistory {
  tasks: ActivityTaskSummary[];
  interactions: ActivityInteractionHistoryItem[];
}

export interface ContractDetailInfo {
  id: string;
  number: string;
  totalInstallments: number;
  totalAmount: number;
  startDate?: string;
  endDate?: string;
}

export interface InstallmentDetailInfo {
  id: string;
  number: number;
  label: string;
  dueDate: string;
  totalAmount: number;
  pendingAmount: number;
  status: InstallmentStatus;
}

export interface CollectionDetail {
  contract: ContractDetailInfo;
  client: ClientInfo;
  responsible?: ContractResponsible;
  installment: InstallmentDetailInfo;
  followups: FollowUpHistoryItem[];
}
