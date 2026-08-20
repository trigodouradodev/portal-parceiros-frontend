import type { CarteiraDrillDownFilter } from "@/services/contracts/contracts.types";

export const CONTRACT_LIST_PATH = "/carteira/contratos";

/** AUREA-330: monta a rota da lista (tela própria, não modal) a partir do drill-down do KPI. */
export function buildContractListPath(
  title: string,
  filter: CarteiraDrillDownFilter = {},
): string {
  const params = new URLSearchParams({ title });
  if (filter.onlyActive) params.set("onlyActive", "true");
  if (filter.onlyDelinquency) params.set("onlyDelinquency", "true");
  if (filter.onlyRenegotiated) params.set("onlyRenegotiated", "true");
  if (filter.onlyDueToday) params.set("onlyDueToday", "true");
  if (filter.onlyUpcomingRenewal) {
    params.set("onlyUpcomingRenewal", "true");
  }
  return `${CONTRACT_LIST_PATH}?${params.toString()}`;
}

export interface ContractListRouteState {
  title: string;
  initialFilter: CarteiraDrillDownFilter;
}

/** Lado inverso de `buildContractListPath` — lido pela ContractListPage. */
export function parseContractListSearchParams(
  params: URLSearchParams,
): ContractListRouteState {
  return {
    title: params.get("title") ?? "Contratos",
    initialFilter: {
      onlyActive: params.get("onlyActive") === "true",
      onlyDelinquency: params.get("onlyDelinquency") === "true",
      onlyRenegotiated: params.get("onlyRenegotiated") === "true",
      onlyDueToday: params.get("onlyDueToday") === "true",
      onlyUpcomingRenewal: params.get("onlyUpcomingRenewal") === "true",
    },
  };
}
