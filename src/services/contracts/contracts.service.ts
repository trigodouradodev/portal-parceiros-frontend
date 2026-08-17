import { api } from "@/lib/api/axios";
import type { CollectionDetail } from "@/services/dashboard/dashboard.types";
import type { ContractsListQuery, ContractsPage } from "./contracts.types";

export function buildContractsParams(
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
  if (query.onlyActive) params.onlyActive = true;
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

  /**
   * AUREA-330: detalhe rico do contrato pra tela de visualização da Carteira.
   * O backend resolve sozinho qual parcela mostrar (aberta mais próxima; sem
   * nenhuma, a última) — não precisa de installmentNumber aqui.
   * GET /contracts/:id
   */
  async getContractDetail(contractId: string): Promise<CollectionDetail> {
    const { data } = await api.get<CollectionDetail>(
      `/contracts/${contractId}`,
    );
    return data;
  },
};
