import {
  ActivityChannel,
  type ActivityTaskStatus,
} from "@/services/dashboard/dashboard.types";

export const CHARGE_PIPELINE_CHANNELS = [
  ActivityChannel.WHATSAPP_MESSAGE,
  ActivityChannel.CLIENT_CALL,
  ActivityChannel.CLIENT_VISIT,
] as const;

const CHANNEL_SHORT_LABELS: Record<ActivityChannel, string> = {
  [ActivityChannel.WHATSAPP_MESSAGE]: "WhatsApp",
  [ActivityChannel.CLIENT_CALL]: "Ligação",
  [ActivityChannel.CLIENT_VISIT]: "Visita",
};

export function getChannelShortLabel(channel: ActivityChannel | string): string {
  return CHANNEL_SHORT_LABELS[channel as ActivityChannel] ?? channel;
}

export function getChannelRegisterTitle(channel: ActivityChannel): string {
  switch (channel) {
    case ActivityChannel.WHATSAPP_MESSAGE:
      return "Registrar WhatsApp";
    case ActivityChannel.CLIENT_CALL:
      return "Registrar ligação";
    case ActivityChannel.CLIENT_VISIT:
      return "Registrar visita";
    default:
      return "Registrar ação";
  }
}

export function getChannelActionButtonLabel(channel: ActivityChannel): string {
  switch (channel) {
    case ActivityChannel.WHATSAPP_MESSAGE:
      return "Registrar WhatsApp";
    case ActivityChannel.CLIENT_CALL:
      return "Registrar Ligação";
    case ActivityChannel.CLIENT_VISIT:
      return "Registrar Visita";
    default:
      return "Registrar ação";
  }
}

export type PipelineStepState = "done" | "current" | "pending";

export function getPipelineStepStates(
  currentChannel: ActivityChannel,
  taskStatus: ActivityTaskStatus | "pending" | "completed",
): PipelineStepState[] {
  const currentIndex = CHARGE_PIPELINE_CHANNELS.indexOf(currentChannel);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const isCompleted = taskStatus === "completed";

  return CHARGE_PIPELINE_CHANNELS.map((_, index) => {
    if (isCompleted) return "done";
    if (index < safeIndex) return "done";
    if (index === safeIndex) return "current";
    return "pending";
  });
}
