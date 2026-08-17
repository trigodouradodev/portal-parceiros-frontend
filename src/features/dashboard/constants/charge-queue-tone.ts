import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";
import type { QueueTone } from "@/services/activities/activity.enums";

export const QUEUE_TONE_LABELS: Record<QueueTone, string> = {
  friendly: "Tom amigável",
  firm: "Tom firme",
  severe: "Tom severo",
};

export const QUEUE_TONE_DESCRIPTIONS: Record<QueueTone, string> = {
  friendly: "Lembrete cordial de pagamento.",
  firm: "Alerta com menção à carta de cobrança.",
  severe: "Aviso formal com ameaça de negativação.",
};

const STAGE_TONE_LABELS: Record<CollectionStageCode, string> = {
  friendly: "Tom amigável",
  assertive: "Tom firme",
  warning: "Tom severo",
  defaulted: "Tom severo",
};

const STAGE_TO_TONE: Record<CollectionStageCode, QueueTone> = {
  friendly: "friendly",
  assertive: "firm",
  warning: "severe",
  defaulted: "severe",
};

export const QUEUE_TONE_PILL_CLASS: Record<QueueTone, string> = {
  friendly: "text-[#1D9E75] bg-[#E6F7F1]",
  firm: "text-[#BA7517] bg-[#FDF3E0]",
  severe: "text-[#D84040] bg-[#FEECEC]",
};

export const QUEUE_TONE_CORRECTED_CLASS: Record<QueueTone, string> = {
  friendly: "bg-[#E6F7F1] text-[#0F6E56]",
  firm: "bg-[#FDF3E0] text-[#854F0B]",
  severe: "bg-[#FEECEC] text-[#A32D2D]",
};

export function resolveQueueTone(
  queueTone?: QueueTone | string,
  stageCode?: CollectionStageCode,
  overdueDays?: number,
): QueueTone {
  if (
    queueTone === "friendly" ||
    queueTone === "firm" ||
    queueTone === "severe"
  ) {
    return queueTone;
  }
  if (stageCode && stageCode in STAGE_TO_TONE) {
    return STAGE_TO_TONE[stageCode];
  }
  if (overdueDays != null) {
    if (overdueDays <= 5) return "friendly";
    if (overdueDays <= 10) return "firm";
    return "severe";
  }
  return "friendly";
}

export function getQueueToneLabel(
  queueTone?: QueueTone | string,
  stageCode?: CollectionStageCode,
): string {
  if (queueTone && queueTone in QUEUE_TONE_LABELS) {
    return QUEUE_TONE_LABELS[queueTone as QueueTone];
  }
  if (!stageCode) return "Tom amigável";
  return STAGE_TONE_LABELS[stageCode] ?? "Tom amigável";
}
