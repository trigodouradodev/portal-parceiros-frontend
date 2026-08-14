import type { TaskTab } from "@/features/dashboard/constants/task-tab";
import type {
  ClientAddress,
  OverdueCollectionItem,
  PreventiveCollectionItem,
  ResponsibleType,
} from "@/services/dashboard/dashboard.types";

/**
 * AUREA-330: "carteira" é um 3º modo — visualização somente-leitura vinda da
 * Carteira (não é uma aba do dashboard como Charge/Preventive, então fica
 * fora de `TaskTab` propositalmente).
 */
export const CARTEIRA_DETAIL_MODE = "carteira" as const;

export type DetailMode =
  | typeof TaskTab.Charge
  | typeof TaskTab.Preventive
  | typeof CARTEIRA_DETAIL_MODE;

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
