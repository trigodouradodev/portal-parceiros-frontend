import type { ListQuotesQuery } from "@/services/quotes/quotes.types";

export const QUOTES_SEARCH_DEBOUNCE_MS = 300;
export const QUOTES_PAGE_SIZE = 30;

export function buildQuotesListQuery(
  search: string,
  page = 1,
): ListQuotesQuery {
  const trimmed = search.trim();
  return {
    page,
    limit: QUOTES_PAGE_SIZE,
    ...(trimmed ? { search: trimmed } : {}),
  };
}

export function isQuotesFilterActive(query: ListQuotesQuery): boolean {
  return Boolean(query.search || query.status);
}
