import type {
  PerformanceMonthsResponse,
  PerformanceResponse,
} from "@/services/performance/performance.types";

export const testPerformanceMonths: PerformanceMonthsResponse = {
  currentMonth: "2026-10",
  months: [{ month: "2026-09" }],
};

export const testPerformanceData: Extract<
  PerformanceResponse,
  { availability: "AVAILABLE" }
> = {
  month: "2026-09",
  availability: "AVAILABLE",
  data: {
    level: { key: "BRONZE", label: "Bronze" },
    remuneration: {
      fixedAmount: 4000,
      disbursementBonusAmount: 400,
      rateBonusAmount: 400,
      riskBonusAmount: 1320,
      agreementAmount: 0,
      productionBonusAmount: null,
      reimbursementBonusAmount: null,
      totalAmount: 6120,
    },
    indicators: {
      origination: {
        status: "AVAILABLE",
        amount: 110000,
        targetAmount: 100000,
        targetPercent: 110,
        appliedBand: null,
      },
      interestRate: {
        status: "AVAILABLE",
        rate: 9.5,
        simpleRate: 9.5,
        weightedRate: 9.7,
        appliedBand: null,
      },
      delinquency: {
        status: "AVAILABLE",
        rate: 3.33,
        portfolioRate: 6,
        overdueAmount: 6000,
        portfolioAmount: 100000,
        disregardedOverdueAmount: 3000,
        disregardedPortfolioAmount: 10000,
        appliedBand: null,
      },
      reimbursement: { status: "NOT_APPLICABLE", amount: null },
    },
  },
};
