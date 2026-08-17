import {
  bandLabel,
  bandsOf,
  maxBonusPercent,
} from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import { fmtBRL } from "@/lib/utils";
import {
  BonusPillar,
  CommissionComponentKind,
  type CurrentPerformance,
  type PartnerProfile,
  type PartnerProgram,
} from "@/services/performance/performance.types";

export type CommissionPillTone = "navy" | "yellow" | "green" | "amber";

export interface RealKpiCardView {
  key: string;
  label: string;
  value: string;
  sub: string;
  bonus: number;
  maxBonus: number;
}

export interface CommissionPillView {
  key: string;
  tone: CommissionPillTone;
  label: string;
}

export interface RealPerformanceView {
  periodLegend: string;
  monthlyTarget: number;
  monthlyFixed: number;
  kpis: RealKpiCardView[];
  commissionTotal: number;
  pills: CommissionPillView[];
}

function formatPeriodLegend(periodStart: string, periodEnd: string): string {
  const start = new Date(`${periodStart}T12:00:00`);
  const end = new Date(`${periodEnd}T12:00:00`);
  const dayStart = start.getDate();
  const dayEnd = end.getDate();
  const month = end.toLocaleDateString("pt-BR", { month: "long" });
  if (dayStart === dayEnd) return `${dayEnd} de ${month}`;
  return `${dayStart} a ${dayEnd} de ${month}`;
}

function componentAmount(
  current: CurrentPerformance,
  kind: CommissionComponentKind,
): number {
  return (
    current.commission.components.find((c) => c.kind === kind)?.amount ?? 0
  );
}

function buildPills(current: CurrentPerformance): CommissionPillView[] {
  const entries: {
    key: string;
    kind: CommissionComponentKind;
    tone: CommissionPillTone;
    prefix: string;
  }[] = [
    {
      key: "fixed",
      kind: CommissionComponentKind.FIXED,
      tone: "navy",
      prefix: "Fixo",
    },
    {
      key: "welcome",
      kind: CommissionComponentKind.WELCOME,
      tone: "yellow",
      prefix: "Boas-vindas",
    },
    {
      key: "disbursement",
      kind: CommissionComponentKind.DISBURSEMENT_BONUS,
      tone: "green",
      prefix: "Desembolso +",
    },
    {
      key: "risk",
      kind: CommissionComponentKind.RISK_BONUS,
      tone: "green",
      prefix: "Risco +",
    },
    {
      key: "rate",
      kind: CommissionComponentKind.RATE_BONUS,
      tone: "green",
      prefix: "Taxa +",
    },
    {
      key: "permanence",
      kind: CommissionComponentKind.PERMANENCE_BONUS,
      tone: "amber",
      prefix: "Permanência +",
    },
  ];

  return entries.flatMap(({ key, kind, tone, prefix }) => {
    const amount = componentAmount(current, kind);
    if (amount <= 0) return [];
    const spacer = prefix.endsWith("+") ? "" : " ";
    return [{ key, tone, label: `${prefix}${spacer}${fmtBRL(amount)}` }];
  });
}

export function buildRealPerformanceView(
  profile: PartnerProfile,
  current: CurrentPerformance,
  program: PartnerProgram,
): RealPerformanceView {
  const { level } = profile;
  const dBands = bandsOf(program, BonusPillar.DISBURSEMENT);
  const rBands = bandsOf(program, BonusPillar.RISK);
  const tBands = bandsOf(program, BonusPillar.RATE);
  const delinquencyRate = current.delinquency.rate;
  const averageRate = current.averageRate.rate;

  return {
    periodLegend: formatPeriodLegend(current.periodStart, current.periodEnd),
    monthlyTarget: level.monthlyTarget,
    monthlyFixed: level.monthlyFixed,
    commissionTotal: current.commission.total,
    kpis: [
      {
        key: "disbursement",
        label: "Desembolso vs. meta",
        value: `${Math.round(current.origination.targetPercent)}%`,
        sub: `${fmtBRL(current.origination.amount)} de ${fmtBRL(level.monthlyTarget)}`,
        bonus: current.origination.bonusPercent,
        maxBonus: maxBonusPercent(dBands),
      },
      {
        key: "delinquency",
        label: "Inadimplência",
        value: delinquencyRate !== null ? fmtPct(delinquencyRate) : "N/A",
        sub:
          delinquencyRate !== null
            ? bandLabel(delinquencyRate, rBands, BonusPillar.RISK)
            : "Sem carteira para medir",
        bonus: current.delinquency.bonusPercent,
        maxBonus: maxBonusPercent(rBands),
      },
      {
        key: "rate",
        label: "Taxa média",
        value: averageRate !== null ? fmtPct(averageRate) : "N/A",
        sub:
          averageRate !== null
            ? bandLabel(averageRate, tBands, BonusPillar.RATE)
            : "Sem originação no mês",
        bonus: current.averageRate.bonusPercent,
        maxBonus: maxBonusPercent(tBands),
      },
    ],
    pills: buildPills(current),
  };
}
