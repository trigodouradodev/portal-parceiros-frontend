import { PERMANENCE_FALLBACK_HORIZON_MONTHS } from "@/features/performance/constants/simulator.constants";
import { findNextMilestone } from "@/features/performance/data/commission";
import type { ProgramMilestone } from "@/services/performance/performance.types";

export interface PermanenceMarkerView {
  month: number;
  multiplier: number;
  value: number;
  done: boolean;
  isNext: boolean;
  isHere: boolean;
}

export interface PermanenceTrailView {
  progressPct: number;
  markers: PermanenceMarkerView[];
}

export function buildPermanenceTrailView(
  mes: number,
  fixo: number,
  milestones: ProgramMilestone[],
): PermanenceTrailView {
  const lastMonth =
    milestones.at(-1)?.month ?? PERMANENCE_FALLBACK_HORIZON_MONTHS;
  const next = findNextMilestone(mes, milestones);

  return {
    progressPct: (Math.min(mes, lastMonth) / lastMonth) * 100,
    markers: milestones.map((m) => {
      const done = mes >= m.month;
      return {
        month: m.month,
        multiplier: m.multiplier,
        value: m.multiplier * fixo,
        done,
        isNext: !done && next?.month === m.month,
        isHere: mes === m.month,
      };
    }),
  };
}
