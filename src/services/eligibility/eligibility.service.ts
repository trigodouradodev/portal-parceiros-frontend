import api from "@/lib/api/axios";
import type {
  CheckEligibilityPayload,
  EligibilityResult,
} from "./eligibility.types";

export const eligibilityService = {
  async check(payload: CheckEligibilityPayload): Promise<EligibilityResult> {
    const { data } = await api.post<EligibilityResult>("/eligibility", payload);
    return data;
  },
};
