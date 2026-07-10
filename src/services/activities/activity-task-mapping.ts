import {
  ActivityChannel,
  type CollectionStageCode,
} from "@/services/dashboard/dashboard.types";

export const TONE_TO_STAGE: Record<string, CollectionStageCode> = {
  friendly: "friendly",
  firm: "assertive",
  severe: "warning",
};

export function mapToneToStageCode(tone: string): CollectionStageCode {
  return TONE_TO_STAGE[tone] ?? "friendly";
}

export function mapTaskTypeToChannel(taskType: string): ActivityChannel {
  if (taskType === "visit") return ActivityChannel.CLIENT_VISIT;
  return ActivityChannel.CLIENT_CALL;
}
