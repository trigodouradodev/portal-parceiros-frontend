import { BreakdownRow } from "@/features/performance/components/BreakdownRow";
import { KpiLadderCard } from "@/features/performance/components/KpiLadderCard";
import { PermanenceTrail } from "@/features/performance/components/PermanenceTrail";
import { SliderControl } from "@/features/performance/components/SliderControl";
import { useSimulatorModel } from "@/features/performance/hooks/useSimulatorModel";
import { fmtPct } from "@/features/performance/utils/format";
import { fmtBRL } from "@/lib/utils";
import type {
  CurrentPerformance,
  PartnerProfile,
  PartnerProgram,
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
  const model = useSimulatorModel(profile, current, program);
  const {
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
    disbursement,
    risk,
    rate,
  } = model;

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
          max={originacaoMax}
          step={2000}
          onChange={setOriginacao}
          valueLabel={fmtBRL(originacao)}
          hint={`${Math.round(sim.pctMeta)}% da meta`}
        />
        <SliderControl
          label="Inadimplência"
          value={inad}
          min={risk.sliderMin}
          max={risk.sliderMax}
          step={0.1}
          onChange={setInad}
          valueLabel={fmtPct(inad)}
          hint="Meta interna < 3,5%"
        />
        <SliderControl
          label="Taxa média"
          value={taxa}
          min={rate.sliderMin}
          max={rate.sliderMax}
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
          hint={monthHint}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <KpiLadderCard
          label="Desembolso vs. meta"
          value={`${Math.round(sim.pctMeta)}%`}
          sub={`${fmtBRL(originacao)} de ${fmtBRL(level.monthlyTarget)} · ${sim.d.label}`}
          bonus={sim.d.bonusPercent}
          maxBonus={disbursement.maxBonus}
          segments={disbursement.segments}
          markerPct={disbursement.markerPct(sim.pctMeta)}
          scale={disbursement.scale}
          hint={disbursement.hint}
        />
        <KpiLadderCard
          label="Risco · Inadimplência"
          value={fmtPct(inad)}
          sub={`peso de ${Math.round(risk.maxBonus)}% nos adicionais · ${sim.r.label}`}
          bonus={sim.r.bonusPercent}
          maxBonus={risk.maxBonus}
          segments={risk.segments}
          markerPct={risk.markerPct(inad)}
          scale={risk.scale}
          hint={risk.hint}
        />
        <KpiLadderCard
          label="Taxa média"
          value={fmtPct(taxa)}
          sub={sim.t.label}
          bonus={sim.t.bonusPercent}
          maxBonus={rate.maxBonus}
          segments={rate.segments}
          markerPct={rate.markerPct(taxa)}
          scale={rate.scale}
          hint={rate.hint}
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
