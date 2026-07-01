/** Valores selecionáveis na UI de registrar cobrança (antes do mapeamento para a API). */
export const ChargeOutcome = {
  NO_RETURN: "no_return",
  SEM_PREVISAO: "sem_previsao",
  PROMISE: "promise",
  PAID: "paid",
  NOT_PAID: "not_paid",
} as const;

export type ChargeOutcome = (typeof ChargeOutcome)[keyof typeof ChargeOutcome];
