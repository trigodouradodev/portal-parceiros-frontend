import api from "@/lib/api/axios";
import type {
  CreateFollowUpPayload,
  FollowUpResponse,
} from "./followup.types";

export const followupService = {
  async createFollowUp(
    payload: CreateFollowUpPayload,
  ): Promise<FollowUpResponse> {
    const { data } = await api.post<FollowUpResponse>("/follow-up", payload);
    return data;
  },
};
