import api from "@/lib/api/axios";
import type {
  PortfolioDashboard,
  MonthPerformance,
  OverdueCollectionPage,
  PreventiveCollectionPage,
  CollectionDetail,
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
    limit: number = 30,
  ): Promise<OverdueCollectionPage> {
    const { data } = await api.get<OverdueCollectionPage>(
      "/collections/overdue",
      { params: { page, limit } },
    );
    return data;
  },

  /**
   * Get paginated preventive contracts (contracts with installment due within N days)
   * GET /collections/preventive?page=1&limit=30&withinDays=15
   */
  async getPreventiveContracts(
    page: number = 1,
    limit: number = 30,
    withinDays: number = 15,
  ): Promise<PreventiveCollectionPage> {
    const { data } = await api.get<PreventiveCollectionPage>(
      "/collections/preventive",
      { params: { page, limit, withinDays } },
    );
    return data;
  },

  /**
   * Get contract/installment detail with follow-up history
   * GET /collections/:contractId/installments/:installmentNumber
   */
  async getCollectionDetail(
    contractId: string,
    installmentNumber: number,
  ): Promise<CollectionDetail> {
    const { data } = await api.get<CollectionDetail>(
      `/collections/${contractId}/installments/${installmentNumber}`,
    );
    return data;
  },
};
