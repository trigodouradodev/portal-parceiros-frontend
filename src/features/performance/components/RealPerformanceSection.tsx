import { useRef } from "react";
import { CommissionPill } from "@/features/performance/components/CommissionPill";
import { RealKpiCard } from "@/features/performance/components/RealKpiCard";
import {
  computeCommission,
  currentPartner,
  LEVELS,
} from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import { useDragScroll } from "@/hooks/useDragScroll";
import { fmtBRL } from "@/lib/utils";

export function RealPerformanceSection() {
  const p = currentPartner;
  const lvl = LEVELS[p.level];
  const r = computeCommission(
    p.level,
    p.real.originacao,
    p.real.inad,
    p.real.taxa,
    p.tenureMonths,
  );
  const now = new Date();
  const kpiScrollRef = useRef<HTMLDivElement>(null);
  const kpiScroll = useDragScroll(kpiScrollRef);

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
          1 a {now.getDate()} de{" "}
          {now.toLocaleDateString("pt-BR", { month: "long" })}
        </span>
      </div>
      <p className="mb-3 text-xs text-[#6B7080]">
        Meta {fmtBRL(lvl.meta)} · fixo {fmtBRL(lvl.fixo)}/mês
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
            value={`${Math.round(r.pctMeta)}%`}
            sub={`${fmtBRL(p.real.originacao)} de ${fmtBRL(lvl.meta)}`}
            bonus={r.d.bonus}
            maxBonus={0.2}
          />
          <RealKpiCard
            label="Inadimplência"
            value={fmtPct(p.real.inad)}
            sub={r.r.label}
            bonus={r.r.bonus}
            maxBonus={0.5}
          />
          <RealKpiCard
            label="Taxa média"
            value={fmtPct(p.real.taxa)}
            sub={r.t.label}
            bonus={r.t.bonus}
            maxBonus={0.3}
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
            {fmtBRL(r.total)}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <CommissionPill tone="navy">Fixo {fmtBRL(lvl.fixo)}</CommissionPill>
          {r.boasVindas > 0 && (
            <CommissionPill tone="yellow">
              Boas-vindas {fmtBRL(r.boasVindas)}
            </CommissionPill>
          )}
          {r.dVal > 0 && (
            <CommissionPill tone="green">
              Desembolso +{fmtBRL(r.dVal)}
            </CommissionPill>
          )}
          {r.rVal > 0 && (
            <CommissionPill tone="green">
              Risco +{fmtBRL(r.rVal)}
            </CommissionPill>
          )}
          {r.tVal > 0 && (
            <CommissionPill tone="green">
              Taxa +{fmtBRL(r.tVal)}
            </CommissionPill>
          )}
          {r.perm && (
            <CommissionPill tone="amber">
              Permanência +{fmtBRL(r.permVal)}
            </CommissionPill>
          )}
        </div>
      </div>
    </div>
  );
}
