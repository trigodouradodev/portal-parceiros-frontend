import {
  bandsOf,
  findNextMilestone,
  maxBonusPercent,
  nextBetterBand,
  type CommissionBreakdown,
} from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import { fmtBRL } from "@/lib/utils";
import {
  BonusPillar,
  type PartnerProgram,
} from "@/services/performance/performance.types";

export function desembolsoHint(
  sim: CommissionBreakdown,
  originacao: number,
  meta: number,
  program: PartnerProgram,
): string {
  const bands = bandsOf(program, BonusPillar.DISBURSEMENT);
  const max = maxBonusPercent(bands);
  if (sim.d.bonusPercent >= max && max > 0) {
    return `Teto de bônus de desembolso já ativo (+${Math.round(max)}%).`;
  }
  const next = nextBetterBand(sim.pctMeta, bands, "higher");
  if (!next) return "Continue acompanhando a originação.";
  const falta = Math.max((next.minValue / 100) * meta - originacao, 0);
  return `Faltam ${fmtBRL(falta)} para ${formatThreshold(next.minValue)}% da meta e destravar +${Math.round(next.bonusPercent)}%.`;
}

export function riscoHint(
  sim: CommissionBreakdown,
  inad: number,
  program: PartnerProgram,
): string {
  const bands = bandsOf(program, BonusPillar.RISK);
  const max = maxBonusPercent(bands);
  if (sim.r.bonusPercent >= max && max > 0) {
    return `Teto de bônus de risco já ativo (+${Math.round(max)}%) — carteira saudável.`;
  }
  const next = nextBetterBand(inad, bands, "lower");
  if (!next || next.maxValue === null) {
    return "Reduza a inadimplência para destravar o próximo bônus.";
  }
  return `Reduza a inadimplência para até ${fmtPct(next.maxValue)} e destrave +${Math.round(next.bonusPercent)}%.`;
}

export function taxaHint(
  sim: CommissionBreakdown,
  taxa: number,
  program: PartnerProgram,
): string {
  const bands = bandsOf(program, BonusPillar.RATE);
  const max = maxBonusPercent(bands);
  if (sim.t.bonusPercent >= max && max > 0) {
    return `Teto de bônus de taxa já ativo (+${Math.round(max)}%).`;
  }
  const next = nextBetterBand(taxa, bands, "higher");
  if (!next) return "Continue acompanhando a taxa média.";
  if (next.maxValue !== null && next.minValue === next.maxValue) {
    return `Ajuste a taxa média para ${fmtPct(next.minValue)} e destrave +${Math.round(next.bonusPercent)}%.`;
  }
  const op = next.minInclusive ? "a partir de" : "acima de";
  return `Suba a taxa média para ${op} ${fmtPct(next.minValue)} e destrave +${Math.round(next.bonusPercent)}%.`;
}

export function nextMilestoneLabel(
  mes: number,
  program: PartnerProgram,
): string {
  const m = findNextMilestone(mes, program.permanenceMilestones);
  return m
    ? `Próximo marco: ${m.month - mes} meses (${m.month} meses)`
    : "Marcos de permanência concluídos";
}

function formatThreshold(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
