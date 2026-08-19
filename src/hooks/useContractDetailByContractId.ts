import { useQuery } from "@tanstack/react-query";
import { contractsService } from "@/services/contracts/contracts.service";

export const contractDetailKeys = {
  all: ["contracts", "detail"] as const,
  detail: (contractId: string, installmentNumber?: number) =>
    [
      ...contractDetailKeys.all,
      contractId,
      installmentNumber ?? "auto",
    ] as const,
};

/**
 * AUREA-330: detalhe rico do contrato pra visualização da Carteira
 * (GET /contracts/:id). Sem `installmentNumber`, o backend resolve sozinho
 * qual parcela mostrar — usado pro resumo do contrato (header/cards).
 *
 * AUREA-346: com `installmentNumber` (parcela escolhida na lista de
 * parcelas), pede o detalhe dessa parcela específica — chave de cache
 * própria pra não colidir com o resumo auto-resolvido do mesmo contrato.
 */
export function useContractDetailByContractId(
  contractId: string | undefined,
  installmentNumber?: number,
  enabled = true,
) {
  return useQuery({
    queryKey: contractDetailKeys.detail(contractId ?? "", installmentNumber),
    queryFn: () =>
      contractsService.getContractDetail(contractId!, installmentNumber),
    enabled: Boolean(contractId) && enabled,
    staleTime: 30 * 1000,
  });
}
