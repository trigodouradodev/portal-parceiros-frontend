import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/auth-context";
import { performanceService } from "@/services/performance/performance.service";

export const performanceKeys = {
  all: ["performance"] as const,
  months: (userId: string | undefined, partnerId?: string) =>
    [...performanceKeys.all, userId, partnerId ?? userId, "months"] as const,
  detail: (
    userId: string | undefined,
    month: string | undefined,
    partnerId?: string,
  ) =>
    [
      ...performanceKeys.all,
      userId,
      partnerId ?? userId,
      "detail",
      month,
    ] as const,
};

export function usePerformanceMonths(partnerId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: performanceKeys.months(user?.id, partnerId),
    queryFn: ({ signal }) => performanceService.getMonths(signal, partnerId),
    staleTime: 60 * 1000,
    retry: false,
    enabled: Boolean(user?.id),
  });
}

export function usePerformanceData(
  month: string | undefined,
  partnerId?: string,
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: performanceKeys.detail(user?.id, month, partnerId),
    queryFn: ({ signal }) =>
      performanceService.getPerformance(month, signal, partnerId),
    staleTime: 60 * 1000,
    retry: false,
    enabled: Boolean(user?.id && month),
  });
}
