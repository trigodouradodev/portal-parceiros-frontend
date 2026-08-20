import type {
  ClientAddress,
  ContractStatusHistoryItem,
  OverdueCollectionItem,
  ResponsibleType,
} from "@/services/dashboard/dashboard.types";
import type { DetailGuarantor } from "@/services/activities/installment-detail.types";

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
  clientEmail?: string;
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
  /**
   * AUREA-346: dados adicionais do contrato, só populados no fluxo da
   * Carteira (mapPortfolioDetail) — o fluxo de cobrança/preventivo (Home)
   * usa outra fonte (GET /activities/installments/:id) que não os tem.
   */
  contractStatus?: string;
  productName?: string;
  companyName?: string;
  originationConsultantName?: string;
  guarantor?: DetailGuarantor | null;
  statusHistory?: ContractStatusHistoryItem[];
}

export interface ActivityInstallmentLocationState {
  item?: OverdueCollectionItem;
}
