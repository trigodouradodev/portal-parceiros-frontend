import {
  ActivityInteractionChannel,
  ActivityInteractionResult,
  ActivityRecipientType,
} from "@/services/activities/activity.enums";
import type { RegisterInteractionPayload } from "@/services/activities/activities.types";
import {
  ChargeOutcome,
  type ChargeOutcome as ChargeOutcomeValue,
} from "@/features/register-action/charge/types";
import { ActivityChannel } from "@/services/dashboard/dashboard.types";

export function mapChargeOutcomeToInteractionResult(
  outcome: ChargeOutcomeValue,
): ActivityInteractionResult {
  switch (outcome) {
    case ChargeOutcome.NO_RETURN:
      return ActivityInteractionResult.NO_RESPONSE;
    case ChargeOutcome.SEM_PREVISAO:
      return ActivityInteractionResult.NO_FORECAST;
    case ChargeOutcome.NOT_PAID:
      return ActivityInteractionResult.OTHER;
    case ChargeOutcome.PROMISE:
      return ActivityInteractionResult.PAYMENT_PROMISE;
    case ChargeOutcome.PAID:
      return ActivityInteractionResult.OTHER;
    default:
      return ActivityInteractionResult.OTHER;
  }
}

function mapUiChannelToInteractionChannel(
  taskChannel?: ActivityChannel,
): ActivityInteractionChannel {
  if (taskChannel === ActivityChannel.CLIENT_VISIT) {
    return ActivityInteractionChannel.VISIT;
  }
  if (taskChannel === ActivityChannel.WHATSAPP_MESSAGE) {
    return ActivityInteractionChannel.WHATSAPP;
  }
  return ActivityInteractionChannel.CALL;
}

export function buildRegisterInteractionPayload(params: {
  outcome: ChargeOutcomeValue;
  note?: string;
  promiseDate?: string;
  taskChannel?: ActivityChannel;
  latitude?: number;
  longitude?: number;
}): RegisterInteractionPayload {
  const payload: RegisterInteractionPayload = {
    channel: mapUiChannelToInteractionChannel(params.taskChannel),
    recipientType: ActivityRecipientType.CLIENT,
    result: mapChargeOutcomeToInteractionResult(params.outcome),
    observation: params.note || undefined,
  };

  if (params.outcome === ChargeOutcome.PROMISE && params.promiseDate) {
    payload.promiseDate = `${params.promiseDate}T12:00:00.000Z`;
  }

  if (
    params.taskChannel === ActivityChannel.CLIENT_VISIT &&
    params.latitude !== undefined &&
    params.longitude !== undefined
  ) {
    payload.latitude = params.latitude;
    payload.longitude = params.longitude;
  }

  return payload;
}
