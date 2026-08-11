import { useQuery } from "@tanstack/react-query";
import { portfolioService } from "@/services/portfolio/portfolio.service";

export const portfolioKeys = {
  all: ["portfolio"] as const,
  summary: () => [...portfolioKeys.all, "summary"] as const,
};

export function usePortfolioSummary(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: portfolioKeys.summary(),
    queryFn: portfolioService.getSummary,
    staleTime: 60 * 1000,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
