import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { contractsService } from "@/services/contracts/contracts.service";
import type { ContractsListQuery } from "@/services/contracts/contracts.types";

export const contractsKeys = {
  all: ["contracts"] as const,
  list: (query: ContractsListQuery) =>
    [...contractsKeys.all, "list", query] as const,
};

export function useContractsList(
  query: ContractsListQuery,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: contractsKeys.list(query),
    queryFn: () => contractsService.getContracts(query),
    staleTime: 30 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
  });
}
