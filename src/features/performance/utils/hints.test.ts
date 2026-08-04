import { computeCommission } from "@/features/performance/data/commission";
import {
  desembolsoHint,
  nextMilestoneLabel,
  riscoHint,
  taxaHint,
} from "@/features/performance/utils/hints";
import {
  testLevel,
  testProgram,
} from "@/test/fixtures/performance";

describe("desembolsoHint", () => {
  it("reports ceiling when max bonus is active", () => {
    const sim = computeCommission(
      testLevel,
      testProgram,
      150_000,
      1,
      10.5,
      3,
    );
    expect(desembolsoHint(sim, 150_000, testLevel.monthlyTarget, testProgram)).toContain(
      "Teto de bônus de desembolso",
    );
  });

  it("reports remaining amount to next band", () => {
    const sim = computeCommission(
      testLevel,
      testProgram,
      90_000,
      1,
      10.5,
      3,
    );
    expect(desembolsoHint(sim, 90_000, testLevel.monthlyTarget, testProgram)).toMatch(
      /Faltam/,
    );
  });
});

describe("riscoHint", () => {
  it("reports healthy portfolio at risk ceiling", () => {
    const sim = computeCommission(testLevel, testProgram, 100_000, 1, 10.5, 3);
    expect(riscoHint(sim, 1, testProgram)).toContain("Teto de bônus de risco");
  });

  it("suggests reducing delinquency", () => {
    const sim = computeCommission(testLevel, testProgram, 100_000, 5, 10.5, 3);
    expect(riscoHint(sim, 5, testProgram)).toMatch(/Reduza a inadimplência/);
  });
});

describe("taxaHint", () => {
  it("reports rate ceiling", () => {
    const sim = computeCommission(testLevel, testProgram, 100_000, 1, 10.5, 3);
    expect(taxaHint(sim, 10.5, testProgram)).toContain("Teto de bônus de taxa");
  });

  it("suggests raising average rate", () => {
    const sim = computeCommission(testLevel, testProgram, 100_000, 1, 8, 3);
    expect(taxaHint(sim, 8, testProgram)).toMatch(/taxa média/);
  });
});

describe("nextMilestoneLabel", () => {
  it("labels next permanence milestone", () => {
    expect(nextMilestoneLabel(3, testProgram)).toBe(
      "Próximo marco: 3 meses (6 meses)",
    );
  });

  it("reports completed milestones", () => {
    expect(nextMilestoneLabel(18, testProgram)).toBe(
      "Marcos de permanência concluídos",
    );
  });
});
