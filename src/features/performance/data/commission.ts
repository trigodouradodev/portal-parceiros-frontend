// Modelo de remuneração do Programa de Parceiros Exclusivos.
// Fonte: portal-parceiros-design/src/data/commission.ts
// (Parceiros Exclusivos Oficial.pptx — Trigo Dourado, abril/2026).

export type PartnerLevel = "bronze" | "prata" | "ouro" | "platinum";

export const LEVEL_ORDER: PartnerLevel[] = [
  "bronze",
  "prata",
  "ouro",
  "platinum",
];

export const LEVELS: Record<
  PartnerLevel,
  { label: string; meta: number; fixo: number }
> = {
  bronze: { label: "Bronze", meta: 100_000, fixo: 4_000 },
  prata: { label: "Prata", meta: 150_000, fixo: 6_000 },
  ouro: { label: "Ouro", meta: 200_000, fixo: 8_000 },
  platinum: { label: "Platinum", meta: 300_000, fixo: 12_000 },
};

export const WELCOME_BONUS = 4_000;

export interface Band {
  bonus: number;
  label: string;
}

export function desembolsoBand(pctMeta: number): Band {
  if (pctMeta >= 120) return { bonus: 0.2, label: "≥ 120% da meta" };
  if (pctMeta >= 110) return { bonus: 0.15, label: "110–119% da meta" };
  if (pctMeta >= 100) return { bonus: 0.1, label: "100–109% da meta" };
  return { bonus: 0, label: "abaixo de 100% da meta" };
}

export function riscoBand(inad: number): Band {
  if (inad <= 2) return { bonus: 0.5, label: "até 2% · risco baixo" };
  if (inad <= 3.5) return { bonus: 0.33, label: "2% a 3,5%" };
  if (inad <= 5) return { bonus: 0.15, label: "3,5% a 5%" };
  return { bonus: 0, label: "acima de 5% · risco alto" };
}

export function taxaBand(taxa: number): Band {
  if (taxa > 10) return { bonus: 0.3, label: "acima de 10%" };
  if (taxa > 9.5) return { bonus: 0.2, label: "9,5% a 10%" };
  if (taxa === 9.5) return { bonus: 0.1, label: "exatamente 9,5%" };
  return { bonus: 0, label: "abaixo de 9,5%" };
}

export function permanenciaBonus(
  mes: number,
  fixo: number,
): { mult: number; value: number } | null {
  if (mes === 6) return { mult: 1, value: 1 * fixo };
  if (mes === 12) return { mult: 2, value: 2 * fixo };
  if (mes === 18) return { mult: 3, value: 3 * fixo };
  return null;
}

export function nextMilestone(mes: number): number | null {
  if (mes < 6) return 6;
  if (mes < 12) return 12;
  if (mes < 18) return 18;
  return null;
}

export interface CommissionBreakdown {
  level: PartnerLevel;
  fixo: number;
  pctMeta: number;
  d: Band;
  r: Band;
  t: Band;
  perm: { mult: number; value: number } | null;
  boasVindas: number;
  dVal: number;
  rVal: number;
  tVal: number;
  permVal: number;
  total: number;
}

export function computeCommission(
  level: PartnerLevel,
  originacao: number,
  inad: number,
  taxa: number,
  mes: number,
): CommissionBreakdown {
  const { fixo, meta } = LEVELS[level];
  const pctMeta = (originacao / meta) * 100;
  const d = desembolsoBand(pctMeta);
  const r = riscoBand(inad);
  const t = taxaBand(taxa);
  const perm = permanenciaBonus(mes, fixo);
  const boasVindas = mes === 1 ? WELCOME_BONUS : 0;

  const dVal = d.bonus * fixo;
  const rVal = r.bonus * fixo;
  const tVal = t.bonus * fixo;
  const permVal = perm ? perm.value : 0;

  return {
    level,
    fixo,
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
    total: fixo + boasVindas + dVal + rVal + tVal + permVal,
  };
}

/** Mock do parceiro logado — substituir por API depois. */
export const currentPartner = {
  name: "Roger Santos",
  role: "Agente de cobrança",
  initials: "RS",
  level: "ouro" as PartnerLevel,
  sinceLabel: "novembro de 2025",
  sinceShort: "11/25",
  tenureMonths: 8,
  real: { originacao: 134_000, inad: 3.1, taxa: 9.8 },
};
