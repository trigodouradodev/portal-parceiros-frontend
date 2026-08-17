import type { CarteiraDrillDownFilter } from "@/services/contracts/contracts.types";
import type { ContractsListQuery } from "@/services/contracts/contracts.types";

export const ALL_PRODUCTS = "TODOS";
export const CONTRACTS_PAGE_SIZE = 30;
export const SEARCH_DEBOUNCE_MS = 300;

export interface ContractsUiFilters {
  search: string;
  productId: string;
  startDate: string;
  endDate: string;
  onlyActive: boolean;
  onlyDelinquency: boolean;
  onlyRenegotiated: boolean;
  page: number;
}

export const EMPTY_CONTRACTS_FILTERS: ContractsUiFilters = {
  search: "",
  productId: ALL_PRODUCTS,
  startDate: "",
  endDate: "",
  onlyActive: false,
  onlyDelinquency: false,
  onlyRenegotiated: false,
  page: 1,
};

export function buildInitialFilters(
  initialFilter?: CarteiraDrillDownFilter,
): ContractsUiFilters {
  return {
    ...EMPTY_CONTRACTS_FILTERS,
    onlyActive: Boolean(initialFilter?.onlyActive),
    onlyDelinquency: Boolean(initialFilter?.onlyDelinquency),
    onlyRenegotiated: Boolean(initialFilter?.onlyRenegotiated),
  };
}

/** Aplica o valor debounced da busca; `null` = sem mudança. */
export function applyDebouncedSearch(
  prev: ContractsUiFilters,
  searchInput: string,
): ContractsUiFilters | null {
  if (prev.search === searchInput) return null;
  return { ...prev, search: searchInput, page: 1 };
}

export function buildContractsListQuery(
  filters: ContractsUiFilters,
): ContractsListQuery {
  return {
    page: filters.page,
    limit: CONTRACTS_PAGE_SIZE,
    search: filters.search || undefined,
    products:
      filters.productId !== ALL_PRODUCTS ? [filters.productId] : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    onlyActive: filters.onlyActive || undefined,
    onlyDelinquency: filters.onlyDelinquency || undefined,
    onlyRenegotiated: filters.onlyRenegotiated || undefined,
  };
}
