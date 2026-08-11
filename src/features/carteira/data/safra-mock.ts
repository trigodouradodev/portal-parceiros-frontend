import type {
  PortfolioSafraMonth,
  PortfolioSafraSummary,
} from "@/services/portfolio/portfolio-safra.types";

/** PRNG determinístico (mulberry32) — série reprodutível sem Math.random. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatMonthLabel(date: Date): string {
  return date
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");
}

function yearMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export interface SafraMockSeed {
  projectedActiveBalance: number;
  activeContracts: number;
  renegotiatedOutstandingAmount: number;
  delinquencyPercent: number;
}

const DEFAULT_SEED: SafraMockSeed = {
  projectedActiveBalance: 1_850_000,
  activeContracts: 142,
  renegotiatedOutstandingAmount: 96_000,
  delinquencyPercent: 8.4,
};

/**
 * Gera 12 meses (mais recente → mais antigo) alinhados às métricas da espec.
 * Troca futura: substituir por GET de safra mantendo o mesmo shape.
 */
export function buildSafraMock(
  seed: Partial<SafraMockSeed> = {},
  referenceDate = new Date(),
): PortfolioSafraSummary {
  const base: SafraMockSeed = {
    projectedActiveBalance:
      seed.projectedActiveBalance ?? DEFAULT_SEED.projectedActiveBalance,
    activeContracts: seed.activeContracts ?? DEFAULT_SEED.activeContracts,
    renegotiatedOutstandingAmount:
      seed.renegotiatedOutstandingAmount ??
      DEFAULT_SEED.renegotiatedOutstandingAmount,
    delinquencyPercent:
      seed.delinquencyPercent ?? DEFAULT_SEED.delinquencyPercent,
  };
  const rand = mulberry32(20260810);
  const months: PortfolioSafraMonth[] = [];

  let saldo = Number(base.projectedActiveBalance);
  let contratos = Number(base.activeContracts);
  let reneg = Number(base.renegotiatedOutstandingAmount);
  let inad = Number(base.delinquencyPercent);

  if (!Number.isFinite(saldo)) saldo = DEFAULT_SEED.projectedActiveBalance;
  if (!Number.isFinite(contratos)) contratos = DEFAULT_SEED.activeContracts;
  if (!Number.isFinite(reneg))
    reneg = DEFAULT_SEED.renegotiatedOutstandingAmount;
  if (!Number.isFinite(inad)) inad = DEFAULT_SEED.delinquencyPercent;

  for (let i = 0; i < 12; i++) {
    const d = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - i,
      1,
    );
    months.push({
      label: formatMonthLabel(d),
      yearMonth: yearMonthKey(d),
      projectedActiveBalance: Math.round(saldo),
      activeContracts: Math.round(contratos),
      renegotiatedOutstandingAmount: Math.round(reneg),
      renegotiatedSharePercent: saldo > 0 ? (reneg / saldo) * 100 : 0,
      delinquencyPercent: inad,
    });

    saldo = saldo / (1.14 + rand() * 0.05);
    contratos = contratos / (1.08 + rand() * 0.04);
    reneg = reneg / (1.02 + rand() * 0.04);
    inad = inad * (0.6 + rand() * 0.15);
  }

  return { months, isMock: true };
}
