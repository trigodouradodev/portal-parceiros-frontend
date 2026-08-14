import { useQuery } from "@tanstack/react-query";
import { contractsService } from "@/services/contracts/contracts.service";

export const contractDetailKeys = {
  all: ["contracts", "detail"] as const,
  detail: (contractId: string) =>
    [...contractDetailKeys.all, contractId] as const,
};

/**
 * AUREA-330: detalhe rico do contrato pra visualização da Carteira
 * (GET /contracts/:id — o backend resolve sozinho qual parcela mostrar).
 */
export function useContractDetailByContractId(
  contractId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: contractDetailKeys.detail(contractId ?? ""),
    queryFn: () => contractsService.getContractDetail(contractId!),
    enabled: Boolean(contractId) && enabled,
    staleTime: 30 * 1000,
  });
}
