import {
  AutomaticFollowUpAction,
  FollowUpExpectedResult,
  FollowUpParty,
  FollowUpStatus,
  FollowUpType,
} from "./followup.types";

const FOLLOW_UP_STATUS_LABELS: Record<string, string> = {
  [FollowUpStatus.NO_ANSWER]: "Sem retorno",
  [FollowUpStatus.PROMISE_TO_PAY]: "Promessa de pagamento",
  [FollowUpStatus.NO_FORECAST]: "Sem previsão",
  [FollowUpStatus.CONTACTED]: "Contato realizado",
  [FollowUpStatus.DISPUTE]: "Disputa / Contestação",
  [FollowUpStatus.RENEGOTIATION]: "Renegociação",
  [FollowUpStatus.OTHER]: "Outro",
  [FollowUpStatus.CLIENT_CALL]: "Ligação ao cliente",
  [FollowUpStatus.GUARANTOR_CALL]: "Ligação ao avalista",
  [FollowUpStatus.CLIENT_VISIT]: "Visita ao cliente",
  [FollowUpStatus.GUARANTOR_VISIT]: "Visita ao avalista",
  [FollowUpStatus.CLIENT_COLLECTION_LETTER]: "Carta de cobrança (cliente)",
  [FollowUpStatus.GUARANTOR_COLLECTION_LETTER]: "Carta de cobrança (avalista)",
  [FollowUpStatus.NEGATIVATION]: "Negativação",
  [FollowUpStatus.DECEASED]: "Falecimento",
  [FollowUpStatus.WHATSAPP_MESSAGE]: "WhatsApp",
};

const FOLLOW_UP_EXPECTED_RESULT_LABELS: Record<string, string> = {
  [FollowUpExpectedResult.WILL_PAY_ON_DATE]: "Pagará no dia",
  [FollowUpExpectedResult.NO_RETURN]: "Sem retorno",
  [FollowUpExpectedResult.REQUESTED_EXTENSION]: "Pediu prazo extra",
  [FollowUpExpectedResult.DISPUTE]: "Disputa/contestação",
  [FollowUpExpectedResult.WANTS_RENEGOTIATION]: "Quer renegociar",
  [FollowUpExpectedResult.DECEASED]: "Falecido",
  [FollowUpExpectedResult.OTHER]: "Outro",
};

const FOLLOW_UP_TYPE_LABELS: Record<string, string> = {
  [FollowUpType.CALL]: "Ligação",
  [FollowUpType.MESSAGE]: "Mensagem",
  [FollowUpType.VISIT]: "Visita",
};

const FOLLOW_UP_PARTY_LABELS: Record<string, string> = {
  [FollowUpParty.CLIENT]: "Cliente",
  [FollowUpParty.GUARANTOR]: "Avalista",
};

const AUTOMATIC_ACTION_LABELS: Record<string, string> = {
  [AutomaticFollowUpAction.COLLECTION_LETTER]: "Carta de cobrança",
  [AutomaticFollowUpAction.NEGATIVATION]: "Negativação",
  [AutomaticFollowUpAction.RENEGOTIATION]: "Renegociação",
};

function humanizeSnakeCase(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getFollowUpStatusLabel(status: string): string {
  const normalized = status.toLowerCase();
  return FOLLOW_UP_STATUS_LABELS[normalized] ?? humanizeSnakeCase(normalized);
}

export function getFollowUpExpectedResultLabel(result: string): string {
  const normalized = result.toLowerCase();
  return (
    FOLLOW_UP_EXPECTED_RESULT_LABELS[normalized] ??
    humanizeSnakeCase(normalized)
  );
}

/** Rótulo do modelo novo. Só deve ser usado quando `followUpType` existir. */
export function getStructuredFollowUpLabel(
  followUpType: string,
  party?: string,
  automaticAction?: string,
): string {
  const normalizedType = followUpType.toLowerCase();
  const normalizedParty = party?.toLowerCase();
  const typeLabel =
    normalizedType === FollowUpType.AUTOMATIC
      ? (AUTOMATIC_ACTION_LABELS[automaticAction?.toLowerCase() ?? ""] ??
        "Ação automática")
      : (FOLLOW_UP_TYPE_LABELS[normalizedType] ??
        humanizeSnakeCase(normalizedType));
  const partyLabel = normalizedParty
    ? (FOLLOW_UP_PARTY_LABELS[normalizedParty] ??
      humanizeSnakeCase(normalizedParty))
    : undefined;

  return partyLabel ? `${typeLabel} • ${partyLabel}` : typeLabel;
}
