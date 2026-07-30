import { useRef } from "react";
import { CommissionPill } from "@/features/performance/components/CommissionPill";
import { RealKpiCard } from "@/features/performance/components/RealKpiCard";
import {
  bandLabel,
  bandsOf,
  maxBonusPercent,
} from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import { useDragScroll } from "@/hooks/useDragScroll";
import { fmtBRL } from "@/lib/utils";
import {
  BonusPillar,
  CommissionComponentKind,
  type CurrentPerformance,
  type PartnerProfile,
  type PartnerProgram,
} from "@/services/performance/performance.types";

interface RealPerformanceSectionProps {
  profile: PartnerProfile;
  current: CurrentPerformance;
  program: PartnerProgram;
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

export function RealPerformanceSection({
  profile,
  current,
  program,
}: RealPerformanceSectionProps) {
  const { level } = profile;
  const kpiScrollRef = useRef<HTMLDivElement>(null);
  const kpiScroll = useDragScroll(kpiScrollRef);

  const dBands = bandsOf(program, BonusPillar.DISBURSEMENT);
  const rBands = bandsOf(program, BonusPillar.RISK);
  const tBands = bandsOf(program, BonusPillar.RATE);

  const dMax = maxBonusPercent(dBands);
  const rMax = maxBonusPercent(rBands);
  const tMax = maxBonusPercent(tBands);

  const delinquencyRate = current.delinquency.rate;
  const averageRate = current.averageRate.rate;

  const fixed = componentAmount(current, CommissionComponentKind.FIXED);
  const welcome = componentAmount(current, CommissionComponentKind.WELCOME);
  const disbursement = componentAmount(
    current,
    CommissionComponentKind.DISBURSEMENT_BONUS,
  );
  const risk = componentAmount(current, CommissionComponentKind.RISK_BONUS);
  const rate = componentAmount(current, CommissionComponentKind.RATE_BONUS);
  const permanence = componentAmount(
    current,
    CommissionComponentKind.PERMANENCE_BONUS,
  );

  return (
    <div className="rounded-2xl border border-[#D6D9E3] bg-white p-5 shadow">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#1A1D2E] md:text-lg">
            Desempenho real do mês
          </span>
          <span className="rounded-full border border-[#BFE6D7] bg-[#E6F7F1] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0F6E56] uppercase">
            Dado real
          </span>
        </div>
        <span className="text-xs text-[#6B7080]">
          {formatPeriodLegend(current.periodStart, current.periodEnd)}
        </span>
      </div>
      <p className="mb-3 text-xs text-[#6B7080]">
        Meta {fmtBRL(level.monthlyTarget)} · fixo {fmtBRL(level.monthlyFixed)}
        /mês
      </p>

      <div className="relative">
        <div
          ref={kpiScrollRef}
          onPointerDown={kpiScroll.onPointerDown}
          onPointerMove={kpiScroll.onPointerMove}
          onPointerUp={kpiScroll.onPointerUp}
          onPointerCancel={kpiScroll.onPointerCancel}
          className="no-scrollbar flex cursor-grab gap-3 overflow-x-auto pb-1 select-none active:cursor-grabbing md:grid md:cursor-auto md:grid-cols-3 md:overflow-visible md:pb-0"
        >
          <RealKpiCard
            label="Desembolso vs. meta"
            value={`${Math.round(current.origination.targetPercent)}%`}
            sub={`${fmtBRL(current.origination.amount)} de ${fmtBRL(level.monthlyTarget)}`}
            bonus={current.origination.bonusPercent}
            maxBonus={dMax}
          />
          <RealKpiCard
            label="Inadimplência"
            value={delinquencyRate !== null ? fmtPct(delinquencyRate) : "N/A"}
            sub={
              delinquencyRate !== null
                ? bandLabel(delinquencyRate, rBands, BonusPillar.RISK)
                : "Sem carteira para medir"
            }
            bonus={current.delinquency.bonusPercent}
            maxBonus={rMax}
          />
          <RealKpiCard
            label="Taxa média"
            value={averageRate !== null ? fmtPct(averageRate) : "N/A"}
            sub={
              averageRate !== null
                ? bandLabel(averageRate, tBands, BonusPillar.RATE)
                : "Sem originação no mês"
            }
            bonus={current.averageRate.bonusPercent}
            maxBonus={tMax}
          />
        </div>
        <div className="pointer-events-none absolute top-0 right-0 bottom-1 w-10 bg-gradient-to-l from-white md:hidden" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-navy px-4 py-3.5">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-white/60 uppercase">
            Comissão real acumulada até hoje
          </p>
          <p className="mt-0.5 font-fraunces text-2xl font-bold leading-tight text-white">
            {fmtBRL(current.commission.total)}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {fixed > 0 && (
            <CommissionPill tone="navy">Fixo {fmtBRL(fixed)}</CommissionPill>
          )}
          {welcome > 0 && (
            <CommissionPill tone="yellow">
              Boas-vindas {fmtBRL(welcome)}
            </CommissionPill>
          )}
          {disbursement > 0 && (
            <CommissionPill tone="green">
              Desembolso +{fmtBRL(disbursement)}
            </CommissionPill>
          )}
          {risk > 0 && (
            <CommissionPill tone="green">Risco +{fmtBRL(risk)}</CommissionPill>
          )}
          {rate > 0 && (
            <CommissionPill tone="green">Taxa +{fmtBRL(rate)}</CommissionPill>
          )}
          {permanence > 0 && (
            <CommissionPill tone="amber">
              Permanência +{fmtBRL(permanence)}
            </CommissionPill>
          )}
        </div>
      </div>
    </div>
  );
}
