import { ActivityInteractionResult } from "@/services/activities/activity.enums";

export type OutcomeDateKind = "promise" | "agreement";

export function getOutcomeDateKind(
  result: ActivityInteractionResult | null,
): OutcomeDateKind | undefined {
  if (result === ActivityInteractionResult.PAYMENT_PROMISE) return "promise";
  if (result === ActivityInteractionResult.RENEGOTIATION) return "agreement";
  return undefined;
}

/** O Calendar usa Date local como representação da data civil de operação. */
export function collectionToday(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)!.value);
  return new Date(value("year"), value("month") - 1, value("day"));
}
