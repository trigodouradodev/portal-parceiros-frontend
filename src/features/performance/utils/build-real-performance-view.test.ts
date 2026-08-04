import { buildRealPerformanceView } from "@/features/performance/utils/build-real-performance-view";
import { testLevel, testProgram } from "@/test/fixtures/performance";
import {
  CommissionComponentKind,
  type CurrentPerformance,
  type PartnerProfile,
} from "@/services/performance/performance.types";

const profile: PartnerProfile = {
  partner: {
    id: "p1",
    fullName: "Ana Parceira",
    roleLabel: "Consultor",
  },
  level: testLevel,
  partnership: {
    startedAt: "2025-01-01",
    monthNumber: 3,
    isFirstMonth: false,
    nextMilestone: null,
  },
};

const current: CurrentPerformance = {
  month: "2026-03",
  periodStart: "2026-03-01",
  periodEnd: "2026-03-31",
  origination: {
    count: 10,
    amount: 90_000,
    targetPercent: 90,
    bonusPercent: 10,
  },
  delinquency: {
    rate: 1.5,
    overdueAmount: 1000,
    portfolioOpenAmount: 50_000,
    bonusPercent: 20,
  },
  averageRate: {
    rate: 9.5,
    bonusPercent: 10,
  },
  commission: {
    total: 2800,
    components: [
      { kind: CommissionComponentKind.FIXED, amount: 2000 },
      { kind: CommissionComponentKind.DISBURSEMENT_BONUS, amount: 200 },
      { kind: CommissionComponentKind.RISK_BONUS, amount: 400 },
      { kind: CommissionComponentKind.RATE_BONUS, amount: 200 },
      { kind: CommissionComponentKind.WELCOME, amount: 0 },
    ],
  },
};

describe("buildRealPerformanceView", () => {
  it("maps KPIs, period legend and positive pills", () => {
    const view = buildRealPerformanceView(profile, current, testProgram);

    expect(view.periodLegend).toBe("1 a 31 de março");
    expect(view.monthlyTarget).toBe(100_000);
    expect(view.commissionTotal).toBe(2800);
    expect(view.kpis.map((k) => k.key)).toEqual([
      "disbursement",
      "delinquency",
      "rate",
    ]);
    expect(view.kpis[0]?.value).toBe("90%");
    expect(view.pills.map((p) => p.key)).toEqual([
      "fixed",
      "disbursement",
      "risk",
      "rate",
    ]);
  });

  it("handles missing delinquency and rate", () => {
    const view = buildRealPerformanceView(
      profile,
      {
        ...current,
        delinquency: { ...current.delinquency, rate: null },
        averageRate: { ...current.averageRate, rate: null },
      },
      testProgram,
    );

    expect(view.kpis[1]?.value).toBe("N/A");
    expect(view.kpis[1]?.sub).toBe("Sem carteira para medir");
    expect(view.kpis[2]?.value).toBe("N/A");
    expect(view.kpis[2]?.sub).toBe("Sem originação no mês");
  });
});
