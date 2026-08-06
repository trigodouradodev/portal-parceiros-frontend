import { api } from "@/lib/api/axios";
import type { PortfolioSummary } from "./portfolio.types";

export const portfolioService = {
  /** GET /portfolio/summary */
  async getSummary(): Promise<PortfolioSummary> {
    const { data } = await api.get<PortfolioSummary>("/portfolio/summary");
    return data;
  },
};
