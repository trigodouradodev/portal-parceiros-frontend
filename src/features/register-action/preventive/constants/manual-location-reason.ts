export type ManualLocationReason =
  | "gps_imprecise"
  | "no_signal"
  | "wrong_address"
  | "receiving_at_address";

export const MANUAL_LOCATION_REASON_OPTIONS: ReadonlyArray<{
  value: ManualLocationReason;
  label: string;
}> = [
  { value: "gps_imprecise", label: "GPS impreciso" },
  { value: "no_signal", label: "Sem sinal / sinal fraco" },
  { value: "wrong_address", label: "Endereço cadastrado parece errado" },
  { value: "receiving_at_address", label: "Estou recebendo no meu endereço" },
];

const REASON_LABEL: Record<ManualLocationReason, string> = {
  gps_imprecise: "GPS impreciso",
  no_signal: "Sem sinal / sinal fraco",
  wrong_address: "Endereço cadastrado parece errado",
  receiving_at_address: "Estou recebendo no meu endereço",
};

/**
 * Anexa metadados de confirmação manual à observação, para auditoria e
 * sinalização de possível geocoding ruim (AUREA-352).
 */
export function appendManualLocationAuditNote(
  note: string | undefined,
  reason: ManualLocationReason | null,
  addressLikelyWrong: boolean,
): string | undefined {
  const parts: string[] = [];
  if (reason) {
    parts.push(`[Confirmação manual: ${REASON_LABEL[reason]}]`);
  }
  if (addressLikelyWrong || reason === "wrong_address") {
    parts.push("[Sinal: endereço possivelmente mal geocodificado]");
  }
  if (parts.length === 0) return note?.trim() || undefined;

  const suffix = parts.join(" ");
  const base = note?.trim() ?? "";
  return base ? `${base}\n${suffix}` : suffix;
}
