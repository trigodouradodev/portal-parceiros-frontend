/** Valores alinhados ao enum ActivityInteractionResult da API de activities. */
export const ChargeOutcome = {
  NO_RETURN: "no_return",
  PAYMENT_PROMISE: "payment_promise",
  WILL_PAY_ON_DATE: "will_pay_on_date",
  REQUESTED_EXTENSION: "requested_extension",
  WANTS_RENEGOTIATION: "wants_renegotiation",
} as const;

export type ChargeOutcome = (typeof ChargeOutcome)[keyof typeof ChargeOutcome];
