import { useState } from "react";
import { BreakdownRow } from "@/features/performance/components/BreakdownRow";
import { KpiLadderCard } from "@/features/performance/components/KpiLadderCard";
import { PermanenceTrail } from "@/features/performance/components/PermanenceTrail";
import { SliderControl } from "@/features/performance/components/SliderControl";
import {
  bandsOf,
  computeCommission,
  maxBonusPercent,
} from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import {
  desembolsoHint,
  nextMilestoneLabel,
  riscoHint,
  taxaHint,
} from "@/features/performance/utils/hints";
import { fmtBRL } from "@/lib/utils";
import {
  BonusPillar,
  type CurrentPerformance,
  type PartnerProfile,
  type PartnerProgram,
} from "@/services/performance/performance.types";

interface SimulatorSectionProps {
  profile: PartnerProfile;
  current: CurrentPerformance;
  program: PartnerProgram;
}

export function SimulatorSection({
  profile,
  current,
  program,
}: SimulatorSectionProps) {
  const level = profile.level;
  // null na API = sem medição (bônus 0). Não usar 0%/9,5%: 0% de
  // inadimplência cairia no teto de risco (+50%). Partimos de valores
  // típicos da faixa zerada (risco >5%, taxa <9,5%).
  // Remount via `key` no pai quando os dados reais mudam.
  const [originacao, setOriginacao] = useState(current.origination.amount);
  const [inad, setInad] = useState(current.delinquency.rate ?? 6);
  const [taxa, setTaxa] = useState(current.averageRate.rate ?? 9);
  const [mes, setMes] = useState(profile.partnership.monthNumber);

  const sim = computeCommission(level, program, originacao, inad, taxa, mes);
  const delta = sim.total - current.commission.total;

  const dMax = maxBonusPercent(bandsOf(program, BonusPillar.DISBURSEMENT));
  const rMax = maxBonusPercent(bandsOf(program, BonusPillar.RISK));
  const tMax = maxBonusPercent(bandsOf(program, BonusPillar.RATE));

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
          max={Math.round(level.monthlyTarget * 1.6)}
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
          hint={
            mes === 1 ? "Boas-vindas ativa" : nextMilestoneLabel(mes, program)
          }
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <KpiLadderCard
          label="Desembolso vs. meta"
          value={`${Math.round(sim.pctMeta)}%`}
          sub={`${fmtBRL(originacao)} de ${fmtBRL(level.monthlyTarget)} · ${sim.d.label}`}
          bonus={sim.d.bonusPercent}
          maxBonus={dMax}
          segments={[
            { color: "#D84040", width: 100 },
            { color: "#BA7517", width: 10 },
            { color: "#8FCB6B", width: 10 },
            { color: "#1D9E75", width: 20 },
          ]}
          markerPct={dMarker}
          scale={["0%", "100%", "120%+"]}
          hint={desembolsoHint(sim, originacao, level.monthlyTarget, program)}
        />
        <KpiLadderCard
          label="Risco · Inadimplência"
          value={fmtPct(inad)}
          sub={`peso de 50% nos adicionais · ${sim.r.label}`}
          bonus={sim.r.bonusPercent}
          maxBonus={rMax}
          segments={[
            { color: "#1D9E75", width: 2 },
            { color: "#8FCB6B", width: 1.5 },
            { color: "#BA7517", width: 1.5 },
            { color: "#D84040", width: 3 },
          ]}
          markerPct={rMarker}
          scale={["0%", "3,5%", "8%+"]}
          hint={riscoHint(sim, inad, program)}
        />
        <KpiLadderCard
          label="Taxa média"
          value={fmtPct(taxa)}
          sub={sim.t.label}
          bonus={sim.t.bonusPercent}
          maxBonus={tMax}
          segments={[
            { color: "#D84040", width: 2.5 },
            { color: "#8FCB6B", width: 0.5 },
            { color: "#1D9E75", width: 2 },
          ]}
          markerPct={tMarker}
          scale={["7%", "9,5%", "12%"]}
          hint={taxaHint(sim, taxa, program)}
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
            Nível {level.label} · projeção para o mês {mes}
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
            sub={`Nível ${level.label}`}
            value={level.monthlyFixed}
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
            sub={`${Math.round(sim.pctMeta)}% da meta · +${Math.round(sim.d.bonusPercent)}%`}
            value={sim.dVal}
            dim={sim.d.bonusPercent === 0}
          />
          <BreakdownRow
            name="Bônus de risco"
            sub={`${sim.r.label} · +${Math.round(sim.r.bonusPercent)}%`}
            value={sim.rVal}
            dim={sim.r.bonusPercent === 0}
          />
          <BreakdownRow
            name="Bônus de taxa média"
            sub={`${sim.t.label} · +${Math.round(sim.t.bonusPercent)}%`}
            value={sim.tVal}
            dim={sim.t.bonusPercent === 0}
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

      <PermanenceTrail
        mes={mes}
        fixo={level.monthlyFixed}
        milestones={program.permanenceMilestones}
      />
    </div>
  );
}
