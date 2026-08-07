import { api } from "@/lib/api/axios";
import type {
  ContractsListQuery,
  ContractsPage,
} from "./contracts.types";

function buildContractsParams(
  query: ContractsListQuery,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {
    page: query.page ?? 1,
    limit: query.limit ?? 30,
  };

  const search = query.search?.trim();
  if (search) params.search = search;
  if (query.startDate) params.startDate = query.startDate;
  if (query.endDate) params.endDate = query.endDate;
  if (query.onlyDelinquency) params.onlyDelinquency = true;
  if (query.onlyRenegotiated) params.onlyRenegotiated = true;
  // Nest aceita lista separada por vírgula (ver ContractsQueryDto).
  if (query.products && query.products.length > 0) {
    params.products = query.products.join(",");
  }

  return params;
}

export const contractsService = {
  /** GET /contracts */
  async getContracts(query: ContractsListQuery = {}): Promise<ContractsPage> {
    const { data } = await api.get<ContractsPage>("/contracts", {
      params: buildContractsParams(query),
    });
    return data;
  },
};
