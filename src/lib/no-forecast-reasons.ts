/** Catálogo comum às tarefas e aos Follow-ups; códigos definidos pelo backend. */
export const NO_FORECAST_REASON_LABELS = {
  indebtedness: "Endividamento",
  sales_decline: "Baixa nas vendas",
  credit_diversion: "Desvio de crédito",
  client_not_located: "Cliente não localizado",
  health_problems: "Problemas de saúde",
  payment_decline: "Baixa no pagamento",
  refusal_to_pay: "Cliente se nega a pagar",
  job_loss: "Perda de emprego",
  scam_or_fraud_victim: "Vítima de golpe/fraude",
  addiction: "Vícios",
  death: "Falecimento",
  contract_not_ceded: "Contrato não cedido",
  benefit_cut: "Benefício cortado",
  awaiting_municipal_payment: "Aguardando pagamento da Prefeitura",
  moved_to_another_city: "Mudou de cidade",
  family_problems:
    "Problema na família (doença ou morte de parente, separação)",
  rural_unproductive_period: "Atividade rural, período improdutivo.",
  business_setback: "Imprevisto no negócio",
  loan_shark_debt_or_other_payment_priorities:
    "Dívida com agiota ou prioriza outras contas",
  business_closed_or_bankruptcy: "Negócio fechado, Falência",
  theft_or_robbery: "Roubo/furto",
  funds_or_account_blocked:
    "Conta ou dinheiro bloqueado (judicial ou bancário)",
  imprisonment: "Prisão",
  natural_disaster_or_fire_or_flood: "Desastres naturais, incêndio, enchentes",
  other: "Outro",
} as const;

export type NoForecastReason = keyof typeof NO_FORECAST_REASON_LABELS;

export const NO_FORECAST_REASON_OPTIONS = Object.entries(
  NO_FORECAST_REASON_LABELS,
).map(([value, label]) => ({ value: value as NoForecastReason, label }));

export function isNoForecastReason(value: string): value is NoForecastReason {
  return Object.prototype.hasOwnProperty.call(NO_FORECAST_REASON_LABELS, value);
}

export function getNoForecastReasonLabel(value: string): string {
  return isNoForecastReason(value) ? NO_FORECAST_REASON_LABELS[value] : value;
}
