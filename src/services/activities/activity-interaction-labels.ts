import { ActivityInteractionResult } from "./activity.enums";

const ACTIVITY_INTERACTION_RESULT_LABELS: Record<
  ActivityInteractionResult,
  string
> = {
  [ActivityInteractionResult.NO_RESPONSE]: "Sem resposta",
  [ActivityInteractionResult.NOT_LOCATED]: "Não localizado",
  [ActivityInteractionResult.PAYMENT_PROMISE]: "Promessa de pagamento",
  [ActivityInteractionResult.DISPUTE]: "Disputa / Contestação",
  [ActivityInteractionResult.RENEGOTIATION]: "Renegociação",
  [ActivityInteractionResult.DECEASED]: "Falecido",
  [ActivityInteractionResult.NO_FORECAST]: "Sem previsão",
  [ActivityInteractionResult.OTHER]: "Outro",
};

/** Códigos legados (v1 / follow-up) → canônico v2 do backend. */
const LEGACY_RESULT_ALIASES: Record<string, ActivityInteractionResult> = {
  no_return: ActivityInteractionResult.NO_RESPONSE,
  sem_previsao: ActivityInteractionResult.NO_FORECAST,
  will_pay_on_date: ActivityInteractionResult.PAYMENT_PROMISE,
  requested_extension: ActivityInteractionResult.OTHER,
  wants_renegotiation: ActivityInteractionResult.RENEGOTIATION,
  not_paid: ActivityInteractionResult.OTHER,
  paid: ActivityInteractionResult.OTHER,
  promise: ActivityInteractionResult.PAYMENT_PROMISE,
};

function humanizeSnakeCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeInteractionResult(
  result: string,
): ActivityInteractionResult | null {
  const normalized = result.toLowerCase();

  if (
    Object.values(ActivityInteractionResult).includes(
      normalized as ActivityInteractionResult,
    )
  ) {
    return normalized as ActivityInteractionResult;
  }

  return LEGACY_RESULT_ALIASES[normalized] ?? null;
}

export function getActivityInteractionResultLabel(result: string): string {
  const canonical = normalizeInteractionResult(result);
  if (canonical) {
    return ACTIVITY_INTERACTION_RESULT_LABELS[canonical];
  }

  return humanizeSnakeCase(result);
}

const ACTIVITY_INTERACTION_CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  call: "Ligação",
  visit: "Visita",
  whatsapp_message: "WhatsApp",
  client_call: "Ligação",
  client_visit: "Visita",
};

export function getActivityInteractionChannelLabel(channel: string): string {
  const normalized = channel.toLowerCase();
  return (
    ACTIVITY_INTERACTION_CHANNEL_LABELS[normalized] ??
    humanizeSnakeCase(normalized)
  );
}
