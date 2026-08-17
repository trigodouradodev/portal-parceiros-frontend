import { describe, expect, it } from "vitest";
import { buildSafraMock } from "@/features/carteira/data/safra-mock";

describe("buildSafraMock", () => {
  it("returns 12 months newest-first with non-negative metrics", () => {
    const { months, isMock } = buildSafraMock(
      {
        projectedActiveBalance: 100_000,
        activeContracts: 50,
        renegotiatedOutstandingAmount: 10_000,
        delinquencyPercent: 7.5,
      },
      new Date(2026, 7, 1),
    );

    expect(isMock).toBe(true);
    expect(months).toHaveLength(12);
    expect(months[0]?.yearMonth).toBe("2026-08");
    expect(months[11]?.yearMonth).toBe("2025-09");

    for (const month of months) {
      expect(month.projectedActiveBalance).toBeGreaterThanOrEqual(0);
      expect(month.activeContracts).toBeGreaterThanOrEqual(0);
      expect(month.renegotiatedOutstandingAmount).toBeGreaterThanOrEqual(0);
      expect(month.renegotiatedSharePercent).toBeGreaterThanOrEqual(0);
      expect(month.delinquencyPercent).toBeGreaterThan(0);
      expect(month.label.length).toBeGreaterThan(0);
    }
  });

  it("falls back when seed values are non-finite", () => {
    const { months } = buildSafraMock({
      projectedActiveBalance: Number.NaN,
      delinquencyPercent: undefined as unknown as number,
    });
    expect(months).toHaveLength(12);
    expect(months[0]?.projectedActiveBalance).toBeGreaterThan(0);
    expect(Number.isFinite(months[0]?.delinquencyPercent)).toBe(true);
  });
});
