import {
  BonusPillar,
  type BonusBand,
  type PartnerLevel,
  type PartnerProgram,
} from "@/services/performance/performance.types";

export const testLevel: PartnerLevel = {
  key: "ouro",
  label: "Ouro",
  monthlyTarget: 100_000,
  monthlyFixed: 2_000,
};

function band(
  minValue: number,
  maxValue: number | null,
  bonusPercent: number,
  opts: Partial<BonusBand> = {},
): BonusBand {
  return {
    minValue,
    maxValue,
    bonusPercent,
    minInclusive: true,
    maxInclusive: false,
    ...opts,
  };
}

/** Programa mínimo realista para testes de performance. */
export const testProgram: PartnerProgram = {
  welcomeBonusAmount: 500,
  levels: [testLevel],
  permanenceMilestones: [
    { month: 6, multiplier: 1 },
    { month: 12, multiplier: 2 },
    { month: 18, multiplier: 3 },
  ],
  bonusPillars: [
    {
      pillar: BonusPillar.DISBURSEMENT,
      bands: [
        band(0, 80, 0),
        band(80, 100, 10),
        band(100, 120, 20),
        band(120, null, 30, { maxInclusive: true }),
      ],
    },
    {
      pillar: BonusPillar.RISK,
      bands: [
        band(0, 2, 20, { maxInclusive: true }),
        band(2, 3.5, 10, { minInclusive: false, maxInclusive: true }),
        band(3.5, null, 0, { minInclusive: false }),
      ],
    },
    {
      pillar: BonusPillar.RATE,
      bands: [
        band(0, 9, 0),
        band(9, 10, 10),
        band(10, null, 20, { maxInclusive: true }),
      ],
    },
  ],
};
