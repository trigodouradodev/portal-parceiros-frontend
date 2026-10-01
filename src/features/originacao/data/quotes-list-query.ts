import type { SelectOption } from "@/components/ui/select-option";
import { QuoteStatus } from "@/services/quotes/quotes.enums";
import { getQuoteStatusPresentation } from "@/services/quotes/quotes.status";
import type { ListQuotesQuery } from "@/services/quotes/quotes.types";

export const QUOTES_SEARCH_DEBOUNCE_MS = 300;
export const QUOTES_PAGE_SIZE = 30;

/** Sentinela de "sem filtro de status" no SelectDialogField — precisa ser um
 * valor próprio (não vazio) pra aparecer como opção normal, não placeholder. */
export const ALL_QUOTE_STATUSES = "TODOS";

/**
 * Só os status que de fato ocorrem hoje (levantamento em dado real de
 * Homolog) — kyc_analysis, in_analysis, pre_approved e auto_rejected nunca
 * aparecem na prática, então não fazem sentido como opção de filtro.
 */
const QUOTE_LIST_STATUS_VALUES: QuoteStatus[] = [
  QuoteStatus.DRAFT,
  QuoteStatus.CLIENT_REVIEW,
  QuoteStatus.PENDING,
  QuoteStatus.PENDING_CORRECTION,
  QuoteStatus.FAILED,
  QuoteStatus.APPROVED,
  QuoteStatus.REJECTED,
];

export const QUOTE_LIST_STATUS_OPTIONS: SelectOption[] = [
  { value: ALL_QUOTE_STATUSES, label: "Todas" },
  ...QUOTE_LIST_STATUS_VALUES.map((status) => ({
    value: status,
    label: getQuoteStatusPresentation(status).label,
  })),
];

export function buildQuotesListQuery(
  search: string,
  page = 1,
  status: string = ALL_QUOTE_STATUSES,
): ListQuotesQuery {
  const trimmed = search.trim();
  return {
    page,
    limit: QUOTES_PAGE_SIZE,
    ...(trimmed ? { search: trimmed } : {}),
    ...(status !== ALL_QUOTE_STATUSES ? { status: status as QuoteStatus } : {}),
  };
}

export function isQuotesFilterActive(query: ListQuotesQuery): boolean {
  return Boolean(query.search || query.status);
}
