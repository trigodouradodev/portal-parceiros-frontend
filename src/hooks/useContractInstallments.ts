import { useQuery } from "@tanstack/react-query";
import { contractsService } from "@/services/contracts/contracts.service";

export const contractInstallmentsKeys = {
  all: ["contracts", "installments"] as const,
  list: (contractId: string) =>
    [...contractInstallmentsKeys.all, contractId] as const,
};

/**
 * AUREA-346: todas as parcelas do contrato com status de exibição, pra tela
 * de lista de parcelas da Carteira (GET /contracts/:id/installments).
 */
export function useContractInstallments(
  contractId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: contractInstallmentsKeys.list(contractId ?? ""),
    queryFn: () => contractsService.getContractInstallments(contractId!),
    enabled: Boolean(contractId) && enabled,
    staleTime: 30 * 1000,
  });
}
