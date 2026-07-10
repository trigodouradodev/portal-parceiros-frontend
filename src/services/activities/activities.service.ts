import api from "@/lib/api/axios";
import type {
  RegisterInteractionPayload,
  RegisterInteractionResponse,
  TodayQueue,
} from "./activities.types";

export const activitiesService = {
  async getTodayQueue(page = 1, limit = 30): Promise<TodayQueue> {
    const { data } = await api.get<TodayQueue>("/activities/tasks/today", {
      params: { page, limit },
    });
    return data;
  },

  async registerInteraction(
    taskId: string,
    payload: RegisterInteractionPayload,
  ): Promise<RegisterInteractionResponse> {
    const { data } = await api.post<RegisterInteractionResponse>(
      `/activities/tasks/${taskId}/interactions`,
      payload,
    );
    return data;
  },
};
