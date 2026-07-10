import { useQuery } from "@tanstack/react-query";
import { activitiesService } from "@/services/activities/activities.service";

export const installmentKeys = {
  all: ["activities", "installment-detail"] as const,
  detail: (installmentId: string) =>
    [...installmentKeys.all, installmentId] as const,
};

export function useInstallmentDetail(
  installmentId: string | undefined,
  enabled = true,
) {
  return useQuery({
    queryKey: installmentKeys.detail(installmentId ?? ""),
    queryFn: () => activitiesService.getInstallmentDetail(installmentId!),
    enabled: Boolean(installmentId) && enabled,
    staleTime: 30 * 1000,
  });
}
