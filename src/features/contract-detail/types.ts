import type {
  ClientAddress,
  OverdueCollectionItem,
  ResponsibleType,
} from "@/services/dashboard/dashboard.types";

export type StatusColor = "blue" | "amber" | "red" | "green";

export type AlertType = "overdue" | "renewal";

export type TimelineTone = "friendly" | "firm" | "severe";

export interface TimelineStep {
  id: string;
  day: string;
  label: string;
  status: "done" | "current" | "pending" | "missed";
  date?: string;
  agent?: string;
  note?: string;
  tone?: TimelineTone;
  outcome?: string;
}

export interface ContractDetailView {
  contractId: string;
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
}

export interface ActivityInstallmentLocationState {
  item?: OverdueCollectionItem;
}
