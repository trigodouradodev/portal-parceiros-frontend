/** Contrato de consulta de Desempenho V2 do backend. */
export type PerformanceIndicatorStatus =
  | "AVAILABLE"
  | "NO_MEASUREMENT"
  | "NOT_APPLICABLE";
export type PerformanceLevelKey =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "AUREA"
  | "HYBRID"
  | "REIMBURSEMENT"
  | "COLLECTION_AGENT"
  | "UNKNOWN";

export interface PerformanceMonth {
  month: string;
}

export interface PerformanceMonthsResponse {
  currentMonth: string;
  months: PerformanceMonth[];
}

export interface PerformanceLevel {
  key: PerformanceLevelKey;
  label: string | null;
}

export interface AppliedPerformanceBand {
  minValue: number;
  minInclusive: boolean;
  maxValue: number | null;
  maxInclusive: boolean;
  bonusPercent: number;
}

export interface PerformanceOrigination {
  status: PerformanceIndicatorStatus;
  amount: number | null;
  targetAmount: number | null;
  targetPercent: number | null;
  appliedBand: AppliedPerformanceBand | null;
}

export interface PerformanceInterestRate {
  status: PerformanceIndicatorStatus;
  rate: number | null;
  simpleRate: number | null;
  weightedRate: number | null;
  appliedBand: AppliedPerformanceBand | null;
}

export interface PerformanceDelinquency {
  status: PerformanceIndicatorStatus;
  rate: number | null;
  portfolioRate: number | null;
  overdueAmount: number | null;
  portfolioAmount: number | null;
  disregardedOverdueAmount: number | null;
  disregardedPortfolioAmount: number | null;
  appliedBand: AppliedPerformanceBand | null;
}

export interface PerformanceRemuneration {
  fixedAmount: number | null;
  disbursementBonusAmount: number | null;
  rateBonusAmount: number | null;
  riskBonusAmount: number | null;
  agreementAmount: number | null;
  productionBonusAmount: number | null;
  reimbursementBonusAmount: number | null;
  totalAmount: number | null;
}

export interface PerformanceData {
  level: PerformanceLevel;
  remuneration: PerformanceRemuneration;
  indicators: {
    origination: PerformanceOrigination;
    interestRate: PerformanceInterestRate;
    delinquency: PerformanceDelinquency;
    reimbursement: {
      status: PerformanceIndicatorStatus;
      amount: number | null;
    };
  };
}

export type PerformanceResponse =
  | { month: string; availability: "AVAILABLE"; data: PerformanceData }
  | { month: string; availability: "NO_DATA"; data: null };
