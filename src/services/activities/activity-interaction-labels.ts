import { ActivityInteractionResult } from "./activities.types";

const ACTIVITY_INTERACTION_RESULT_LABELS: Record<string, string> = {
  [ActivityInteractionResult.NO_RETURN]: "Sem retorno",
  [ActivityInteractionResult.PAYMENT_PROMISE]: "Promessa de pagamento",
  [ActivityInteractionResult.WILL_PAY_ON_DATE]: "Pagará na data",
  [ActivityInteractionResult.REQUESTED_EXTENSION]: "Pediu prorrogação",
  [ActivityInteractionResult.WANTS_RENEGOTIATION]: "Quer renegociar",
};

function humanizeSnakeCase(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getActivityInteractionResultLabel(result: string): string {
  const normalized = result.toLowerCase();
  return (
    ACTIVITY_INTERACTION_RESULT_LABELS[normalized] ??
    humanizeSnakeCase(normalized)
  );
}
