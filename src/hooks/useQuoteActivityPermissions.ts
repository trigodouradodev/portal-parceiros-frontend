import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";

export interface QuoteActivityPermissions {
  canSimulateQuote: boolean;
  canCreateQuote: boolean;
  /** Restrição de originação do parceiro (módulo de Gestão de Parceiros). */
  originationRestricted?: boolean;
}

export const quoteActivityPermissionsKeys = {
  all: ["quote-activity-permissions"] as const,
};

export function useQuoteActivityPermissions(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: quoteActivityPermissionsKeys.all,
    queryFn: async (): Promise<QuoteActivityPermissions> => {
      const profile = await authService.getProfile();
      return {
        canSimulateQuote: profile.canSimulateQuote,
        canCreateQuote: profile.canCreateQuote,
        originationRestricted: profile.originationRestricted === true,
      };
    },
    staleTime: 30 * 1000,
    enabled: options?.enabled ?? true,
  });
}
