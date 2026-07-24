import { useState } from "react";
import { BreakdownRow } from "@/features/performance/components/BreakdownRow";
import { KpiLadderCard } from "@/features/performance/components/KpiLadderCard";
import { PermanenceTrail } from "@/features/performance/components/PermanenceTrail";
import { SliderControl } from "@/features/performance/components/SliderControl";
import {
  computeCommission,
  currentPartner,
  LEVELS,
} from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import {
  desembolsoHint,
  nextMilestoneLabel,
  riscoHint,
  taxaHint,
} from "@/features/performance/utils/hints";
import { fmtBRL } from "@/lib/utils";

export function SimulatorSection() {
  const p = currentPartner;
  const lvl = LEVELS[p.level];
  const [originacao, setOriginacao] = useState(p.real.originacao);
  const [inad, setInad] = useState(p.real.inad);
  const [taxa, setTaxa] = useState(p.real.taxa);
  const [mes, setMes] = useState(p.tenureMonths);

  const real = computeCommission(
    p.level,
    p.real.originacao,
    p.real.inad,
    p.real.taxa,
    p.tenureMonths,
  );
  const sim = computeCommission(p.level, originacao, inad, taxa, mes);
  const delta = sim.total - real.total;

  const dMarker = (Math.min(sim.pctMeta, 140) / 140) * 100;
  const rMarker = (Math.min(inad, 8) / 8) * 100;
  const tMarker = ((Math.min(Math.max(taxa, 7), 12) - 7) / 5) * 100;

  return (
    <div className="rounded-2xl border border-[#D6D9E3] bg-white p-5 shadow">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-[#1A1D2E] md:text-lg">
            Simulador de cenários
          </span>
          <span className="rounded-full bg-brand-yellow/40 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-navy uppercase">
            Simulação
          </span>
        </div>
        <span className="text-xs text-[#6B7080]">
          Parte do seu desempenho real e projeta um cenário hipotético.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        <SliderControl
          label="Originação no mês"
          value={originacao}
          min={0}
          max={Math.round(lvl.meta * 1.6)}
          step={2000}
          onChange={setOriginacao}
          valueLabel={fmtBRL(originacao)}
          hint={`${Math.round(sim.pctMeta)}% da meta`}
        />
        <SliderControl
          label="Inadimplência"
          value={inad}
          min={0}
          max={8}
          step={0.1}
          onChange={setInad}
          valueLabel={fmtPct(inad)}
          hint="Meta interna < 3,5%"
        />
        <SliderControl
          label="Taxa média"
          value={taxa}
          min={7}
          max={12}
          step={0.1}
          onChange={setTaxa}
          valueLabel={fmtPct(taxa)}
          hint="Referência 9,5–10%"
        />
        <SliderControl
          label="Projetar para o mês"
          value={mes}
          min={1}
          max={24}
          step={1}
          onChange={setMes}
          valueLabel={`${mes} ${mes === 1 ? "mês" : "meses"}`}
          hint={mes === 1 ? "Boas-vindas ativa" : nextMilestoneLabel(mes)}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <KpiLadderCard
          label="Desembolso vs. meta"
          value={`${Math.round(sim.pctMeta)}%`}
          sub={`${fmtBRL(originacao)} de ${fmtBRL(lvl.meta)} · ${sim.d.label}`}
          bonus={sim.d.bonus}
          maxBonus={0.2}
          segments={[
            { color: "#D84040", width: 100 },
            { color: "#BA7517", width: 10 },
            { color: "#8FCB6B", width: 10 },
            { color: "#1D9E75", width: 20 },
          ]}
          markerPct={dMarker}
          scale={["0%", "100%", "120%+"]}
          hint={desembolsoHint(sim, originacao, lvl.meta)}
        />
        <KpiLadderCard
          label="Risco · Inadimplência"
          value={fmtPct(inad)}
          sub={`peso de 50% nos adicionais · ${sim.r.label}`}
          bonus={sim.r.bonus}
          maxBonus={0.5}
          segments={[
            { color: "#1D9E75", width: 2 },
            { color: "#8FCB6B", width: 1.5 },
            { color: "#BA7517", width: 1.5 },
            { color: "#D84040", width: 3 },
          ]}
          markerPct={rMarker}
          scale={["0%", "3,5%", "8%+"]}
          hint={riscoHint(sim, inad)}
        />
        <KpiLadderCard
          label="Taxa média"
          value={fmtPct(taxa)}
          sub={sim.t.label}
          bonus={sim.t.bonus}
          maxBonus={0.3}
          segments={[
            { color: "#D84040", width: 2.5 },
            { color: "#8FCB6B", width: 0.5 },
            { color: "#1D9E75", width: 2 },
          ]}
          markerPct={tMarker}
          scale={["7%", "9,5%", "12%"]}
          hint={taxaHint(sim, taxa)}
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-[#D6D9E3] shadow md:flex">
        <div className="flex flex-col justify-center bg-brand-navy px-6 py-6 md:w-64 md:shrink-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/60">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-yellow text-sm font-bold text-brand-navy">
              $
            </span>
            Comissão simulada
          </div>
          <p className="font-fraunces text-3xl font-bold leading-none text-white">
            {fmtBRL(sim.total)}
          </p>
          <p className="mt-2 text-xs text-white/40">
            Nível {lvl.label} · projeção para o mês {mes}
          </p>
          <span
            className={`mt-3 inline-flex items-center gap-1.5 self-start rounded-lg px-2.5 py-1.5 text-xs font-bold ${
              Math.abs(delta) < 1
                ? "bg-white/10 text-white/70"
                : delta > 0
                  ? "bg-[#1D9E75]/20 text-[#6EE7B7]"
                  : "bg-[#D84040]/20 text-[#FF9E9E]"
            }`}
          >
            {Math.abs(delta) < 1
              ? "Igual à comissão real de hoje"
              : `${delta > 0 ? "+" : ""}${fmtBRL(delta)} vs. real de hoje`}
          </span>
        </div>

        <div className="flex flex-1 flex-col bg-white px-5 py-5">
          <p className="mb-1 text-[10px] font-semibold tracking-widest text-[#4B5165] uppercase">
            Como essa comissão é formada
          </p>
          <BreakdownRow
            name="Fixo mensal"
            sub={`Nível ${lvl.label}`}
            value={lvl.fixo}
          />
          {sim.boasVindas > 0 && (
            <BreakdownRow
              name="Bônus de boas-vindas"
              sub="só no 1º mês"
              value={sim.boasVindas}
              tag="novo"
            />
          )}
          <BreakdownRow
            name="Bônus de desembolso"
            sub={`${Math.round(sim.pctMeta)}% da meta · +${Math.round(sim.d.bonus * 100)}%`}
            value={sim.dVal}
            dim={sim.d.bonus === 0}
          />
          <BreakdownRow
            name="Bônus de risco"
            sub={`${sim.r.label} · +${Math.round(sim.r.bonus * 100)}%`}
            value={sim.rVal}
            dim={sim.r.bonus === 0}
          />
          <BreakdownRow
            name="Bônus de taxa média"
            sub={`${sim.t.label} · +${Math.round(sim.t.bonus * 100)}%`}
            value={sim.tVal}
            dim={sim.t.bonus === 0}
          />
          {sim.perm && (
            <BreakdownRow
              name="Bônus de permanência"
              sub={`marco de ${mes} meses · ${sim.perm.mult}× fixo`}
              value={sim.permVal}
              tag="marco"
            />
          )}
          <BreakdownRow name="Total projetado" value={sim.total} isTotal />
        </div>
      </div>

      <PermanenceTrail mes={mes} fixo={lvl.fixo} />
    </div>
  );
}
