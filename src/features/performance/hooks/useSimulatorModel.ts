import { useMemo, useState } from "react";
import {
  computeCommission,
  type CommissionBreakdown,
} from "@/features/performance/data/commission";
import {
  buildDisbursementLadder,
  buildRateLadder,
  buildRiskLadder,
  type PillarLadderView,
} from "@/features/performance/utils/ladder";
import {
  desembolsoHint,
  nextMilestoneLabel,
  riscoHint,
  taxaHint,
} from "@/features/performance/utils/hints";
import type {
  CurrentPerformance,
  PartnerLevel,
  PartnerProfile,
  PartnerProgram,
} from "@/services/performance/performance.types";

export interface SimulatorModel {
  level: PartnerLevel;
  originacao: number;
  setOriginacao: (v: number) => void;
  inad: number;
  setInad: (v: number) => void;
  taxa: number;
  setTaxa: (v: number) => void;
  mes: number;
  setMes: (v: number) => void;
  sim: CommissionBreakdown;
  delta: number;
  originacaoMax: number;
  monthHint: string;
  disbursement: PillarLadderView & { hint: string };
  risk: PillarLadderView & { hint: string };
  rate: PillarLadderView & { hint: string };
}

/**
 * Estado + derivações do simulador, fora do JSX.
 * Remount via `key` no pai quando os dados reais mudam.
 */
export function useSimulatorModel(
  profile: PartnerProfile,
  current: CurrentPerformance,
  program: PartnerProgram,
): SimulatorModel {
  const level = profile.level;
  // null na API = sem medição (bônus 0). Não usar 0%/9,5%: 0% de
  // inadimplência cairia no teto de risco. Partimos da faixa zerada.
  const [originacao, setOriginacao] = useState(current.origination.amount);
  const [inad, setInad] = useState(current.delinquency.rate ?? 6);
  const [taxa, setTaxa] = useState(current.averageRate.rate ?? 9);
  const [mes, setMes] = useState(profile.partnership.monthNumber);

  const ladders = useMemo(
    () => ({
      disbursement: buildDisbursementLadder(program),
      risk: buildRiskLadder(program),
      rate: buildRateLadder(program),
    }),
    [program],
  );

  const sim = useMemo(
    () => computeCommission(level, program, originacao, inad, taxa, mes),
    [level, program, originacao, inad, taxa, mes],
  );

  const delta = sim.total - current.commission.total;
  const originacaoMax = Math.round(level.monthlyTarget * 1.6);

  const monthHint =
    mes === 1 ? "Boas-vindas ativa" : nextMilestoneLabel(mes, program);

  return {
    level,
    originacao,
    setOriginacao,
    inad,
    setInad,
    taxa,
    setTaxa,
    mes,
    setMes,
    sim,
    delta,
    originacaoMax,
    monthHint,
    disbursement: {
      ...ladders.disbursement,
      hint: desembolsoHint(sim, originacao, level.monthlyTarget, program),
    },
    risk: {
      ...ladders.risk,
      hint: riscoHint(sim, inad, program),
    },
    rate: {
      ...ladders.rate,
      hint: taxaHint(sim, taxa, program),
    },
  };
}
