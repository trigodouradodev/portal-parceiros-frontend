import { ActivityChannel } from "@/services/dashboard/dashboard.types";

/** Rótulo de etapa pendente na fila / detalhe (ex.: "Visita pendente"). */
export function getPendingActionLabel(channel?: ActivityChannel): string {
  if (channel === ActivityChannel.CLIENT_VISIT) return "Visita pendente";
  return "Contato pendente";
}
