import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/auth-context";
import { performanceService } from "@/services/performance/performance.service";

export const performanceKeys = {
  all: ["performance"] as const,
  months: (userId: string | undefined) =>
    [...performanceKeys.all, userId, "months"] as const,
  detail: (userId: string | undefined, month: string | undefined) =>
    [...performanceKeys.all, userId, "detail", month] as const,
};

export function usePerformanceMonths() {
  const { user } = useAuth();
  return useQuery({
    queryKey: performanceKeys.months(user?.id),
    queryFn: ({ signal }) => performanceService.getMonths(signal),
    staleTime: 60 * 1000,
    retry: false,
    enabled: Boolean(user?.id),
  });
}

export function usePerformanceData(month: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: performanceKeys.detail(user?.id, month),
    queryFn: ({ signal }) => performanceService.getPerformance(month, signal),
    staleTime: 60 * 1000,
    retry: false,
    enabled: Boolean(user?.id && month),
  });
}
