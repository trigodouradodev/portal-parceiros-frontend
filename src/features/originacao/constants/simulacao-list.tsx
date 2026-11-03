import { Loader2, Plus, Search } from "lucide-react";
import type { ListSimulationsQuery } from "@/services/origination/origination.types";

import { PARTNER_ORIGINATION_RESTRICTED_MESSAGE } from "@/lib/partner-restrictions";

export const CREATE_QUOTE_BLOCKED_MESSAGE =
  "Você possui ações de cobrança pendentes que impedem iniciar uma proposta.";

/**
 * Motivo de "Iniciar proposta" estar bloqueado: restrição de originação do
 * parceiro (AUREA-590) ou pendência de cobrança.
 */
export function getCreateQuoteBlockedMessage(
  originationRestricted?: boolean,
): string {
  return originationRestricted
    ? PARTNER_ORIGINATION_RESTRICTED_MESSAGE
    : CREATE_QUOTE_BLOCKED_MESSAGE;
}

export const SEARCH_FIELD_ICON = <Search size={16} />;
export const NEW_SIMULATION_ICON = <Plus size={15} />;
export const EMPTY_PLUS_ICON = <Plus size={22} />;
export const EMPTY_SEARCH_ICON = <Search size={22} />;
export const LIST_LOADING_ICON = <Loader2 size={16} className="animate-spin" />;
export const STARTING_ICON = <Loader2 size={15} className="animate-spin" />;

export const EMPTY_FILTERS: ListSimulationsQuery = {};
