import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard/dashboard.service";

/**
 * React Query hooks for dashboard data
 */

// Query keys for cache management
export const dashboardKeys = {
  all: ["dashboard"] as const,
  kpis: () => [...dashboardKeys.all, "kpis"] as const,
  performance: () => [...dashboardKeys.all, "performance"] as const,
  overdue: (page: number, limit: number) =>
    [...dashboardKeys.all, "overdue", page, limit] as const,
  overdueInfinite: () => [...dashboardKeys.all, "overdue", "infinite"] as const,
  preventiveInfinite: () =>
    [...dashboardKeys.all, "preventive", "infinite"] as const,
};

/**
 * Hook to fetch portfolio KPIs (active contracts, due today, overdue, upcoming renewals)
 */
export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: dashboardService.getDashboard,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch month performance metrics (origination, average rate, delinquency, renewals)
 */
export function usePerformance() {
  return useQuery({
    queryKey: dashboardKeys.performance(),
    queryFn: dashboardService.getPerformance,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to fetch paginated overdue contracts with infinite scroll
 */
export function useOverdueContractsInfinite(limit: number = 30) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.overdueInfinite(),
    queryFn: ({ pageParam = 1 }) =>
      dashboardService.getOverdueContracts(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000, // 30 seconds - more frequent refresh for overdue list
  });
}

/**
 * Hook to fetch paginated overdue contracts (simple pagination)
 */
export function useOverdueContracts(page: number = 1, limit: number = 30) {
  return useQuery({
    queryKey: dashboardKeys.overdue(page, limit),
    queryFn: () => dashboardService.getOverdueContracts(page, limit),
    staleTime: 30 * 1000, // 30 seconds - more frequent refresh for overdue list
  });
}

/**
 * Hook to fetch paginated preventive contracts with infinite scroll
 */
export function usePreventiveContractsInfinite(
  limit: number = 30,
  withinDays: number = 15,
) {
  return useInfiniteQuery({
    queryKey: dashboardKeys.preventiveInfinite(),
    queryFn: ({ pageParam = 1 }) =>
      dashboardService.getPreventiveContracts(pageParam, limit, withinDays),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    staleTime: 30 * 1000, // 30 seconds - more frequent refresh for preventive list
  });
}
