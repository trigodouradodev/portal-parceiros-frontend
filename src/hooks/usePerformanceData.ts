import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth/auth-context";
import { performanceService } from "@/services/performance/performance.service";

export const performanceKeys = {
  all: ["performance"] as const,
  months: (userId: string | undefined, partnerId?: string) =>
    [...performanceKeys.all, userId, partnerId ?? "scope", "months"] as const,
  detail: (
    userId: string | undefined,
    month: string | undefined,
    partnerId?: string,
    memberId?: string,
  ) =>
    [
      ...performanceKeys.all,
      userId,
      partnerId ?? userId,
      "detail",
      month,
      memberId ?? "consolidated",
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
  memberId?: string,
  enabled = true,
) {
  const { user } = useAuth();
  return useQuery({
    queryKey: performanceKeys.detail(user?.id, month, partnerId, memberId),
    queryFn: ({ signal }) =>
      performanceService.getPerformance(month, signal, partnerId, memberId),
    staleTime: 60 * 1000,
    retry: false,
    enabled: Boolean(user?.id && month && enabled),
  });
}

export function usePerformancePartners(month?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...performanceKeys.all, user?.id, "partners", month],
    queryFn: ({ signal }) => performanceService.getPartners(month, signal),
    enabled: Boolean(user?.id && month),
    staleTime: 60 * 1000,
    retry: false,
  });
}
export function usePerformanceTeam(partnerId?: string, month?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...performanceKeys.all, user?.id, "team", partnerId, month],
    queryFn: ({ signal }) =>
      performanceService.getTeam(partnerId!, month, signal),
    enabled: Boolean(user?.id && partnerId && month),
    staleTime: 60 * 1000,
    retry: false,
  });
}
