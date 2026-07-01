import {
  ActivityInteractionResult,
  type RegisterInteractionPayload,
} from "@/services/activities/activities.types";
import type { ActivityChannel } from "@/services/dashboard/dashboard.types";

export function mapChargeOutcomeToInteractionResult(
  outcome: string,
): ActivityInteractionResult {
  switch (outcome) {
    case "no_return_1":
    case "no_return_2":
    case "sem_previsao":
    case "not_paid":
      return ActivityInteractionResult.NO_RETURN;
    case "promise":
      return ActivityInteractionResult.PAYMENT_PROMISE;
    case "paid":
      return ActivityInteractionResult.WILL_PAY_ON_DATE;
    default:
      return ActivityInteractionResult.NO_RETURN;
  }
}

export function buildRegisterInteractionPayload(params: {
  outcome: string;
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

  if (params.outcome === "promise" && params.promiseDate) {
    payload.promiseDate = `${params.promiseDate}T12:00:00.000Z`;
  }

  if (
    params.taskChannel === "client_visit" &&
    params.latitude !== undefined &&
    params.longitude !== undefined
  ) {
    payload.latitude = params.latitude;
    payload.longitude = params.longitude;
  }

  return payload;
}
