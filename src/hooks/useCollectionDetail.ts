import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard/dashboard.service";

export const collectionKeys = {
  all: ["collections"] as const,
  detail: (contractId: string, installmentNumber: number) =>
    [
      ...collectionKeys.all,
      "detail",
      contractId,
      installmentNumber,
    ] as const,
};

export function useCollectionDetail(
  contractId: string,
  installmentNumber: number | undefined,
) {
  return useQuery({
    queryKey: collectionKeys.detail(
      contractId,
      installmentNumber ?? 0,
    ),
    queryFn: () =>
      dashboardService.getCollectionDetail(contractId, installmentNumber!),
    enabled: Boolean(contractId && installmentNumber),
    staleTime: 30 * 1000,
  });
}
