import type { ListSimulationsQuery } from "@/services/origination/origination.types";

export const SIMULATIONS_SEARCH_DEBOUNCE_MS = 300;

const CPF_MASK_CHARS = /[.\-\/\s]/g;

export function buildSimulationsListQuery(
  search: string,
): ListSimulationsQuery {
  const trimmed = search.trim();
  if (!trimmed) return {};

  const digits = trimmed.replace(/\D/g, "");
  const unmasked = trimmed.replace(CPF_MASK_CHARS, "");

  if (digits.length > 0 && /^\d+$/.test(unmasked)) {
    return { document: digits };
  }

  return { name: trimmed };
}

export function isSimulationsFilterActive(
  query: ListSimulationsQuery,
): boolean {
  return Boolean(query.name || query.document);
}
