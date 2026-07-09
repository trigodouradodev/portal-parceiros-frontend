import {
  FollowUpExpectedResult,
  FollowUpStatus,
  type CreateFollowUpPayload,
} from "@/services/followup/followup.types";
import {
  ChargeOutcome,
  type ChargeOutcome as ChargeOutcomeValue,
} from "@/features/register-action/charge/types";

export function mapChargeOutcomeToStatus(
  outcome: ChargeOutcomeValue,
): FollowUpStatus {
  switch (outcome) {
    case ChargeOutcome.NO_RETURN:
      return FollowUpStatus.NO_ANSWER;
    case ChargeOutcome.SEM_PREVISAO:
    case ChargeOutcome.NOT_PAID:
      return FollowUpStatus.NO_FORECAST;
    case ChargeOutcome.PROMISE:
      return FollowUpStatus.PROMISE_TO_PAY;
    case ChargeOutcome.PAID:
      return FollowUpStatus.CONTACTED;
    default:
      return FollowUpStatus.OTHER;
  }
}

export function mapPreventiveChannelToStatus(
  channel: "whatsapp" | "phone" | "visit",
): FollowUpStatus {
  switch (channel) {
    case "whatsapp":
      return FollowUpStatus.WHATSAPP_MESSAGE;
    case "phone":
      return FollowUpStatus.CLIENT_CALL;
    case "visit":
      return FollowUpStatus.CLIENT_VISIT;
  }
}

export function mapPreventiveOutcomeToExpectedResult(
  outcome: string,
): FollowUpExpectedResult | undefined {
  switch (outcome) {
    case "confirmed":
      return FollowUpExpectedResult.WILL_PAY_ON_DATE;
    case "no_return":
      return FollowUpExpectedResult.NO_RETURN;
    case "delay":
      return FollowUpExpectedResult.REQUESTED_EXTENSION;
    case "renegotiate":
      return FollowUpExpectedResult.WANTS_RENEGOTIATION;
    default:
      return undefined;
  }
}

export function buildChargeFollowUpPayload(params: {
  contractId: string;
  installmentNumber: number;
  outcome: ChargeOutcomeValue;
  note?: string;
  promiseDate?: string;
}): CreateFollowUpPayload {
  const payload: CreateFollowUpPayload = {
    contractId: params.contractId,
    installmentNumber: params.installmentNumber,
    status: mapChargeOutcomeToStatus(params.outcome),
    note: params.note || undefined,
  };

  if (params.outcome === ChargeOutcome.PROMISE && params.promiseDate) {
    // Date input is YYYY-MM-DD; noon UTC avoids local timezone shifting the day.
    payload.paymentForecast = `${params.promiseDate}T12:00:00.000Z`;
  }

  return payload;
}

export function buildPreventiveFollowUpPayload(params: {
  contractId: string;
  installmentNumber: number;
  channel: "whatsapp" | "phone" | "visit";
  outcome: string;
  note?: string;
  latitude?: number;
  longitude?: number;
}): CreateFollowUpPayload {
  const payload: CreateFollowUpPayload = {
    contractId: params.contractId,
    installmentNumber: params.installmentNumber,
    status: mapPreventiveChannelToStatus(params.channel),
    note: params.note || undefined,
    expectedResult: mapPreventiveOutcomeToExpectedResult(params.outcome),
  };

  if (
    params.channel === "visit" &&
    params.latitude !== undefined &&
    params.longitude !== undefined
  ) {
    payload.latitude = params.latitude;
    payload.longitude = params.longitude;
  }

  return payload;
}
