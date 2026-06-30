import type { TaskTab } from "@/features/dashboard/constants/task-tab";
import type {
  ClientAddress,
  OverdueCollectionItem,
  PreventiveCollectionItem,
  ResponsibleType,
} from "@/services/dashboard/dashboard.types";

export type DetailMode = typeof TaskTab.Charge | typeof TaskTab.Preventive;

export type StatusColor = "blue" | "amber" | "red" | "green";

export type AlertType = "overdue" | "renewal";

export interface TimelineStep {
  id: string;
  day: string;
  label: string;
  status: "done" | "current" | "pending";
  date?: string;
  agent?: string;
  note?: string;
}

export interface ContractDetailView {
  contractId: string;
  mode: DetailMode;
  businessName: string;
  clientName: string;
  clientTaxId?: string;
  clientAddress?: string;
  address?: ClientAddress;
  responsibleName?: string;
  responsibleType?: ResponsibleType;
  contractCode: string;
  statusLabel: string;
  statusColor: StatusColor;
  installmentValue: number;
  installmentTotalAmount: number;
  installmentNumber: number;
  totalInstallments: number;
  contractTotalAmount: number;
  contractStartDate?: string;
  contractEndDate?: string;
  nextDue: string;
  alertDays?: number;
  alertType?: AlertType;
  timeline: TimelineStep[];
  source?: OverdueCollectionItem | PreventiveCollectionItem;
}

export interface ContractDetailLocationState {
  item?: OverdueCollectionItem | PreventiveCollectionItem;
  mode?: DetailMode;
}
