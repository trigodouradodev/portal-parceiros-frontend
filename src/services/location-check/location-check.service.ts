import api from "@/lib/api/axios";
import type {
  LocationCheckResult,
  VerifyLocationPayload,
} from "./location-check.types";

export const locationCheckService = {
  async verifyLocation(
    payload: VerifyLocationPayload,
  ): Promise<LocationCheckResult> {
    const { data } = await api.post<LocationCheckResult>(
      "/location-check",
      payload,
    );
    return data;
  },
};
