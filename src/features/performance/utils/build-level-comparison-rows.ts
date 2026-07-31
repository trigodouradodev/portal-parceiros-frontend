import { PERMANENCE_FALLBACK_HORIZON_MONTHS } from "@/features/performance/constants/simulator.constants";
import {
  bandsOf,
  maxBonusPercent,
  permanenceTotalMultiplier,
} from "@/features/performance/data/commission";
import {
  BonusPillar,
  type PartnerLevel,
  type PartnerProgram,
} from "@/services/performance/performance.types";

export interface LevelComparisonRow {
  key: string;
  label: string;
  isCurrent: boolean;
  monthlyTarget: number;
  monthlyFixed: number;
  welcomeBonus: number;
  disbursementBonus: number;
  riskBonus: number;
  rateBonus: number;
  totalMonth1Max: number;
  permanenceTotal: number;
}

export function buildLevelComparisonRows(
  program: PartnerProgram,
  currentLevelKey: string,
): {
  rows: LevelComparisonRow[];
  permanenceHorizonMonths: number;
} {
  const dMax = maxBonusPercent(bandsOf(program, BonusPillar.DISBURSEMENT));
  const rMax = maxBonusPercent(bandsOf(program, BonusPillar.RISK));
  const tMax = maxBonusPercent(bandsOf(program, BonusPillar.RATE));
  const permMult = permanenceTotalMultiplier(program.permanenceMilestones);
  const permanenceHorizonMonths =
    program.permanenceMilestones.at(-1)?.month ??
    PERMANENCE_FALLBACK_HORIZON_MONTHS;

  const rows = program.levels.map((level: PartnerLevel) => {
    const disbursementBonus = (dMax / 100) * level.monthlyFixed;
    const riskBonus = (rMax / 100) * level.monthlyFixed;
    const rateBonus = (tMax / 100) * level.monthlyFixed;
    return {
      key: level.key,
      label: level.label,
      isCurrent: level.key === currentLevelKey,
      monthlyTarget: level.monthlyTarget,
      monthlyFixed: level.monthlyFixed,
      welcomeBonus: program.welcomeBonusAmount,
      disbursementBonus,
      riskBonus,
      rateBonus,
      totalMonth1Max:
        level.monthlyFixed +
        program.welcomeBonusAmount +
        disbursementBonus +
        riskBonus +
        rateBonus,
      permanenceTotal: permMult * level.monthlyFixed,
    };
  });

  return { rows, permanenceHorizonMonths };
}
