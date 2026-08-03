import { api } from "@/lib/api/axios";
import type {
  CurrentPerformance,
  PartnerProfile,
  PartnerProgram,
} from "./performance.types";

export const performanceService = {
  /** GET /performance/me */
  async getMe(): Promise<PartnerProfile> {
    const { data } = await api.get<PartnerProfile>("/performance/me");
    return data;
  },

  /** GET /performance/program */
  async getProgram(): Promise<PartnerProgram> {
    const { data } = await api.get<PartnerProgram>("/performance/program");
    return data;
  },

  /** GET /performance/current */
  async getCurrent(): Promise<CurrentPerformance> {
    const { data } = await api.get<CurrentPerformance>("/performance/current");
    return data;
  },
};
