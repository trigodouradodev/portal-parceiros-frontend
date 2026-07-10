import {
  ActivityChannel,
  type CollectionStageCode,
} from "@/services/dashboard/dashboard.types";
import type {
  ActivityTaskType,
  QueueTone,
} from "@/services/activities/activity.enums";

export const TONE_TO_STAGE: Record<QueueTone, CollectionStageCode> = {
  friendly: "friendly",
  firm: "assertive",
  severe: "warning",
};

export function mapToneToStageCode(
  tone: QueueTone | string,
): CollectionStageCode {
  return TONE_TO_STAGE[tone as QueueTone] ?? "friendly";
}

export function mapTaskTypeToChannel(
  taskType: ActivityTaskType | string,
): ActivityChannel {
  if (taskType === "visit") return ActivityChannel.CLIENT_VISIT;
  return ActivityChannel.CLIENT_CALL;
}
