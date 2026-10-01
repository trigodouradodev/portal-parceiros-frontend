export type ManualLocationReason =
  | "at_address_pin_wrong"
  | "client_came_to_me"
  | "visited_other_address"
  | "registered_address_wrong"
  | "device_unavailable"
  | "permission_unavailable"
  | "other";

/** Por que a checagem falhou, do ponto de vista do que o sistema já sabe. */
export type ManualLocationContext =
  | "approximate_address"
  | "device_failure"
  | "permission_blocked"
  | "out_of_radius";

export interface ManualLocationReasonOption {
  value: ManualLocationReason;
  label: string;
  description: string;
  /** Exige texto livre junto da confirmação. */
  requiresNote: boolean;
  /** Reforça o sinal de geocoding ruim para o backoffice. */
  flagsGeocoding: boolean;
}

const REASONS: Record<ManualLocationReason, ManualLocationReasonOption> = {
  at_address_pin_wrong: {
    value: "at_address_pin_wrong",
    label: "Estou no endereço do cliente",
    description: "O mapa localizou este endereço só por aproximação.",
    requiresNote: false,
    flagsGeocoding: true,
  },
  client_came_to_me: {
    value: "client_came_to_me",
    label: "O cliente veio até mim",
    description: "Atendi no meu endereço, não no dele.",
    requiresNote: false,
    flagsGeocoding: false,
  },
  visited_other_address: {
    value: "visited_other_address",
    label: "Encontrei o cliente em outro lugar",
    description: "Trabalho, casa de familiar ou outro endereço.",
    requiresNote: false,
    flagsGeocoding: false,
  },
  registered_address_wrong: {
    value: "registered_address_wrong",
    label: "O endereço cadastrado está errado",
    description: "Falta complemento, ou o cliente não mora mais aqui.",
    requiresNote: false,
    flagsGeocoding: true,
  },
  device_unavailable: {
    value: "device_unavailable",
    label: "Meu celular não conseguiu me localizar",
    description: "Sem sinal, GPS desligado ou a busca demorou demais.",
    requiresNote: false,
    flagsGeocoding: false,
  },
  permission_unavailable: {
    value: "permission_unavailable",
    label: "Não consigo liberar a localização",
    description: "Segui os passos e o navegador continua bloqueando.",
    requiresNote: false,
    flagsGeocoding: false,
  },
  other: {
    value: "other",
    label: "Outro motivo",
    description: "Conte o que aconteceu.",
    requiresNote: true,
    flagsGeocoding: false,
  },
};

/**
 * A tela já sabe por que a checagem falhou, então só oferecemos os motivos
 * que fazem sentido naquele caso. Pedir um diagnóstico técnico que o parceiro
 * não tem como fazer ("GPS impreciso") só produzia dado inútil (AUREA-352).
 */
const CONTEXT_REASONS: Record<ManualLocationContext, ManualLocationReason[]> = {
  approximate_address: [
    "at_address_pin_wrong",
    "registered_address_wrong",
    "client_came_to_me",
    "other",
  ],
  device_failure: [
    "device_unavailable",
    "client_came_to_me",
    "visited_other_address",
    "other",
  ],
  permission_blocked: ["permission_unavailable", "client_came_to_me", "other"],
  out_of_radius: [
    "client_came_to_me",
    "visited_other_address",
    "registered_address_wrong",
    "other",
  ],
};

export function manualLocationReasonOptions(
  context: ManualLocationContext,
): ReadonlyArray<ManualLocationReasonOption> {
  return CONTEXT_REASONS[context].map((value) => REASONS[value]);
}

export function manualLocationReasonRequiresNote(
  reason: ManualLocationReason,
): boolean {
  return REASONS[reason].requiresNote;
}

/**
 * Anexa metadados de confirmação manual à observação, para auditoria e
 * sinalização de possível geocoding ruim (AUREA-352).
 */
export function appendManualLocationAuditNote(
  note: string | undefined,
  reason: ManualLocationReason | null,
  addressLikelyWrong: boolean,
  manualNote?: string | null,
): string | undefined {
  const parts: string[] = [];
  if (reason) {
    const detail = manualNote?.trim();
    parts.push(
      detail
        ? `[Confirmação manual: ${REASONS[reason].label} — ${detail}]`
        : `[Confirmação manual: ${REASONS[reason].label}]`,
    );
  }
  if (addressLikelyWrong || (reason && REASONS[reason].flagsGeocoding)) {
    parts.push("[Sinal: endereço possivelmente mal geocodificado]");
  }
  if (parts.length === 0) return note?.trim() || undefined;

  const suffix = parts.join(" ");
  const base = note?.trim() ?? "";
  return base ? `${base}\n${suffix}` : suffix;
}
