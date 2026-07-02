import {
  ActivityInteractionResult,
  type RegisterInteractionPayload,
} from "@/services/activities/activities.types";
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
      return ActivityInteractionResult.NO_RETURN;
    case ChargeOutcome.PAYMENT_PROMISE:
      return ActivityInteractionResult.PAYMENT_PROMISE;
    case ChargeOutcome.WILL_PAY_ON_DATE:
      return ActivityInteractionResult.WILL_PAY_ON_DATE;
    case ChargeOutcome.REQUESTED_EXTENSION:
      return ActivityInteractionResult.REQUESTED_EXTENSION;
    case ChargeOutcome.WANTS_RENEGOTIATION:
      return ActivityInteractionResult.WANTS_RENEGOTIATION;
    default:
      return ActivityInteractionResult.NO_RETURN;
  }
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
    result: mapChargeOutcomeToInteractionResult(params.outcome),
    observation: params.note || undefined,
  };

  if (
    params.outcome === ChargeOutcome.PAYMENT_PROMISE &&
    params.promiseDate
  ) {
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
