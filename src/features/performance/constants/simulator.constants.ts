/**
 * Defaults do simulador quando a API retorna null
 * (sem medição no mês — bônus 0 no real).
 * 0% de inadimplência cairia no teto de risco; partimos da faixa zerada.
 */
export const SIMULATOR_DEFAULT_INAD = 6;
export const SIMULATOR_DEFAULT_TAXA = 9;

/** Teto do slider de originação em relação à meta mensal do nível. */
export const SIMULATOR_ORIGINACAO_MAX_FACTOR = 1.6;

export const SIMULATOR_HINTS = {
  inad: "Meta interna < 3,5%",
  taxa: "Referência 9,5–10%",
} as const;

/** Fallback se o programa não tiver marcos de permanência. */
export const PERMANENCE_FALLBACK_HORIZON_MONTHS = 18;
