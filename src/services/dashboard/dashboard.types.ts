/**
 * Types matching the backend API contracts for Dashboard and Collections
 * Source: portal-parceiros-backend/src/dashboard/interfaces/
 * Source: portal-parceiros-backend/src/collections/interfaces/
 */

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

export interface OriginationSummary {
  count: number;
  amount: number;
}

export interface DelinquencySummary {
  rate: number; // 0-100 percentage
  overdueAmount: number;
  portfolioOpenAmount: number;
}

export interface MonthPerformance {
  month: string; // 'YYYY-MM'
  origination: OriginationSummary;
  averageRate: number | null; // percentage, null if no origination
  delinquency: DelinquencySummary;
  renewals: number;
}

export interface OverdueInstallmentSummary {
  id: string;
  installmentNumber: number;
  dueDate: string; // ISO date string
  daysOverdue: number;
  pendingAmount: number;
  totalAmount: number;
  status: string;
  followupCount: number;
  latestFollowupStatus?: string;
}

export interface CollectionAgentRef {
  id: string;
  name: string;
}

export interface OverdueContract {
  contractId: string;
  contractNumber: string;
  totalInstallments: number;
  clientName: string;
  clientTaxId: string;
  consultantName?: string;
  companyName?: string;
  collectionAgent?: CollectionAgentRef;
  firstOverdueInstallment: OverdueInstallmentSummary;
}

export interface OverduePagination {
  page: number;
  limit: number;
  totalContracts: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface OverdueCollectionPage {
  contracts: OverdueContract[];
  pagination: OverduePagination;
}
