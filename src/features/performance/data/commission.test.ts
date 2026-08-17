import {
  bandsOf,
  computeCommission,
  findNextMilestone,
  maxBonusPercent,
  nextBetterBand,
  permanenceBonus,
  resolveBonusPercent,
} from "@/features/performance/data/commission";
import { testLevel, testProgram } from "@/test/fixtures/performance";
import { BonusPillar } from "@/services/performance/performance.types";

describe("bandsOf / maxBonusPercent / resolveBonusPercent", () => {
  const dBands = bandsOf(testProgram, BonusPillar.DISBURSEMENT);
  const rBands = bandsOf(testProgram, BonusPillar.RISK);

  it("returns pillar bands", () => {
    expect(dBands).toHaveLength(4);
    expect(maxBonusPercent(dBands)).toBe(30);
    expect(maxBonusPercent([])).toBe(0);
  });

  it("resolves disbursement bonus by % of target", () => {
    expect(resolveBonusPercent(50, dBands)).toBe(0);
    expect(resolveBonusPercent(90, dBands)).toBe(10);
    expect(resolveBonusPercent(110, dBands)).toBe(20);
    expect(resolveBonusPercent(150, dBands)).toBe(30);
  });

  it("resolves risk bonus (lower is better)", () => {
    expect(resolveBonusPercent(1, rBands)).toBe(20);
    expect(resolveBonusPercent(3, rBands)).toBe(10);
    expect(resolveBonusPercent(5, rBands)).toBe(0);
  });
});

describe("nextBetterBand", () => {
  const dBands = bandsOf(testProgram, BonusPillar.DISBURSEMENT);
  const rBands = bandsOf(testProgram, BonusPillar.RISK);

  it("finds next higher disbursement band", () => {
    const next = nextBetterBand(90, dBands, "higher");
    expect(next?.minValue).toBe(100);
    expect(next?.bonusPercent).toBe(20);
  });

  it("returns null at max bonus", () => {
    expect(nextBetterBand(150, dBands, "higher")).toBeNull();
  });

  it("finds next better risk band when lowering", () => {
    const next = nextBetterBand(5, rBands, "lower");
    expect(next?.bonusPercent).toBe(10);
  });
});

describe("findNextMilestone / permanenceBonus", () => {
  it("finds the next milestone after current month", () => {
    expect(findNextMilestone(3, testProgram.permanenceMilestones)?.month).toBe(
      6,
    );
    expect(findNextMilestone(18, testProgram.permanenceMilestones)).toBeNull();
  });

  it("computes permanence bonus only on milestone months", () => {
    expect(
      permanenceBonus(5, 2000, testProgram.permanenceMilestones),
    ).toBeNull();
    expect(permanenceBonus(6, 2000, testProgram.permanenceMilestones)).toEqual({
      mult: 1,
      value: 2000,
    });
  });
});

describe("computeCommission", () => {
  it("aggregates fixed, bonuses and welcome on month 1", () => {
    const sim = computeCommission(
      testLevel,
      testProgram,
      100_000, // 100% meta
      1, // risco baixo
      10.5, // taxa alta
      1,
    );

    expect(sim.pctMeta).toBe(100);
    expect(sim.d.bonusPercent).toBe(20);
    expect(sim.r.bonusPercent).toBe(20);
    expect(sim.t.bonusPercent).toBe(20);
    expect(sim.boasVindas).toBe(500);
    expect(sim.total).toBe(
      2000 + 500 + sim.dVal + sim.rVal + sim.tVal + sim.permVal,
    );
  });

  it("skips welcome bonus after month 1", () => {
    const sim = computeCommission(testLevel, testProgram, 50_000, 5, 8, 3);
    expect(sim.boasVindas).toBe(0);
  });
});
