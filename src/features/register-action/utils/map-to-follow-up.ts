import {
  FollowUpExpectedResult,
  FollowUpParty,
  FollowUpType,
  type CreateFollowUpPayload,
} from "@/services/followup/followup.types";

export function mapPreventiveChannelToType(
  channel: "whatsapp" | "phone" | "visit",
): FollowUpType {
  switch (channel) {
    case "whatsapp":
      return FollowUpType.MESSAGE;
    case "phone":
      return FollowUpType.CALL;
    case "visit":
      return FollowUpType.VISIT;
  }
}

export function mapPreventiveOutcomeToExpectedResult(
  outcome?: string | null,
): FollowUpExpectedResult | undefined {
  switch (outcome) {
    case "confirmed":
      return FollowUpExpectedResult.WILL_PAY_ON_DATE;
    case "no_return":
      return FollowUpExpectedResult.NO_RETURN;
    case "delay":
      return FollowUpExpectedResult.REQUESTED_EXTENSION;
    case "dispute":
      return FollowUpExpectedResult.DISPUTE;
    case "renegotiate":
      return FollowUpExpectedResult.WANTS_RENEGOTIATION;
    case "deceased":
      return FollowUpExpectedResult.DECEASED;
    case "no_forecast":
      return FollowUpExpectedResult.NO_FORECAST;
    case "not_located":
      return FollowUpExpectedResult.NOT_LOCATED;
    case "other":
      return FollowUpExpectedResult.OTHER;
    default:
      return undefined;
  }
}

export function buildPreventiveFollowUpPayload(params: {
  contractId: string;
  installmentNumber: number;
  channel: "whatsapp" | "phone" | "visit";
  party: FollowUpParty;
  outcome?: string | null;
  note?: string;
  paymentForecast?: string;
  latitude?: number;
  longitude?: number;
}): CreateFollowUpPayload {
  const payload: CreateFollowUpPayload = {
    contractId: params.contractId,
    installmentNumber: params.installmentNumber,
    followUpType: mapPreventiveChannelToType(params.channel),
    party: params.party,
    note: params.note || undefined,
    expectedResult: mapPreventiveOutcomeToExpectedResult(params.outcome),
    paymentForecast: params.paymentForecast,
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
