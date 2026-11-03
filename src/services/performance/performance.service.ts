import { api } from "@/lib/api/axios";
import type {
  PerformanceMonthsResponse,
  PerformanceResponse,
  PerformancePerson,
} from "./performance.types";

export const performanceService = {
  async getPartners(
    month?: string,
    signal?: AbortSignal,
  ): Promise<PerformancePerson[]> {
    const { data } = await api.get<PerformancePerson[]>(
      "/performance/partners",
      { params: { month }, signal },
    );
    return data;
  },
  async getTeam(
    partnerId: string,
    month?: string,
    signal?: AbortSignal,
  ): Promise<PerformancePerson[]> {
    const { data } = await api.get<PerformancePerson[]>("/performance/team", {
      params: { partnerId, month },
      signal,
    });
    return data;
  },
  async getMonths(
    signal?: AbortSignal,
    partnerId?: string,
  ): Promise<PerformanceMonthsResponse> {
    const { data } = await api.get<PerformanceMonthsResponse>(
      "/performance/months",
      { signal, ...(partnerId ? { params: { partnerId } } : {}) },
    );
    return data;
  },

  async getPerformance(
    month?: string,
    signal?: AbortSignal,
    partnerId?: string,
    memberId?: string,
  ): Promise<PerformanceResponse> {
    const { data } = await api.get<PerformanceResponse>("/performance", {
      params: {
        month,
        ...(partnerId ? { partnerId } : {}),
        ...(memberId ? { memberId } : {}),
      },
      signal,
    });
    return data;
  },
};
