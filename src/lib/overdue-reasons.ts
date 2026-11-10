/** Catálogo comum às tarefas e aos Follow-ups; códigos definidos pelo backend. */
export const OVERDUE_REASON_LABELS = {
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

export type OverdueReason = keyof typeof OVERDUE_REASON_LABELS;

export const OVERDUE_REASON_OPTIONS = Object.entries(OVERDUE_REASON_LABELS).map(
  ([value, label]) => ({ value: value as OverdueReason, label }),
);

export function isOverdueReason(value: string): value is OverdueReason {
  return Object.prototype.hasOwnProperty.call(OVERDUE_REASON_LABELS, value);
}

export function getOverdueReasonLabel(value: string): string {
  // Opção removida dos novos registros; mantém o significado do histórico.
  if (value === "death") return "Falecimento";
  return isOverdueReason(value) ? OVERDUE_REASON_LABELS[value] : value;
}

const RESULTS_REQUIRING_REASON = new Set([
  "no_response",
  "payment_promise",
  "dispute",
  "renegotiation",
  "no_forecast",
  "not_located",
  "will_pay_on_date",
  "no_return",
  "requested_extension",
  "wants_renegotiation",
  "promise_to_pay",
  "no_answer",
]);

export function requiresOverdueReason(result?: string | null): boolean {
  return typeof result === "string" && RESULTS_REQUIRING_REASON.has(result);
}
