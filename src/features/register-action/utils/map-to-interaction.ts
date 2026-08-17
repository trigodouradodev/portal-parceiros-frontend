import {
  ActivityInteractionChannel,
  ActivityInteractionResult,
  ActivityRecipientType,
  ActivityTaskType,
} from "@/services/activities/activity.enums";
import type { RegisterInteractionPayload } from "@/services/activities/activities.types";
import type { PreventiveContactType } from "@/contexts/action/action-context";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

export function mapContactTypeToInteractionChannel(
  contactType?: PreventiveContactType,
  taskChannel?: ActivityChannel,
): ActivityInteractionChannel {
  if (contactType === "whatsapp") {
    return ActivityInteractionChannel.WHATSAPP;
  }
  if (contactType === "phone") {
    return ActivityInteractionChannel.CALL;
  }
  if (contactType === "visit" || taskChannel === ActivityChannel.CLIENT_VISIT) {
    return ActivityInteractionChannel.VISIT;
  }
  if (taskChannel === ActivityChannel.WHATSAPP_MESSAGE) {
    return ActivityInteractionChannel.WHATSAPP;
  }
  return ActivityInteractionChannel.CALL;
}

export function mapTaskChannelToActivityTaskType(
  taskChannel?: ActivityChannel,
  contactType?: PreventiveContactType,
): ActivityTaskType {
  if (contactType === "visit" || taskChannel === ActivityChannel.CLIENT_VISIT) {
    return ActivityTaskType.VISIT;
  }
  return ActivityTaskType.CONTACT;
}

export function buildV2RegisterInteractionPayload(params: {
  result: ActivityInteractionResult;
  recipientType: ActivityRecipientType;
  contactType?: PreventiveContactType;
  taskChannel?: ActivityChannel;
  note?: string;
  promiseDate?: string;
  latitude?: number;
  longitude?: number;
}): RegisterInteractionPayload {
  const payload: RegisterInteractionPayload = {
    channel: mapContactTypeToInteractionChannel(
      params.contactType,
      params.taskChannel,
    ),
    recipientType: params.recipientType,
    result: params.result,
    observation: params.note || undefined,
  };

  if (
    params.result === ActivityInteractionResult.PAYMENT_PROMISE &&
    params.promiseDate
  ) {
    payload.promiseDate = `${params.promiseDate}T12:00:00.000Z`;
  }

  if (
    payload.channel === ActivityInteractionChannel.VISIT &&
    params.latitude !== undefined &&
    params.longitude !== undefined
  ) {
    payload.latitude = params.latitude;
    payload.longitude = params.longitude;
  }

  return payload;
}
