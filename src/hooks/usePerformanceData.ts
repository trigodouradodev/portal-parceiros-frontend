import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { performanceService } from "@/services/performance/performance.service";

export const performanceKeys = {
  all: ["performance"] as const,
  me: () => [...performanceKeys.all, "me"] as const,
  program: () => [...performanceKeys.all, "program"] as const,
  current: () => [...performanceKeys.all, "current"] as const,
};

export function isNotFoundError(err: unknown): boolean {
  return isAxiosError(err) && err.response?.status === 404;
}

/**
 * Perfil do parceiro no programa. 404 = não inscrito.
 */
export function usePartnerProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: performanceKeys.me(),
    queryFn: performanceService.getMe,
    staleTime: 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function usePartnerProgram(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: performanceKeys.program(),
    queryFn: performanceService.getProgram,
    staleTime: 5 * 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useCurrentPerformance(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: performanceKeys.current(),
    queryFn: performanceService.getCurrent,
    staleTime: 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
