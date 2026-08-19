import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth/auth.service";

export interface QuoteActivityPermissions {
  canSimulateQuote: boolean;
  canCreateQuote: boolean;
}

export const quoteActivityPermissionsKeys = {
  all: ["quote-activity-permissions"] as const,
};

export function useQuoteActivityPermissions() {
  return useQuery({
    queryKey: quoteActivityPermissionsKeys.all,
    queryFn: async (): Promise<QuoteActivityPermissions> => {
      const profile = await authService.getProfile();
      return {
        canSimulateQuote: profile.canSimulateQuote,
        canCreateQuote: profile.canCreateQuote,
      };
    },
    staleTime: 30 * 1000,
  });
}
