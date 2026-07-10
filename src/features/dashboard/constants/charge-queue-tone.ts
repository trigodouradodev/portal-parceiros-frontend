import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";

export const QUEUE_TONE_LABELS: Record<string, string> = {
  friendly: "Tom amigável",
  firm: "Tom firme",
  severe: "Tom severo",
};

const STAGE_TONE_LABELS: Record<CollectionStageCode, string> = {
  friendly: "Tom amigável",
  assertive: "Tom firme",
  warning: "Tom severo",
  defaulted: "Tom severo",
};

export function getQueueToneLabel(
  queueTone?: string,
  stageCode?: CollectionStageCode,
): string {
  if (queueTone && QUEUE_TONE_LABELS[queueTone]) {
    return QUEUE_TONE_LABELS[queueTone];
  }
  if (!stageCode) return "Tom amigável";
  return STAGE_TONE_LABELS[stageCode] ?? "Tom amigável";
}
