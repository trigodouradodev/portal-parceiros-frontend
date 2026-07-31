import { useRef } from "react";
import { CommissionPill } from "@/features/performance/components/CommissionPill";
import { RealKpiCard } from "@/features/performance/components/RealKpiCard";
import { buildRealPerformanceView } from "@/features/performance/utils/build-real-performance-view";
import { useDragScroll } from "@/hooks/useDragScroll";
import { fmtBRL } from "@/lib/utils";
import type {
  CurrentPerformance,
  PartnerProfile,
  PartnerProgram,
} from "@/services/performance/performance.types";

interface RealPerformanceSectionProps {
  profile: PartnerProfile;
  current: CurrentPerformance;
  program: PartnerProgram;
}

export function RealPerformanceSection({
  profile,
  current,
  program,
}: RealPerformanceSectionProps) {
  const kpiScrollRef = useRef<HTMLDivElement>(null);
  const kpiScroll = useDragScroll(kpiScrollRef);
  const view = buildRealPerformanceView(profile, current, program);

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
        <span className="text-xs text-[#6B7080]">{view.periodLegend}</span>
      </div>
      <p className="mb-3 text-xs text-[#6B7080]">
        Meta {fmtBRL(view.monthlyTarget)} · fixo {fmtBRL(view.monthlyFixed)}
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
          {view.kpis.map((kpi) => (
            <RealKpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.sub}
              bonus={kpi.bonus}
              maxBonus={kpi.maxBonus}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute top-0 right-0 bottom-1 w-10 bg-gradient-to-l from-white md:hidden" />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-navy px-4 py-3.5">
        <div>
          <p className="text-[10px] font-semibold tracking-wide text-white/60 uppercase">
            Comissão real acumulada até hoje
          </p>
          <p className="mt-0.5 font-fraunces text-2xl font-bold leading-tight text-white">
            {fmtBRL(view.commissionTotal)}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          {view.pills.map((pill) => (
            <CommissionPill key={pill.key} tone={pill.tone}>
              {pill.label}
            </CommissionPill>
          ))}
        </div>
      </div>
    </div>
  );
}
