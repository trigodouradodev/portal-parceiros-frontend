import { api } from "@/lib/api/axios";
import type {
  PerformanceMonthsResponse,
  PerformanceResponse,
} from "./performance.types";

export const performanceService = {
  async getMonths(signal?: AbortSignal): Promise<PerformanceMonthsResponse> {
    const { data } = await api.get<PerformanceMonthsResponse>(
      "/performance/months",
      { signal },
    );
    return data;
  },

  async getPerformance(
    month?: string,
    signal?: AbortSignal,
  ): Promise<PerformanceResponse> {
    const { data } = await api.get<PerformanceResponse>("/performance", {
      params: { month },
      signal,
    });
    return data;
  },
};
