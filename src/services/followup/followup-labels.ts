import { FollowUpStatus } from "./followup.types";

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
