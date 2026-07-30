import type {
  BonusBand,
  BonusPillar,
  PartnerLevel,
  PartnerProgram,
  ProgramMilestone,
} from "@/services/performance/performance.types";
import { BonusPillar as Pillar } from "@/services/performance/performance.types";

export interface BandResult {
  /** Bônus em % sobre o fixo (0–100), igual ao backend. */
  bonusPercent: number;
  label: string;
}

export interface CommissionBreakdown {
  level: PartnerLevel;
  pctMeta: number;
  d: BandResult;
  r: BandResult;
  t: BandResult;
  perm: { mult: number; value: number } | null;
  boasVindas: number;
  dVal: number;
  rVal: number;
  tVal: number;
  permVal: number;
  total: number;
}

function containsValue(band: BonusBand, value: number): boolean {
  const aboveMin = band.minInclusive
    ? value >= band.minValue
    : value > band.minValue;
  if (!aboveMin) return false;
  if (band.maxValue === null) return true;
  return band.maxInclusive ? value <= band.maxValue : value < band.maxValue;
}

export function bandsOf(
  program: PartnerProgram,
  pillar: BonusPillar,
): BonusBand[] {
  return program.bonusPillars.find((p) => p.pillar === pillar)?.bands ?? [];
}

export function resolveBonusPercent(value: number, bands: BonusBand[]): number {
  const band = bands.find((candidate) => containsValue(candidate, value));
  return band?.bonusPercent ?? 0;
}

export function maxBonusPercent(bands: BonusBand[]): number {
  if (bands.length === 0) return 0;
  return Math.max(...bands.map((b) => b.bonusPercent));
}

function formatNumber(value: number): string {
  return value.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
  });
}

/** Rótulo legível da faixa em que o valor cai. */
export function bandLabel(
  value: number,
  bands: BonusBand[],
  pillar: BonusPillar,
): string {
  const band = bands.find((candidate) => containsValue(candidate, value));
  if (!band) return "fora das faixas";

  const { minValue, maxValue, minInclusive, maxInclusive, bonusPercent } = band;
  const suffix = pillar === Pillar.DISBURSEMENT ? "% da meta" : "%";

  if (maxValue !== null && minValue === maxValue) {
    return `exatamente ${formatNumber(minValue)}${suffix}`;
  }

  if (bonusPercent === 0) {
    if (pillar === Pillar.RISK) {
      return maxValue === null
        ? `acima de ${formatNumber(minValue)}${suffix} · risco alto`
        : `acima de ${formatNumber(maxInclusive ? maxValue : minValue)}${suffix} · risco alto`;
    }
    if (pillar === Pillar.DISBURSEMENT && maxValue !== null) {
      return `abaixo de ${formatNumber(maxValue)}${suffix}`;
    }
    if (pillar === Pillar.RATE && maxValue !== null) {
      return `abaixo de ${formatNumber(maxValue)}${suffix}`;
    }
  }

  if (maxValue === null) {
    const op = minInclusive ? "≥" : ">";
    return `${op} ${formatNumber(minValue)}${suffix}`;
  }

  if (pillar === Pillar.RISK && minValue === 0 && minInclusive) {
    return `até ${formatNumber(maxValue)}${suffix} · risco baixo`;
  }

  // Intervalo aberto no teto [100,110) → "100–109"
  const hi =
    !maxInclusive && Number.isInteger(maxValue) ? maxValue - 1 : maxValue;
  return `${formatNumber(minValue)}–${formatNumber(hi)}${suffix}`;
}

function resolveBand(
  value: number,
  bands: BonusBand[],
  pillar: BonusPillar,
): BandResult {
  return {
    bonusPercent: resolveBonusPercent(value, bands),
    label: bandLabel(value, bands, pillar),
  };
}

export function findNextMilestone(
  monthNumber: number,
  milestones: ProgramMilestone[],
): ProgramMilestone | null {
  return milestones.find((m) => m.month > monthNumber) ?? null;
}

export function permanenceBonus(
  monthNumber: number,
  monthlyFixed: number,
  milestones: ProgramMilestone[],
): { mult: number; value: number } | null {
  const milestone = milestones.find((m) => m.month === monthNumber);
  if (!milestone) return null;
  return {
    mult: milestone.multiplier,
    value: Math.round(monthlyFixed * milestone.multiplier * 100) / 100,
  };
}

/** Soma dos multiplicadores (ex.: 1+2+3 = 6) para a coluna Permanência 18M. */
export function permanenceTotalMultiplier(
  milestones: ProgramMilestone[],
): number {
  return milestones.reduce((sum, m) => sum + m.multiplier, 0);
}

/**
 * Comissão simulada a partir dos parâmetros do programa (mesmas faixas do backend).
 * `inad` e `taxa` em %; `originacao` em R$.
 */
export function computeCommission(
  level: PartnerLevel,
  program: PartnerProgram,
  originacao: number,
  inad: number,
  taxa: number,
  mes: number,
): CommissionBreakdown {
  const { monthlyFixed, monthlyTarget } = level;
  const pctMeta =
    monthlyTarget > 0
      ? Math.round((originacao / monthlyTarget) * 10000) / 100
      : 0;

  const dBands = bandsOf(program, Pillar.DISBURSEMENT);
  const rBands = bandsOf(program, Pillar.RISK);
  const tBands = bandsOf(program, Pillar.RATE);

  const d = resolveBand(pctMeta, dBands, Pillar.DISBURSEMENT);
  const r = resolveBand(inad, rBands, Pillar.RISK);
  const t = resolveBand(taxa, tBands, Pillar.RATE);
  const perm = permanenceBonus(mes, monthlyFixed, program.permanenceMilestones);
  const boasVindas = mes === 1 ? program.welcomeBonusAmount : 0;

  const dVal = Math.round(((monthlyFixed * d.bonusPercent) / 100) * 100) / 100;
  const rVal = Math.round(((monthlyFixed * r.bonusPercent) / 100) * 100) / 100;
  const tVal = Math.round(((monthlyFixed * t.bonusPercent) / 100) * 100) / 100;
  const permVal = perm?.value ?? 0;

  return {
    level,
    pctMeta,
    d,
    r,
    t,
    perm,
    boasVindas,
    dVal,
    rVal,
    tVal,
    permVal,
    total:
      Math.round(
        (monthlyFixed + boasVindas + dVal + rVal + tVal + permVal) * 100,
      ) / 100,
  };
}

/** Próxima faixa com bônus maior que o atual (para hints do simulador). */
export function nextBetterBand(
  value: number,
  bands: BonusBand[],
  direction: "higher" | "lower",
): BonusBand | null {
  const current = resolveBonusPercent(value, bands);
  const better = bands.filter((b) => b.bonusPercent > current);
  if (better.length === 0) return null;

  if (direction === "higher") {
    // Desembolso / taxa: precisa subir o valor até o piso da próxima faixa melhor
    return better.reduce((best, b) => (b.minValue < best.minValue ? b : best));
  }

  // Risco: precisa baixar — a próxima faixa melhor é a de teto mais alto
  // (a primeira que se entra ao reduzir o valor).
  return better.reduce((best, b) => {
    const bestMax = best.maxValue ?? -Infinity;
    const bMax = b.maxValue ?? -Infinity;
    return bMax > bestMax ? b : best;
  });
}
