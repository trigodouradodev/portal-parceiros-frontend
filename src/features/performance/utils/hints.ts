import type { CommissionBreakdown } from "@/features/performance/data/commission";
import { nextMilestone } from "@/features/performance/data/commission";
import { fmtPct } from "@/features/performance/utils/format";
import { fmtBRL } from "@/lib/utils";

export function desembolsoHint(
  sim: CommissionBreakdown,
  originacao: number,
  meta: number,
): string {
  if (sim.d.bonus >= 0.2) return "Teto de bônus de desembolso já ativo (+20%).";
  const next = sim.pctMeta < 100 ? 100 : sim.pctMeta < 110 ? 110 : 120;
  const nextBonus = next === 100 ? 10 : next === 110 ? 15 : 20;
  const falta = Math.max((next / 100) * meta - originacao, 0);
  return `Faltam ${fmtBRL(falta)} para ${next}% da meta e destravar +${nextBonus}%.`;
}

export function riscoHint(sim: CommissionBreakdown, inad: number): string {
  if (sim.r.bonus >= 0.5)
    return "Teto de bônus de risco já ativo (+50%) — carteira saudável.";
  const next = inad > 5 ? 5 : inad > 3.5 ? 3.5 : 2;
  const nextBonus = next === 5 ? 15 : next === 3.5 ? 33 : 50;
  return `Reduza a inadimplência para até ${fmtPct(next)} e destrave +${nextBonus}%.`;
}

export function taxaHint(sim: CommissionBreakdown, taxa: number): string {
  if (sim.t.bonus >= 0.3) return "Teto de bônus de taxa já ativo (+30%).";
  if (taxa < 9.5)
    return "Suba a taxa média para 9,5% e destrave +10% (ou acima de 9,5% para +20%).";
  return "Suba a taxa média para acima de 10% e destrave o teto de +30%.";
}

export function nextMilestoneLabel(mes: number): string {
  const m = nextMilestone(mes);
  return m
    ? `Próximo marco: ${m - mes} meses (${m} meses)`
    : "Marcos de permanência concluídos";
}
