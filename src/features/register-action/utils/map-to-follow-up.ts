import {
  FollowUpExpectedResult,
  FollowUpStatus,
  type CreateFollowUpPayload,
} from "@/services/followup/followup.types";

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
