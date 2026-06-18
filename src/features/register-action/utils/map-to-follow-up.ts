import {
  FollowUpExpectedResult,
  FollowUpStatus,
  type CreateFollowUpPayload,
} from "@/services/followup/followup.types";

export function mapCobrOutcomeToStatus(outcome: string): FollowUpStatus {
  switch (outcome) {
    case "no_return_1":
    case "no_return_2":
      return FollowUpStatus.NO_ANSWER;
    case "sem_previsao":
    case "not_paid":
      return FollowUpStatus.NO_FORECAST;
    case "promise":
      return FollowUpStatus.PROMISE_TO_PAY;
    case "paid":
      return FollowUpStatus.CONTACTED;
    default:
      return FollowUpStatus.OTHER;
  }
}

export function mapPrevChannelToStatus(
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

export function mapPrevOutcomeToExpectedResult(
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

const CONTACT_STATUS_MAP: Record<string, FollowUpStatus> = {
  "Sem retorno": FollowUpStatus.NO_ANSWER,
  "Não localizado": FollowUpStatus.NO_ANSWER,
  "Sem Previsão": FollowUpStatus.NO_FORECAST,
  "Promessa de pagamento": FollowUpStatus.PROMISE_TO_PAY,
  "Disputa / Contestação": FollowUpStatus.DISPUTE,
  Renegociação: FollowUpStatus.RENEGOTIATION,
  Outro: FollowUpStatus.OTHER,
};

export function mapContactLabelToStatus(label: string): FollowUpStatus {
  return CONTACT_STATUS_MAP[label] ?? FollowUpStatus.OTHER;
}

export function buildCobrFollowUpPayload(params: {
  contractId: string;
  installmentNumber: number;
  outcome: string;
  note?: string;
  boletoDate?: string;
}): CreateFollowUpPayload {
  const payload: CreateFollowUpPayload = {
    contractId: params.contractId,
    installmentNumber: params.installmentNumber,
    status: mapCobrOutcomeToStatus(params.outcome),
    note: params.note || undefined,
  };

  if (params.outcome === "promise" && params.boletoDate) {
    // Date input is YYYY-MM-DD; noon UTC avoids local timezone shifting the day.
    payload.paymentForecast = `${params.boletoDate}T12:00:00.000Z`;
  }

  return payload;
}

export function buildPrevFollowUpPayload(params: {
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
    status: mapPrevChannelToStatus(params.channel),
    note: params.note || undefined,
    expectedResult: mapPrevOutcomeToExpectedResult(params.outcome),
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

export function buildContactFollowUpPayload(params: {
  contractId: string;
  installmentNumber: number;
  contactType: "phone" | "visit";
  statusLabel: string;
  note?: string;
  contactDate?: string;
  contactTime?: string;
}): CreateFollowUpPayload {
  const parts: string[] = [];
  if (params.contactDate && params.contactTime) {
    parts.push(`Contato em ${params.contactDate} ${params.contactTime}`);
  }
  if (params.note?.trim()) {
    parts.push(params.note.trim());
  }

  const status = mapContactLabelToStatus(params.statusLabel);
  const channelNote =
    params.contactType === "visit" ? "Canal: visita" : "Canal: ligação";
  parts.unshift(channelNote);

  return {
    contractId: params.contractId,
    installmentNumber: params.installmentNumber,
    status,
    note: parts.join("\n") || undefined,
  };
}
