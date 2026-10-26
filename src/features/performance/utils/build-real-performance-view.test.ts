import { buildRealPerformanceView } from "./build-real-performance-view";
import { testPerformanceData } from "@/test/fixtures/performance";
import type { PerformanceLevelKey } from "@/services/performance/performance.types";

function performanceData() {
  return structuredClone(testPerformanceData.data);
}

describe("official indicator presentation", () => {
  it("preserves official target percentage and selected rates without recalculating", () => {
    const data = performanceData();
    data.indicators.origination.targetPercent = 180.1234;
    data.indicators.interestRate.rate = 9.4996;
    const cards = buildRealPerformanceView(data);
    expect(cards[0]).toMatchObject({
      targetPercent: 180.1234,
      targetAmount: 100000,
    });
    expect(cards[0]?.value).toContain("110.000,00");
    expect(cards[1]).toMatchObject({ value: "9,50%" });
    expect(cards[2]).toMatchObject({
      value: "3,33%",
      sub: "Indicador após as desconsiderações da competência",
    });
  });

  it("distinguishes unmeasured values from measured zero", () => {
    const data = performanceData();
    data.indicators.interestRate = {
      ...data.indicators.interestRate,
      rate: null,
      status: "NO_MEASUREMENT",
    };
    data.indicators.delinquency.rate = 0;
    const cards = buildRealPerformanceView(data);
    expect(cards[1]).toMatchObject({
      value: "N/A",
      sub: "Sem medição nesta competência",
    });
    expect(cards[2]?.value).toBe("0,00%");
  });

  it("does not infer a missing percentage from origination and target amounts", () => {
    const data = performanceData();
    data.indicators.origination.targetPercent = null;
    const card = buildRealPerformanceView(data)[0];
    expect(card?.value).toContain("110.000,00");
    expect(card?.targetPercent).toBeNull();
  });

  it.each<PerformanceLevelKey>(["HYBRID", "REIMBURSEMENT"])(
    "shows only origination and reimbursement for %s",
    (key) => {
      const data = performanceData();
      data.level.key = key;
      data.indicators.origination.targetAmount = null;
      data.indicators.origination.targetPercent = null;
      data.indicators.interestRate.status = "NOT_APPLICABLE";
      data.indicators.delinquency.status = "NOT_APPLICABLE";
      data.indicators.reimbursement = { status: "AVAILABLE", amount: 0 };
      const cards = buildRealPerformanceView(data);
      expect(cards.map((card) => card.key)).toEqual([
        "origination",
        "reimbursement",
      ]);
      expect(cards[0]?.label).toBe("Originação no mês");
      expect(cards[0]?.targetPercent).toBeNull();
      expect(cards[0]?.targetAmount).toBeNull();
      expect(cards[1]?.value).toContain("0,00");
    },
  );

  it("shows reimbursement only for a collection agent", () => {
    const data = performanceData();
    data.level.key = "COLLECTION_AGENT";
    data.indicators.origination.status = "NOT_APPLICABLE";
    data.indicators.interestRate.status = "NOT_APPLICABLE";
    data.indicators.delinquency.status = "NOT_APPLICABLE";
    data.indicators.reimbursement = { status: "AVAILABLE", amount: 5000 };
    expect(buildRealPerformanceView(data).map((card) => card.key)).toEqual([
      "reimbursement",
    ]);
  });

  it.each<PerformanceLevelKey>(["AUREA", "UNKNOWN"])(
    "keeps indicators informational for %s",
    (key) => {
      const data = performanceData();
      data.level.key = key;
      const cards = buildRealPerformanceView(data);
      expect(cards.map((card) => card.label).join(" ")).not.toMatch(
        /meta|bônus/,
      );
      expect(
        cards.every(
          (card) => card.sub === "Indicador informativo para sua modalidade",
        ),
      ).toBe(true);
    },
  );
});

it("shows only measured indicators for an unknown category", () => {
  const data = performanceData();
  data.level.key = "UNKNOWN";
  data.indicators.origination.amount = null;
  data.indicators.interestRate.rate = null;
  data.indicators.delinquency.rate = 0;
  data.indicators.reimbursement.status = "NO_MEASUREMENT";
  expect(buildRealPerformanceView(data).map((card) => card.key)).toEqual([
    "delinquency",
  ]);
});
