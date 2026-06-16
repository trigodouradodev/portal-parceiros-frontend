import api from "@/lib/api/axios";
import type {
  PortfolioDashboard,
  MonthPerformance,
  OverdueCollectionPage,
} from "./dashboard.types";

/**
 * Dashboard API Service
 * Handles all dashboard and collections API calls
 */
export const dashboardService = {
  /**
   * Get portfolio KPIs (active contracts, due today, overdue, upcoming renewals)
   * GET /dashboard
   */
  async getDashboard(): Promise<PortfolioDashboard> {
    const { data } = await api.get<PortfolioDashboard>("/dashboard");
    return data;
  },

  /**
   * Get month performance metrics (origination, average rate, delinquency, renewals)
   * GET /dashboard/performance
   */
  async getPerformance(): Promise<MonthPerformance> {
    const { data } = await api.get<MonthPerformance>("/dashboard/performance");
    return data;
  },

  /**
   * Get paginated overdue contracts
   * GET /collections/overdue?page=1&limit=30
   */
  async getOverdueContracts(
    page: number = 1,
    limit: number = 30
  ): Promise<OverdueCollectionPage> {
    const { data } = await api.get<OverdueCollectionPage>(
      "/collections/overdue",
      { params: { page, limit } }
    );
    return data;
  },
};
