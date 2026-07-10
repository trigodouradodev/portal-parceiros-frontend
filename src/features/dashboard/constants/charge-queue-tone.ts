import type { CollectionStageCode } from "@/services/dashboard/dashboard.types";
import type { QueueTone } from "@/services/activities/activity.enums";

export const QUEUE_TONE_LABELS: Record<QueueTone, string> = {
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
  queueTone?: QueueTone | string,
  stageCode?: CollectionStageCode,
): string {
  if (queueTone && queueTone in QUEUE_TONE_LABELS) {
    return QUEUE_TONE_LABELS[queueTone as QueueTone];
  }
  if (!stageCode) return "Tom amigável";
  return STAGE_TONE_LABELS[stageCode] ?? "Tom amigável";
}
